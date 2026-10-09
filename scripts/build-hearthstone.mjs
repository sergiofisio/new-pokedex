import { mkdir, writeFile } from 'node:fs/promises'

const API = 'https://api.hearthstonejson.com/v1/latest'

const EXCLUDED_SETS = new Set(['HERO_SKINS', 'VANILLA', 'CORE_HIDDEN'])
const PLAYABLE_TYPES = new Set(['MINION', 'SPELL', 'WEAPON', 'HERO', 'LOCATION'])
const POOL_TYPES = new Set(['MINION', 'SPELL', 'WEAPON', 'LOCATION'])
const CLASSIC_SETS = new Set(['LEGACY', 'EXPERT1'])

// Must be updated at every yearly Standard rotation.
const STANDARD_SETS = new Set(['CORE', 'EVENT', 'EMERALD_DREAM', 'THE_LOST_CITY', 'TIME_TRAVEL', 'CATACLYSM', 'ESCAPEFROM_VIOLET_HOLD', 'BE'])

const SET_INFO = {
    LEGACY: ['Básico', 'Basic', 2014],
    EXPERT1: ['Clássico', 'Classic', 2014],
    NAXX: ['Maldição de Naxxramas', 'Curse of Naxxramas', 2014],
    GVG: ['Goblins vs Gnomos', 'Goblins vs Gnomes', 2014],
    BRM: ['Montanha Rocha Negra', 'Blackrock Mountain', 2015],
    TGT: ['O Grande Torneio', 'The Grand Tournament', 2015],
    LOE: ['Liga dos Exploradores', 'League of Explorers', 2015],
    OG: ['Sussurros dos Deuses Antigos', 'Whispers of the Old Gods', 2016],
    KARA: ['Uma Noite em Karazhan', 'One Night in Karazhan', 2016],
    GANGS: ['Gangues de Geringontzan', 'Mean Streets of Gadgetzan', 2016],
    UNGORO: ['Jornada a Un\'Goro', 'Journey to Un\'Goro', 2017],
    ICECROWN: ['Cavaleiros do Trono de Gelo', 'Knights of the Frozen Throne', 2017],
    LOOTAPALOOZA: ['Kobolds e Catacumbas', 'Kobolds & Catacombs', 2017],
    GILNEAS: ['O Bosque das Bruxas', 'The Witchwood', 2018],
    BOOMSDAY: ['O Projeto Cabum', 'The Boomsday Project', 2018],
    TROLL: ['Ringue de Rastakhan', 'Rastakhan\'s Rumble', 2018],
    DALARAN: ['Ascensão das Sombras', 'Rise of Shadows', 2019],
    ULDUM: ['Salvadores de Uldum', 'Saviors of Uldum', 2019],
    DRAGONS: ['Descida dos Dragões', 'Descent of Dragons', 2019],
    YEAR_OF_THE_DRAGON: ['Despertar de Galakrond', 'Galakrond\'s Awakening', 2020],
    BLACK_TEMPLE: ['Cinzas de Exterra', 'Ashes of Outland', 2020],
    DEMON_HUNTER_INITIATE: ['Iniciado Caçador de Demônios', 'Demon Hunter Initiate', 2020],
    SCHOLOMANCE: ['Academia Scholomance', 'Scholomance Academy', 2020],
    DARKMOON_FAIRE: ['Delírios na Feira de Negraluna', 'Madness at the Darkmoon Faire', 2020],
    THE_BARRENS: ['Forjados nos Sertões', 'Forged in the Barrens', 2021],
    CORE: ['Básico', 'Core', 2021],
    STORMWIND: ['Unidos em Ventobravo', 'United in Stormwind', 2021],
    ALTERAC_VALLEY: ['Rachados no Vale Alterac', 'Fractured in Alterac Valley', 2021],
    THE_SUNKEN_CITY: ['Viagem à Cidade Submersa', 'Voyage to the Sunken City', 2022],
    REVENDRETH: ['Assassinato no Castelo Nathria', 'Murder at Castle Nathria', 2022],
    PATH_OF_ARTHAS: ['Caminho de Arthas', 'Path of Arthas', 2022],
    RETURN_OF_THE_LICH_KING: ['A Marcha do Lich Rei', 'March of the Lich King', 2022],
    BATTLE_OF_THE_BANDS: ['Festival das Lendas', 'Festival of Legends', 2023],
    TITANS: ['TITÃS', 'TITANS', 2023],
    WILD_WEST: ['Confronto em Ermos', 'Showdown in the Badlands', 2023],
    WHIZBANGS_WORKSHOP: ['Oficina do Bambambã', 'Whizbang\'s Workshop', 2024],
    WONDERS: ['Caverna do Tempo', 'Caverns of Time', 2024],
    ISLAND_VACATION: ['Perigos no Paraíso', 'Perils in Paradise', 2024],
    SPACE: ['O Grande Além Sombrio', 'The Great Dark Beyond', 2024],
    EMERALD_DREAM: ['No Sonho Esmeralda', 'Into the Emerald Dream', 2025],
    THE_LOST_CITY: ['A Cidade Perdida de Un\'Goro', 'The Lost City of Un\'Goro', 2025],
    TIME_TRAVEL: ['Através das Linhas Temporais', 'Across the Timeways', 2025],
    EVENT: ['Evento', 'Event', 2025],
    CATACLYSM: ['Cataclismo', 'Cataclysm', 2026],
    ESCAPEFROM_VIOLET_HOLD: ['Fuga do Castelo Violeta', 'Escape from the Violet Hold', 2026],
    BE: ['Mini-conjunto', 'Mini-set', 2026],
}

