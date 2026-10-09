import { decode, encode, type FormatType } from "deckstrings";
import { CRAFT_COST, canonicalId, isStandard, maxCopies, type HsCard, type HsData, type HsFormat } from "./hearthstone";
import { ownedCopies, type Collection } from "./hsCollection";
import META_DECKS from "../data/hs-meta-decks.json";

export const DECK_SIZE = 30
export const LARGE_DECK_SIZE = 40
const RENATHAL = new Set([79767, 89927, 111689])

export const HERO_DBF: Record<string, number> = {
    DEATHKNIGHT: 78065, DEMONHUNTER: 56550, DRUID: 274, HUNTER: 31, MAGE: 637, PALADIN: 671,
    PRIEST: 813, ROGUE: 930, SHAMAN: 1066, WARLOCK: 893, WARRIOR: 7,
}
const HERO_CLASS = Object.fromEntries(Object.entries(HERO_DBF).map(([cls, dbf]) => [dbf, cls]))

const FORMAT_CODE: Record<HsFormat, FormatType> = { wild: 1, standard: 2 }

export interface Deck {
    cls: string
    format: HsFormat
    cards: Record<number, number>
    sideboard: [number, number, number][]
}

export interface MetaDeck {
    name: string
    class: string
    format: string
    code: string
    cards: [number, number][]
    sideboard: [number, number, number][]
}

export const META: MetaDeck[] = META_DECKS as MetaDeck[]

export const emptyDeck = (cls: string, format: HsFormat): Deck => ({ cls, format, cards: {}, sideboard: [] })

export const deckSize = (deck: Deck) => Object.values(deck.cards).reduce((sum, count) => sum + count, 0)

export const deckLimit = (deck: Deck) =>
    Object.keys(deck.cards).some((id) => RENATHAL.has(Number(id))) ? LARGE_DECK_SIZE : DECK_SIZE

export const deckEntries = (data: HsData, deck: Deck) =>
    Object.entries(deck.cards)
        .flatMap(([id, count]) => {
            const card = data.byDbf.get(Number(id))
            return card ? [{ card, count }] : []
        })
        .sort((a, b) => a.card.cost - b.card.cost || a.card.name[1].localeCompare(b.card.name[1]))

export const isClassCard = (card: HsCard, cls: string) => card.classes.includes(cls) || card.classes.includes('NEUTRAL')

export type AddBlock = 'full' | 'copies' | 'class' | 'format' | 'bundled'

export function addBlock(data: HsData, deck: Deck, card: HsCard): AddBlock | null {
    if (card.bundled) return 'bundled'
    if (!isClassCard(card, deck.cls)) return 'class'
    if (deck.format === 'standard' && !isStandard(data, card)) return 'format'
    if ((deck.cards[card.dbfId] ?? 0) >= maxCopies(card)) return 'copies'
    if (deckSize(deck) >= deckLimit(deck) && !RENATHAL.has(card.dbfId)) return 'full'
    return null
}

export function addCard(deck: Deck, card: HsCard): Deck {
    return { ...deck, cards: { ...deck.cards, [card.dbfId]: (deck.cards[card.dbfId] ?? 0) + 1 } }
}

export function removeCard(deck: Deck, card: HsCard): Deck {
    const cards = { ...deck.cards }
    if ((cards[card.dbfId] ?? 0) <= 1) delete cards[card.dbfId]
    else cards[card.dbfId] -= 1
    return { ...deck, cards, sideboard: deck.sideboard.filter(([, , owner]) => owner in cards) }
}

export function encodeDeck(deck: Deck) {
    return encode({
        cards: Object.entries(deck.cards).map(([id, count]) => [Number(id), count]),
        sideboardCards: deck.sideboard,
        heroes: [HERO_DBF[deck.cls] ?? HERO_DBF.MAGE],
        format: FORMAT_CODE[deck.format],
    })
}

