import type { PokemonData, SpriteTree } from "./pokeapi";

const SPRITES_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites'

export interface Sprite {
    label: string;
    url: string;
}

const DEFAULT_PRIORITY = [
    'other / home / front_default',
    'versions / generation-vii / lets-go-pikachu-lets-go-eevee / front_shiny_female',
    'other / official-artwork / front_default',
    'front_default',
]

const SHINY_PRIORITY = [
    'other / home / front_shiny',
    'other / official-artwork / front_shiny',
    'front_shiny',
]

const collectSprites = (tree: SpriteTree, path: string[] = []): Sprite[] =>
    Object.entries(tree).flatMap(([key, value]) => {
        if (path.at(-1) === 'versions' && key === 'generation-viii') return []
        if (!value) return []
        if (typeof value === 'string') return [{ label: [...path, key].join(' / '), url: value }]
        return collectSprites(value, [...path, key])
    })

export const getAllSprites = (pokemon: PokemonData) =>
    collectSprites(pokemon.sprites)
        .filter((sprite, index, all) => all.findIndex(({ url }) => url === sprite.url) === index)

export function getMainSprite(pokemon: PokemonData, shiny = false) {
    const sprites = getAllSprites(pokemon)
    const priority = shiny ? SHINY_PRIORITY : DEFAULT_PRIORITY
    const found = priority
        .map((label) => sprites.find((sprite) => sprite.label === label))
        .find(Boolean)
    return found?.url ?? (shiny ? undefined : sprites[0]?.url)
}

export const getSpeciesArtwork = (speciesId: number) => `${SPRITES_URL}/pokemon/other/home/${speciesId}.png`

export const getOfficialArtwork = (speciesId: number) => `${SPRITES_URL}/pokemon/other/official-artwork/${speciesId}.png`

export const getItemSprite = (item: string) => `${SPRITES_URL}/items/${item}.png`
