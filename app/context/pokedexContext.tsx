'use client'

import { createContext, useCallback, useContext, useEffect, useReducer, useRef, type ReactNode } from "react";
import { GENERATIONS } from "../components/generationMenu";
import {
    fetchBaseFormsOfGeneration,
    fetchPokemon,
    getSpeciesId,
    mapWithLimit,
    type PokemonData,
    type Species,
} from "../lib/pokeapi";

const FOREGROUND_CONCURRENCY = 20
const BACKGROUND_CONCURRENCY = 4

type GenerationState =
    | { status: 'success'; pokemonList: Species[] }
    | { status: 'error' }

interface PokedexState {
    generations: Record<number, GenerationState>;
    pokemon: Record<number, PokemonData>;
}

type PokedexAction =
    | { type: 'generationLoaded'; generation: number; pokemonList: Species[] }
    | { type: 'generationFailed'; generation: number }
    | { type: 'pokemonLoaded'; pokemon: PokemonData[] }

function pokedexReducer(state: PokedexState, action: PokedexAction): PokedexState {
    switch (action.type) {
        case 'generationLoaded':
            return {
                ...state,
                generations: { ...state.generations, [action.generation]: { status: 'success', pokemonList: action.pokemonList } },
            }
        case 'generationFailed':
            return {
                ...state,
                generations: { ...state.generations, [action.generation]: { status: 'error' } },
            }
        case 'pokemonLoaded':
            return {
                ...state,
                pokemon: { ...state.pokemon, ...Object.fromEntries(action.pokemon.map((pokemon) => [pokemon.id, pokemon])) },
            }
    }
}

interface PokedexContextValue extends PokedexState {
    loadGeneration: (generation: number) => Promise<Species[]>;
    loadPokemon: (id: number) => Promise<PokemonData | null>;
}

const PokedexContext = createContext<PokedexContextValue | null>(null)

export function PokedexProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(pokedexReducer, { generations: {}, pokemon: {} })
    const generationRequests = useRef(new Map<number, Promise<Species[]>>())
    const pokemonRequests = useRef(new Map<number, Promise<PokemonData | null>>())

    const requestPokemon = useCallback((id: number) => {
        const cached = pokemonRequests.current.get(id)
        if (cached) return cached

        const request = fetchPokemon(id).catch((error) => {
            console.error(error)
            pokemonRequests.current.delete(id)
            return null
        })
        pokemonRequests.current.set(id, request)
        return request
    }, [])

    const loadPokemon = useCallback(async (id: number) => {
        const pokemon = await requestPokemon(id)
        if (pokemon) dispatch({ type: 'pokemonLoaded', pokemon: [pokemon] })
        return pokemon
    }, [requestPokemon])

    const requestGeneration = useCallback((generation: number, concurrency: number) => {
        const cached = generationRequests.current.get(generation)
        if (cached) return cached

        const request = fetchBaseFormsOfGeneration(generation, concurrency)
            .then((pokemonList) => {
                dispatch({ type: 'generationLoaded', generation, pokemonList })
                return pokemonList
            })
            .catch((error) => {
                console.error(error)
                generationRequests.current.delete(generation)
                dispatch({ type: 'generationFailed', generation })
                return []
            })
        generationRequests.current.set(generation, request)
        return request
    }, [])

    const loadGeneration = useCallback(
        (generation: number) => requestGeneration(generation, FOREGROUND_CONCURRENCY),
        [requestGeneration]
    )

    useEffect(() => {
        let cancelled = false

        const preloadAll = async () => {
            for (const { id } of GENERATIONS) {
                if (cancelled) return
                const pokemonList = await requestGeneration(id, BACKGROUND_CONCURRENCY)
                if (cancelled) return
                const pokemon = await mapWithLimit(pokemonList, BACKGROUND_CONCURRENCY, ({ url }) =>
                    requestPokemon(getSpeciesId(url))
                )
                if (cancelled) return
                dispatch({ type: 'pokemonLoaded', pokemon: pokemon.filter((item) => item !== null) })
            }
        }
        preloadAll()

        return () => { cancelled = true }
    }, [requestGeneration, requestPokemon])

    return (
        <PokedexContext.Provider value={{ ...state, loadGeneration, loadPokemon }}>
            {children}
        </PokedexContext.Provider>
    )
}

export function usePokedex() {
    const context = useContext(PokedexContext)
    if (!context) throw new Error('usePokedex precisa estar dentro de <PokedexProvider>')
    return context
}
