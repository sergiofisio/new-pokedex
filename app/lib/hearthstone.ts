import HS_POOL from "../data/hs-pool.json";
import type { Language } from "../i18n/translations";

export { HS_POOL }
export const HS_POOL_SIZE = HS_POOL.length

export type HsCardType = 'MINION' | 'SPELL' | 'WEAPON' | 'HERO' | 'LOCATION'
export type HsRarity = 'FREE' | 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'

export interface HsSet {
    id: string
    name: [string, string]
    year: number
    standard: boolean
}

export interface HsCard {
    dbfId: number
    id: string
    name: [string, string]
    cost: number
    type: HsCardType
    rarity: HsRarity
    set: number
    classes: string[]
    attack?: number
    health?: number
    armor?: number
    races: string[]
    spellSchool?: string
    mechanics: string[]
    runes?: Record<string, number>
    copyOf?: number
    artist?: string
    unique: boolean
    bundled: boolean
}

export interface HsData {
    sets: HsSet[]
    cards: HsCard[]
    unique: HsCard[]
    byDbf: Map<number, HsCard>
}

interface RawCard {
    d: number; i: string; n: [string, string]; c: number; t: HsCardType; r: HsRarity; s: number; k: string[]
    a?: number; h?: number; am?: number; ra?: string[]; sc?: string; m?: string[]; ru?: Record<string, number>; o?: number; ar?: string; u?: 1; b?: 1
}

let dataPromise: Promise<HsData> | null = null

export function loadHsData(): Promise<HsData> {
    dataPromise ??= fetch('/data/hs-cards.json')
        .then((response) => {
            if (!response.ok) throw new Error(`hs-cards: HTTP ${response.status}`)
            return response.json() as Promise<{ sets: HsSet[]; cards: RawCard[] }>
        })
        .then(({ sets, cards: raw }) => {
            const cards: HsCard[] = raw.map((card) => ({
                dbfId: card.d,
                id: card.i,
                name: card.n,
                cost: card.c,
                type: card.t,
                rarity: card.r,
                set: card.s,
                classes: card.k,
                attack: card.a,
                health: card.h,
                armor: card.am,
                races: card.ra ?? [],
                spellSchool: card.sc,
                mechanics: card.m ?? [],
                runes: card.ru,
                copyOf: card.o,
                artist: card.ar,
                unique: card.u === 1,
                bundled: card.b === 1,
            }))
            return { sets, cards, unique: cards.filter((card) => card.unique), byDbf: new Map(cards.map((card) => [card.dbfId, card])) }
        })
        .catch((error) => {
            dataPromise = null
            throw error
        })
    return dataPromise
}

export type HsTexts = Record<string, [string, string]>
const textPromises: Partial<Record<Language, Promise<HsTexts>>> = {}

export function loadHsTexts(language: Language): Promise<HsTexts> {
    textPromises[language] ??= fetch(`/data/hs-texts-${language}.json`)
        .then((response) => {
            if (!response.ok) throw new Error(`hs-texts: HTTP ${response.status}`)
            return response.json() as Promise<HsTexts>
        })
        .catch((error) => {
            delete textPromises[language]
            throw error
        })
    return textPromises[language]
}

const pick = <T,>(pair: [T, T], language: Language) => (language === 'en' ? pair[1] : pair[0])

export const cardName = (card: HsCard, language: Language) => pick(card.name, language)
export const setName = (set: HsSet, language: Language) => pick(set.name, language)

const ART = 'https://art.hearthstonejson.com/v1'

export const cardRender = (card: Pick<HsCard, 'id'>, language: Language, size: 256 | 512 = 256) =>
    `${ART}/render/latest/${language === 'en' ? 'enUS' : 'ptBR'}/${size}x/${card.id}.png`
export const cardArt = (card: Pick<HsCard, 'id'>, size: 256 | 512 = 512) => `${ART}/${size}x/${card.id}.jpg`
export const cardTile = (card: Pick<HsCard, 'id'>) => `${ART}/tiles/${card.id}.png`

export const HS_CLASSES = ['DEATHKNIGHT', 'DEMONHUNTER', 'DRUID', 'HUNTER', 'MAGE', 'PALADIN', 'PRIEST', 'ROGUE', 'SHAMAN', 'WARLOCK', 'WARRIOR', 'NEUTRAL'] as const
export type HsClass = typeof HS_CLASSES[number]
export const HS_HERO_CLASSES = HS_CLASSES.filter((cls) => cls !== 'NEUTRAL')

export const HS_TYPES: HsCardType[] = ['MINION', 'SPELL', 'WEAPON', 'HERO', 'LOCATION']
export const HS_RARITIES: HsRarity[] = ['FREE', 'COMMON', 'RARE', 'EPIC', 'LEGENDARY']

export const CRAFT_COST: Record<HsRarity, number> = { FREE: 0, COMMON: 40, RARE: 100, EPIC: 400, LEGENDARY: 1600 }

export const CLASS_COLORS: Record<string, string> = {
    DEATHKNIGHT: '#4b6b8a',
    DEMONHUNTER: '#2f6b3a',
    DRUID: '#8a5a2b',
    HUNTER: '#3d7a2a',
    MAGE: '#3b6fd1',
    PALADIN: '#c9a227',
    PRIEST: '#c8c8c8',
    ROGUE: '#4a4a4a',
    SHAMAN: '#2d4fa3',
    WARLOCK: '#7a3fa0',
    WARRIOR: '#9e2b25',
    NEUTRAL: '#8c7a62',
}

