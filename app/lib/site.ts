export const SITE_NAME = 'Taverna dos Jogos'
export const SITE_URL = 'https://tavernadosjogos.com.br'
export const SITE_DESCRIPTION = 'Pokédex, biblioteca de cartas de Hearthstone, desafios diários, Hearthdle, deckbuilder e duelos entre jogadores.'

export type World = 'pokemon' | 'hearthstone' | 'neutral'

export const HEARTHSTONE_MODE_PREFIX = 'hs-'

export function getWorld(pathname: string): World {
    if (pathname.startsWith('/pokemon')) return 'pokemon'
    if (pathname.startsWith('/hearthstone')) return 'hearthstone'
    const mode = pathname.match(/^\/desafios\/([^/]+)/)?.[1]
    if (mode) return mode.startsWith(HEARTHSTONE_MODE_PREFIX) ? 'hearthstone' : 'pokemon'
    return 'neutral'
}
