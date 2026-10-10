import { readFile } from "node:fs/promises";
import path from "node:path";
import META_DECKS from "../data/hs-meta-decks.json";
import type { Language } from "../i18n/translations";
import { canonicalId, cardSlug, parseHsData, setSlug, type HsCard, type HsData, type HsSet, type HsTexts, type RawHsData } from "./hearthstone";

const DATA_DIR = path.join(process.cwd(), 'public', 'data')

let dataPromise: Promise<HsData> | null = null
const textPromises: Partial<Record<Language, Promise<HsTexts>>> = {}

const readJson = async <T,>(file: string) => JSON.parse(await readFile(path.join(DATA_DIR, file), 'utf8')) as T

export function getHsServerData() {
    dataPromise ??= readJson<RawHsData>('hs-cards.json').then(parseHsData).catch((error) => {
        dataPromise = null
        throw error
    })
    return dataPromise
}

function getHsServerTexts(language: Language) {
    textPromises[language] ??= readJson<HsTexts>(`hs-texts-${language}.json`).catch((error) => {
        delete textPromises[language]
        throw error
    })
    return textPromises[language]
}

export interface CardLink {
    dbfId: number
    id: string
    slug: string
    name: [string, string]
    cost: number
    rarity: HsCard['rarity']
}

export interface MetaDeckRef {
    name: string
    class: string
    format: string
    copies: number
}

export interface CardPageData {
    card: HsCard
    slug: string
    set: HsSet
    texts: Record<Language, [string, string]>
    reprints: HsSet[]
    related: CardLink[]
    decks: MetaDeckRef[]
}

export const toCardLink = (card: HsCard): CardLink => ({
    dbfId: card.dbfId,
    id: card.id,
    slug: cardSlug(card),
    name: card.name,
    cost: card.cost,
    rarity: card.rarity,
})

const byCost = (a: HsCard, b: HsCard) => a.cost - b.cost || a.name[0].localeCompare(b.name[0], 'pt')

export async function getCardSlugs() {
    const data = await getHsServerData()
    return data.unique.map(cardSlug)
}

export type CardLookup = { status: 'found'; data: CardPageData } | { status: 'redirect'; slug: string } | { status: 'missing' }

export async function getCardPage(slug: string): Promise<CardLookup> {
    const dbfId = Number(slug.match(/(\d+)$/)?.[1])
    if (!Number.isInteger(dbfId)) return { status: 'missing' }

    const data = await getHsServerData()
    const found = data.byDbf.get(dbfId)
    if (!found) return { status: 'missing' }

    const card = found.unique ? found : data.unique.find((other) => other.name[1] === found.name[1])
    if (!card) return { status: 'missing' }
    const canonicalSlug = cardSlug(card)
    if (canonicalSlug !== slug) return { status: 'redirect', slug: canonicalSlug }

    const [pt, en] = await Promise.all([getHsServerTexts('pt'), getHsServerTexts('en')])
    const textOf = (texts: HsTexts): [string, string] => texts[card.dbfId] ?? texts[canonicalId(card)] ?? ['', '']

    const reprints = [...new Set(
        data.cards
            .filter((other) => other.dbfId !== card.dbfId && other.name[1] === card.name[1] && other.set !== card.set)
            .map((other) => other.set),
    )].map((index) => data.sets[index]).filter(Boolean)

    const related = data.unique
        .filter((other) => other.dbfId !== card.dbfId && other.set === card.set && other.classes.some((cls) => card.classes.includes(cls)))
        .sort(byCost)
        .slice(0, 12)
        .map(toCardLink)

    const ids = new Set(data.cards.filter((other) => other.name[1] === card.name[1]).map((other) => other.dbfId))
    const decks = META_DECKS.flatMap((deck) => {
        const entry = deck.cards.find(([id]) => ids.has(id))
        return entry ? [{ name: deck.name, class: deck.class, format: deck.format, copies: entry[1] }] : []
    })

    return {
        status: 'found',
        data: {
            card,
            slug: canonicalSlug,
            set: data.sets[card.set],
            texts: { pt: textOf(pt), en: textOf(en) },
            reprints,
            related,
            decks,
        },
    }
}

export interface SetSummary {
    set: HsSet
    slug: string
    total: number
    byRarity: Record<HsCard['rarity'], number>
}

export async function getSetSummaries(): Promise<SetSummary[]> {
    const data = await getHsServerData()
    return data.sets
        .map((set, index) => {
            const cards = data.unique.filter((card) => card.set === index)
            const byRarity = { FREE: 0, COMMON: 0, RARE: 0, EPIC: 0, LEGENDARY: 0 }
            for (const card of cards) byRarity[card.rarity] += 1
            return { set, slug: setSlug(set), total: cards.length, byRarity }
        })
        .filter(({ total }) => total > 0)
}

export async function getSetPage(slug: string) {
    const data = await getHsServerData()
    const index = data.sets.findIndex((set) => setSlug(set) === slug)
    if (index < 0) return null
    const cards = data.unique.filter((card) => card.set === index).sort(byCost)
    if (!cards.length) return null
    return { set: data.sets[index], slug, cards: cards.map((card) => ({ ...toCardLink(card), classes: card.classes, type: card.type, bundled: card.bundled })) }
}