function inferClass(data: HsData, cards: [number, number][], heroes: number[]) {
    if (HERO_CLASS[heroes[0]]) return HERO_CLASS[heroes[0]]
    const counts = new Map<string, number>()
    for (const [dbfId, count] of cards) {
        for (const cls of data.byDbf.get(dbfId)?.classes ?? []) {
            if (cls !== 'NEUTRAL') counts.set(cls, (counts.get(cls) ?? 0) + count)
        }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'MAGE'
}

export type DecodeResult = { deck: Deck; unknown: number } | { error: true }

export function decodeDeck(data: HsData, code: string): DecodeResult {
    const cleaned = code.trim().split(/\s+/).find((part) => /^AA[A-Za-z0-9+/=]{10,}$/.test(part)) ?? code.trim()
    try {
        const definition = decode(cleaned)
        const known = definition.cards.filter(([dbfId]) => data.byDbf.has(dbfId))
        return {
            deck: {
                cls: inferClass(data, definition.cards, definition.heroes),
                format: definition.format === 2 ? 'standard' : 'wild',
                cards: Object.fromEntries(known),
                sideboard: definition.sideboardCards,
            },
            unknown: definition.cards.length - known.length,
        }
    } catch {
        return { error: true }
    }
}

export interface DeckCost {
    total: number
    missing: number
    missingCards: { card: HsCard; count: number }[]
    owned: number
}

export function deckCost(data: HsData, deck: Deck, owned: Collection): DeckCost {
    let total = 0
    let missing = 0
    let ownedCount = 0
    const missingCards: DeckCost['missingCards'] = []
    for (const { card, count } of deckEntries(data, deck)) {
        const have = Math.min(count, ownedCopies(owned, card))
        const lacking = count - have
        total += CRAFT_COST[card.rarity] * (card.bundled ? 0 : count)
        ownedCount += have
        if (lacking > 0) {
            missing += CRAFT_COST[card.rarity] * lacking
            missingCards.push({ card, count: lacking })
        }
    }
    return { total, missing, missingCards, owned: ownedCount }
}

export function manaCurve(data: HsData, deck: Deck, buckets = 8) {
    const curve = Array<number>(buckets).fill(0)
    for (const { card, count } of deckEntries(data, deck)) curve[Math.min(card.cost, buckets - 1)] += count
    return curve
}

export function typeCounts(data: HsData, deck: Deck) {
    const counts: Record<string, number> = {}
    for (const { card, count } of deckEntries(data, deck)) counts[card.type] = (counts[card.type] ?? 0) + count
    return counts
}

export function suggestSubstitutes(data: HsData, deck: Deck, missing: HsCard, owned: Collection, limit = 3) {
    const tribe = new Set([...missing.races, missing.spellSchool].filter(Boolean))
    const mechanics = new Set(missing.mechanics)
    return data.unique
        .filter((card) =>
            card.dbfId !== missing.dbfId
            && !card.bundled
            && card.type === missing.type
            && Math.abs(card.cost - missing.cost) <= 1
            && isClassCard(card, deck.cls)
            && (deck.format === 'wild' || isStandard(data, card))
            && ownedCopies(owned, card) > (deck.cards[card.dbfId] ?? 0))
        .map((card) => {
            const sharedMechanics = card.mechanics.filter((mechanic) => mechanics.has(mechanic)).length
            const sharedTribe = [...card.races, card.spellSchool].some((value) => value && tribe.has(value)) ? 1 : 0
            const sameClass = card.classes.includes(deck.cls) === missing.classes.includes(deck.cls) ? 1 : 0
            const score = (card.cost === missing.cost ? 3 : 0) + sharedMechanics * 2 + sharedTribe * 2 + sameClass
                + (missing.attack !== undefined && card.attack === missing.attack ? 0.5 : 0)
                + (missing.health !== undefined && card.health === missing.health ? 0.5 : 0)
            return { card, score }
        })
        .sort((a, b) => b.score - a.score || canonicalId(a.card) - canonicalId(b.card))
        .slice(0, limit)
        .map(({ card }) => card)
}

export function metaToDeck(meta: MetaDeck): Deck {
    return {
        cls: meta.class,
        format: meta.format === 'standard' ? 'standard' : 'wild',
        cards: Object.fromEntries(meta.cards),
        sideboard: meta.sideboard,
    }
}
