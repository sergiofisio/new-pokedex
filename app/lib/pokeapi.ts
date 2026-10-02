import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_POKEMON_API_URL

export interface Species {
    name: string;
    url: string;
}

interface NamedResource {
    name: string;
    url: string;
}

export type SpriteTree = {
    [key: string]: string | null | SpriteTree;
}

export interface PokemonData {
    id: number;
    name: string;
    height: number;
    weight: number;
    is_default: boolean;
    species: Species;
    sprites: SpriteTree;
    types: {
        slot: number;
        type: NamedResource;
    }[];
    stats: {
        base_stat: number;
        stat: NamedResource;
    }[];
    abilities: {
        is_hidden: boolean;
        ability: NamedResource;
    }[];
    cries?: {
        latest: string | null;
        legacy: string | null;
    };
    moves: {
        move: NamedResource;
        version_group_details: {
            level_learned_at: number;
            move_learn_method: NamedResource;
            version_group: NamedResource;
        }[];
    }[];
}

export interface MoveDetail {
    name: string;
    power: number | null;
    accuracy: number | null;
    pp: number | null;
    type: NamedResource;
    damage_class: NamedResource;
}

export interface LearnedMove {
    move: MoveDetail;
    method: string;
    level: number;
}

interface Generation {
    id: number;
    pokemon_species: Species[];
}

export interface SpeciesDetail {
    id: number;
    name: string;
    is_baby: boolean;
    is_legendary: boolean;
    is_mythical: boolean;
    capture_rate: number;
    evolution_chain: {
        url: string;
    };
    flavor_text_entries: {
        flavor_text: string;
        language: NamedResource;
    }[];
    genera: {
        genus: string;
        language: NamedResource;
    }[];
    varieties: {
        is_default: boolean;
        pokemon: NamedResource;
    }[];
}

export interface EvolutionDetail {
    trigger: NamedResource;
    item: NamedResource | null;
    held_item: NamedResource | null;
    known_move: NamedResource | null;
    known_move_type: NamedResource | null;
    location: NamedResource | null;
    min_level: number | null;
    min_happiness: number | null;
    min_affection: number | null;
    time_of_day: string;
    near_special_rock?: boolean;
    is_default?: boolean;
    version_group?: NamedResource | null;
}

export interface ChainLink {
    is_baby: boolean;
    species: Species;
    evolution_details: EvolutionDetail[];
    evolves_to: ChainLink[];
}

interface EvolutionChain {
    chain: ChainLink;
}

export interface PokedexEntry {
    species: SpeciesDetail;
    chain: ChainLink;
    varieties: PokemonData[];
}

const requestCache = new Map<string, Promise<unknown>>()

export function cachedGet<T>(url: string): Promise<T> {
    const cached = requestCache.get(url)
    if (cached) return cached as Promise<T>

    const request = axios.get<T>(url)
        .then(({ data }) => data)
        .catch((error) => {
            requestCache.delete(url)
            throw error
        })
    requestCache.set(url, request)
    return request
}

export const getSpeciesId = (url: string) => Number(url.split('/').filter(Boolean).at(-1))

const getBaseSpecies = ({ chain }: EvolutionChain) =>
    chain.is_baby ? chain.evolves_to[0]?.species ?? chain.species : chain.species

export async function mapWithLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>) {
    const results: R[] = new Array(items.length)
    let next = 0
    const worker = async () => {
        while (next < items.length) {
            const index = next++
            results[index] = await fn(items[index])
        }
    }
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
    return results
}

export async function fetchBaseFormsOfGeneration(generation: number, concurrency: number) {
    const data = await cachedGet<Generation>(`${API_URL}generation/${generation}/`)
    const generationSpecies = new Set(data.pokemon_species.map(({ name }) => name))

    const speciesDetails = await mapWithLimit(data.pokemon_species, concurrency, ({ url }) =>
        cachedGet<SpeciesDetail>(url)
    )
    const chainUrls = [...new Set(speciesDetails.map(({ evolution_chain }) => evolution_chain.url))]

    const chains = await mapWithLimit(chainUrls, concurrency, (url) => cachedGet<EvolutionChain>(url))

    return chains
        .map(getBaseSpecies)
        .filter(({ name }) => generationSpecies.has(name))
        .sort((a, b) => getSpeciesId(a.url) - getSpeciesId(b.url))
}

export async function fetchAllSpecies() {
    const data = await cachedGet<{ results: Species[] }>(`${API_URL}pokemon-species/?limit=2000`)
    return data.results
}

const normalizeSearch = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '')

export function searchSpecies(species: Species[], query: string) {
    const number = query.trim().replace(/^#/, '')
    if (/^\d+$/.test(number)) {
        const id = Number(number)
        return species.filter((item) => String(getSpeciesId(item.url)).startsWith(String(id)))
    }
    const term = normalizeSearch(query)
    if (!term) return []
    return species
        .filter(({ name }) => normalizeSearch(name).includes(term))
        .sort((a, b) => Number(normalizeSearch(b.name).startsWith(term)) - Number(normalizeSearch(a.name).startsWith(term)))
}

export function fetchPokemon(id: number) {
    return cachedGet<PokemonData>(`${API_URL}pokemon/${id}/`)
}

export async function fetchLearnedMoves(pokemonName: string): Promise<LearnedMove[]> {
    const pokemon = await cachedGet<PokemonData>(`${API_URL}pokemon/${pokemonName}/`)

    const learned = pokemon.moves.map(({ move, version_group_details }) => {
        const latest = version_group_details.reduce((best, detail) =>
            getSpeciesId(detail.version_group.url) > getSpeciesId(best.version_group.url) ? detail : best
        )
        return { url: move.url, method: latest.move_learn_method.name, level: latest.level_learned_at }
    })

    const details = await mapWithLimit(learned, 10, ({ url }) => cachedGet<MoveDetail>(url))

    return learned.map(({ method, level }, index) => ({ move: details[index], method, level }))
}

export async function fetchPokedexEntry(speciesId: number): Promise<PokedexEntry> {
    const species = await cachedGet<SpeciesDetail>(`${API_URL}pokemon-species/${speciesId}/`)

    const [{ chain }, varieties] = await Promise.all([
        cachedGet<EvolutionChain>(species.evolution_chain.url),
        Promise.all(
            species.varieties.map(({ pokemon }) => cachedGet<PokemonData>(pokemon.url).catch(() => null))
        ),
    ])

    return { species, chain, varieties: varieties.filter((variety) => variety !== null) }
}