async function fetchCards(locale, file = 'cards.collectible.json') {
    const response = await fetch(`${API}/${locale}/${file}`)
    if (!response.ok) throw new Error(`${locale}: HTTP ${response.status}`)
    return response.json()
}

function cleanText(raw) {
    if (!raw) return ''
    return raw
        .split('@')[0]
        .replace(/^\[x\]/, '')
        .replace(/[$#](\d+)/g, '$1')
        .replace(/\{\d+\}/g, 'X')
        .replace(/\|4\(([^,)]*),([^)]*)\)/g, '$2')
        .replace(/<\/?(?!b>|i>|\/b>|\/i>)[^>]+>/g, '')
        .replace(/_/g, ' ')
        .replace(/\s*\n\s*/g, ' ')
        .trim()
}

const [ptBR, enUS, allPt, allEn] = await Promise.all([
    fetchCards('ptBR'), fetchCards('enUS'), fetchCards('ptBR', 'cards.json'), fetchCards('enUS', 'cards.json'),
])
const english = new Map([...allEn, ...enUS].map((card) => [card.dbfId, card]))

const collectible = ptBR.filter((card) => !EXCLUDED_SETS.has(card.set) && PLAYABLE_TYPES.has(card.type) && english.has(card.dbfId))

const fabledIds = new Set(enUS.filter((card) => /\bFabled\b/.test(card.text ?? '')).map((card) => card.id))
const bundled = allPt.filter((card) =>
    !card.collectible && PLAYABLE_TYPES.has(card.type) && english.has(card.dbfId)
    && /t\d*$/.test(card.id) && fabledIds.has(card.id.replace(/t\d*$/, '')))
const bundledIds = new Set(bundled.map((card) => card.dbfId))
const playable = [...collectible, ...bundled]

const firstDbf = new Map()
for (const card of playable) firstDbf.set(card.set, Math.min(firstDbf.get(card.set) ?? Infinity, card.dbfId))
const setIds = [...firstDbf.keys()].sort((a, b) => firstDbf.get(a) - firstDbf.get(b))
const unknownSets = setIds.filter((set) => !SET_INFO[set])
if (unknownSets.length) console.warn('Coleções sem nome:', unknownSets.join(', '))

const sets = setIds.map((id) => {
    const [pt, en, year] = SET_INFO[id] ?? [id, id, new Date().getFullYear()]
    return { id, name: [pt, en], year, standard: STANDARD_SETS.has(id) }
})
const setIndex = new Map(setIds.map((id, index) => [id, index]))

const byName = new Map()
for (const card of collectible) {
    const key = english.get(card.dbfId).name.toLowerCase()
    const group = byName.get(key) ?? []
    group.push(card)
    byName.set(key, group)
}
const representatives = new Set()
for (const group of byName.values()) {
    const best = [...group].sort((a, b) => Number(STANDARD_SETS.has(b.set)) - Number(STANDARD_SETS.has(a.set)) || b.dbfId - a.dbfId)[0]
    representatives.add(best.dbfId)
}

const cards = []
const texts = { pt: {}, en: {} }
for (const card of playable.sort((a, b) => a.dbfId - b.dbfId)) {
    const en = english.get(card.dbfId)
    const entry = {
        d: card.dbfId,
        i: card.id,
        n: [card.name, en.name],
        c: card.cost ?? 0,
        t: card.type,
        r: card.rarity ?? 'FREE',
        s: setIndex.get(card.set),
        k: card.classes ?? [card.cardClass ?? 'NEUTRAL'],
    }
    if (card.attack !== undefined) entry.a = card.attack
    if (card.health !== undefined) entry.h = card.health
    if (card.durability) entry.h = card.durability
    if (card.armor !== undefined) entry.am = card.armor
    const races = (card.races ?? (card.race ? [card.race] : [])).filter((race) => race !== 'ALL')
    if (card.races?.includes('ALL') || card.race === 'ALL') races.push('ALL')
    if (races.length) entry.ra = races
    if (card.spellSchool) entry.sc = card.spellSchool
    if (card.mechanics?.length) entry.m = card.mechanics
    if (card.runeCost) entry.ru = card.runeCost
    if (card.countAsCopyOfDbfId) entry.o = card.countAsCopyOfDbfId
    if (card.artist) entry.ar = card.artist
    if (representatives.has(card.dbfId)) entry.u = 1
    if (bundledIds.has(card.dbfId)) entry.b = 1
    cards.push(entry)
    texts.pt[card.dbfId] = [cleanText(card.collectionText ?? card.text), cleanText(card.flavor)]
    texts.en[card.dbfId] = [cleanText(en.collectionText ?? en.text), cleanText(en.flavor)]
}

const pool = cards
    .filter((card) => card.u && POOL_TYPES.has(card.t) && (sets[card.s].standard || CLASSIC_SETS.has(sets[card.s].id)))
    .map((card) => card.d)

await mkdir('public/data', { recursive: true })
await writeFile('public/data/hs-cards.json', JSON.stringify({ sets, cards }))
await writeFile('public/data/hs-texts-pt.json', JSON.stringify(texts.pt))
await writeFile('public/data/hs-texts-en.json', JSON.stringify(texts.en))
await writeFile('app/data/hs-pool.json', JSON.stringify(pool))

console.log(`${cards.length} cartas (${bundled.length} de pacote), ${representatives.size} nomes únicos, ${sets.length} coleções, ${pool.length} cartas no Hearthdle`)
