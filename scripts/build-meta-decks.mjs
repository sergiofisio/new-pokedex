import { readFile, writeFile } from 'node:fs/promises'
import { decode } from 'deckstrings'

const SOURCE = 'scripts/hs-meta-decks.source.json'
const OUTPUT = 'app/data/hs-meta-decks.json'
const FORMATS = { 1: 'wild', 2: 'standard', 3: 'classic', 4: 'twist' }
const DECK_SIZES = new Set([30, 40])

const { sets, cards } = JSON.parse(await readFile('public/data/hs-cards.json', 'utf8'))
const byDbf = new Map(cards.map((card) => [card.d, card]))
const source = JSON.parse(await readFile(SOURCE, 'utf8'))

function deckClass(list) {
    const counts = new Map()
    for (const [dbfId, count] of list) {
        for (const cls of byDbf.get(dbfId)?.k ?? []) {
            if (cls !== 'NEUTRAL') counts.set(cls, (counts.get(cls) ?? 0) + count)
        }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'NEUTRAL'
}

function validate(entry) {
    const deck = decode(entry.code)
    const format = FORMATS[deck.format]
    const errors = []
    const size = deck.cards.reduce((sum, [, count]) => sum + count, 0)
    if (!DECK_SIZES.has(size)) errors.push(`${size} cartas`)
    for (const [dbfId, count] of deck.cards) {
        const card = byDbf.get(dbfId)
        if (!card) {
            errors.push(`carta ${dbfId} desconhecida`)
            continue
        }
        if (count > (card.r === 'LEGENDARY' ? 1 : 2)) errors.push(`${card.n[1]} x${count}`)
        if (format === 'standard' && !sets[card.s].standard) errors.push(`${card.n[1]} fora do Padrão`)
    }
    return { deck, format, errors }
}

const decks = []
for (const entry of source) {
    try {
        const { deck, format, errors } = validate(entry)
        if (errors.length) {
            console.warn(`Ignorado: ${entry.name} (${errors.join(', ')})`)
            continue
        }
        decks.push({
            name: entry.name,
            class: deckClass(deck.cards),
            format,
            code: entry.code,
            cards: deck.cards,
            sideboard: deck.sideboardCards,
        })
    } catch (error) {
        console.warn(`Código inválido: ${entry.name} (${error.message})`)
    }
}

decks.sort((a, b) => a.class.localeCompare(b.class) || a.name.localeCompare(b.name))
await writeFile(OUTPUT, JSON.stringify(decks))
console.log(`${decks.length} de ${source.length} decks válidos`)