export const RARITY_COLORS: Record<HsRarity, string> = {
    FREE: '#a1a1aa',
    COMMON: '#e4e4e7',
    RARE: '#3b82f6',
    EPIC: '#a855f7',
    LEGENDARY: '#f59e0b',
}

const LABELS: Record<string, [string, string]> = {
    DEATHKNIGHT: ['Cavaleiro da Morte', 'Death Knight'],
    DEMONHUNTER: ['Caçador de Demônios', 'Demon Hunter'],
    DRUID: ['Druida', 'Druid'],
    HUNTER: ['Caçador', 'Hunter'],
    MAGE: ['Mago', 'Mage'],
    PALADIN: ['Paladino', 'Paladin'],
    PRIEST: ['Sacerdote', 'Priest'],
    ROGUE: ['Ladino', 'Rogue'],
    SHAMAN: ['Xamã', 'Shaman'],
    WARLOCK: ['Bruxo', 'Warlock'],
    WARRIOR: ['Guerreiro', 'Warrior'],
    NEUTRAL: ['Neutra', 'Neutral'],
    MINION: ['Lacaio', 'Minion'],
    SPELL: ['Feitiço', 'Spell'],
    WEAPON: ['Arma', 'Weapon'],
    HERO: ['Herói', 'Hero'],
    LOCATION: ['Local', 'Location'],
    FREE: ['Básica', 'Free'],
    COMMON: ['Comum', 'Common'],
    RARE: ['Rara', 'Rare'],
    EPIC: ['Épica', 'Epic'],
    LEGENDARY: ['Lendária', 'Legendary'],
    UNDEAD: ['Morto-vivo', 'Undead'],
    DRAGON: ['Dragão', 'Dragon'],
    DEMON: ['Demônio', 'Demon'],
    PIRATE: ['Pirata', 'Pirate'],
    BEAST: ['Fera', 'Beast'],
    DRAENEI: ['Draenei', 'Draenei'],
    TOTEM: ['Totem', 'Totem'],
    MURLOC: ['Murloc', 'Murloc'],
    ELEMENTAL: ['Elemental', 'Elemental'],
    MECHANICAL: ['Mecanoide', 'Mech'],
    QUILBOAR: ['Javatusco', 'Quilboar'],
    NAGA: ['Naga', 'Naga'],
    ALL: ['Todos', 'All'],
    FIRE: ['Fogo', 'Fire'],
    ARCANE: ['Arcano', 'Arcane'],
    HOLY: ['Sagrado', 'Holy'],
    SHADOW: ['Sombra', 'Shadow'],
    FEL: ['Vil', 'Fel'],
    NATURE: ['Natureza', 'Nature'],
    FROST: ['Gelo', 'Frost'],
    BLOOD: ['Sangue', 'Blood'],
}

export const hsLabel = (value: string, language: Language) =>
    LABELS[value] ? pick(LABELS[value], language) : value.charAt(0) + value.slice(1).toLowerCase()

export const cardClassLabel = (card: HsCard, language: Language) =>
    card.classes.map((cls) => hsLabel(cls, language)).join(' / ')

export const cardTribe = (card: HsCard) => card.races.length ? card.races : card.spellSchool ? [card.spellSchool] : []

export const HS_FORMATS = ['standard', 'wild'] as const
export type HsFormat = typeof HS_FORMATS[number]

export const isStandard = (data: HsData, card: HsCard) => data.sets[card.set]?.standard ?? false

export const canonicalId = (card: Pick<HsCard, 'dbfId' | 'copyOf'>) => card.copyOf ?? card.dbfId
export const maxCopies = (card: Pick<HsCard, 'rarity'>) => (card.rarity === 'LEGENDARY' ? 1 : 2)

export function searchCards(cards: HsCard[], query: string, language: Language) {
    const normalized = normalizeSearch(query)
    if (!normalized) return []
    return cards
        .filter((card) => normalizeSearch(cardName(card, language)).includes(normalized) || normalizeSearch(card.name[1]).includes(normalized))
        .sort((a, b) => {
            const aStarts = normalizeSearch(cardName(a, language)).startsWith(normalized)
            const bStarts = normalizeSearch(cardName(b, language)).startsWith(normalized)
            return Number(bStarts) - Number(aStarts) || cardName(a, language).localeCompare(cardName(b, language))
        })
}

export const normalizeSearch = (value: string) =>
    value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()

export type TextPart = { text: string; bold: boolean; italic: boolean }

export function parseCardText(text: string): TextPart[] {
    const parts: TextPart[] = []
    let bold = false
    let italic = false
    for (const token of text.split(/(<\/?[bi]>)/)) {
        if (token === '<b>') bold = true
        else if (token === '</b>') bold = false
        else if (token === '<i>') italic = true
        else if (token === '</i>') italic = false
        else if (token) parts.push({ text: token, bold, italic })
    }
    return parts
}

export const stripCardText = (text: string) => text.replace(/<\/?[bi]>/g, '')
