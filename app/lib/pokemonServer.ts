import type { ChainLink, PokemonData, SpeciesDetail } from "./pokeapi";
import { getGenerationOfId, getSpeciesId } from "./pokeapi";

const API_URL = process.env.NEXT_PUBLIC_POKEMON_API_URL ?? 'https://pokeapi.co/api/v2/'
export const POKEMON_REVALIDATE = 60 * 60 * 24 * 30
export const LAST_POKEMON_ID = 1025

interface SpeciesExtra {
    names: { name: string; language: { name: string } }[];
    gender_rate: number;
    base_happiness: number | null;
    hatch_counter: number | null;
    growth_rate: { name: string } | null;
    egg_groups: { name: string }[];
    habitat: { name: string } | null;
}

export interface PokemonListItem {
    id: number;
    slug: string;
}

export interface PokemonProfile {
    id: number;
    slug: string;
    name: string;
    genus: string;
    generation: number;
    types: string[];
    height: number;
    weight: number;
    stats: { name: string; value: number }[];
    abilities: { name: string; hidden: boolean }[];
    moveCount: number;
    legendary: boolean;
    mythical: boolean;
    baby: boolean;
    captureRate: number;
    genderRate: number;
    baseHappiness: number | null;
    hatchCounter: number | null;
    growthRate: string | null;
    eggGroups: string[];
    color: string;
    forms: string[];
    chain: ChainLink;
    previous: PokemonListItem | null;
    next: PokemonListItem | null;
}

class NotFoundError extends Error {}

async function getJson<T>(path: string): Promise<T> {
    const url = path.startsWith('http') ? path : `${API_URL}${path}`
    const response = await fetch(url, { next: { revalidate: POKEMON_REVALIDATE } })
    if (response.status === 404) throw new NotFoundError(url)
    if (!response.ok) throw new Error(`PokeAPI ${response.status}: ${url}`)
    return response.json() as Promise<T>
}

export async function getPokemonList(): Promise<PokemonListItem[]> {
    const data = await getJson<{ results: { name: string; url: string }[] }>(`pokemon-species/?limit=${LAST_POKEMON_ID}`)
    return data.results
        .map(({ name, url }) => ({ id: getSpeciesId(url), slug: name }))
        .filter(({ id }) => id <= LAST_POKEMON_ID)
        .sort((a, b) => a.id - b.id)
}

export async function getPokemonProfile(slug: string): Promise<PokemonProfile | null> {
    if (!/^[a-z0-9-]+$/.test(slug)) return null
    try {
        const species = await getJson<SpeciesDetail & SpeciesExtra>(`pokemon-species/${slug}/`)
        if (species.id > LAST_POKEMON_ID || species.name !== slug) return null

        const defaultVariety = species.varieties.find(({ is_default }) => is_default) ?? species.varieties[0]
        const [pokemon, { chain }, list] = await Promise.all([
            getJson<PokemonData>(defaultVariety.pokemon.url),
            getJson<{ chain: ChainLink }>(species.evolution_chain.url),
            getPokemonList(),
        ])
        const index = list.findIndex(({ id }) => id === species.id)

        return {
            id: species.id,
            slug: species.name,
            name: species.names.find(({ language }) => language.name === 'en')?.name ?? species.name,
            genus: species.genera.find(({ language }) => language.name === 'en')?.genus ?? '',
            generation: getGenerationOfId(species.id),
            types: [...pokemon.types].sort((a, b) => a.slot - b.slot).map(({ type }) => type.name),
            height: pokemon.height,
            weight: pokemon.weight,
            stats: pokemon.stats.map(({ base_stat, stat }) => ({ name: stat.name, value: base_stat })),
            abilities: pokemon.abilities.map(({ ability, is_hidden }) => ({ name: ability.name, hidden: is_hidden })),
            moveCount: pokemon.moves.length,
            legendary: species.is_legendary,
            mythical: species.is_mythical,
            baby: species.is_baby,
            captureRate: species.capture_rate,
            genderRate: species.gender_rate,
            baseHappiness: species.base_happiness,
            hatchCounter: species.hatch_counter,
            growthRate: species.growth_rate?.name ?? null,
            eggGroups: species.egg_groups.map(({ name }) => name),
            color: species.color.name,
            forms: species.varieties.filter(({ is_default }) => !is_default).map(({ pokemon }) => pokemon.name),
            chain,
            previous: list[index - 1] ?? null,
            next: list[index + 1] ?? null,
        }
    } catch (error) {
        if (error instanceof NotFoundError) return null
        throw error
    }
}
