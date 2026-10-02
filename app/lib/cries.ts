import type { PokemonData } from "./pokeapi";

export type CrySource = 'modern' | 'classic'

const SHOWDOWN_CRIES_URL = 'https://play.pokemonshowdown.com/audio/cries'

const toShowdownId = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '')

function getShowdownCries(pokemon: PokemonData) {
    const species = pokemon.species.name
    const base = `${SHOWDOWN_CRIES_URL}/${toShowdownId(species)}.mp3`
    if (pokemon.name === species || !pokemon.name.startsWith(`${species}-`)) return [base]

    const form = toShowdownId(pokemon.name.slice(species.length + 1))
    return [`${SHOWDOWN_CRIES_URL}/${toShowdownId(species)}-${form}.mp3`, base]
}

export function getCryUrls(pokemon: PokemonData, source: CrySource) {
    const urls = source === 'classic'
        ? [pokemon.cries?.legacy]
        : [...getShowdownCries(pokemon), pokemon.cries?.latest]
    return urls.filter((url): url is string => Boolean(url))
}
