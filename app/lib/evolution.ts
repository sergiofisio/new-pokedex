import { prettify, type MessageKey } from "../i18n/translations";
import type { ChainLink, EvolutionDetail } from "./pokeapi";

type Translate = (key: MessageKey, params?: Record<string, string | number>) => string

export function getEvolutionStages(chain: ChainLink) {
    const stages: ChainLink[][] = []
    let current = [chain]
    while (current.length > 0) {
        stages.push(current)
        current = current.flatMap(({ evolves_to }) => evolves_to)
    }
    return stages
}

const VERSION_GROUP_GENERATION: Record<string, number> = {
    'red-blue': 1, 'yellow': 1, 'red-green-japan': 1, 'blue-japan': 1,
    'gold-silver': 2, 'crystal': 2,
    'ruby-sapphire': 3, 'emerald': 3, 'firered-leafgreen': 3, 'colosseum': 3, 'xd': 3,
    'diamond-pearl': 4, 'platinum': 4, 'heartgold-soulsilver': 4,
    'black-white': 5, 'black-2-white-2': 5,
    'x-y': 6, 'omega-ruby-alpha-sapphire': 6,
    'sun-moon': 7, 'ultra-sun-ultra-moon': 7, 'lets-go-pikachu-lets-go-eevee': 7,
    'sword-shield': 8, 'the-isle-of-armor': 8, 'the-crown-tundra': 8, 'brilliant-diamond-shining-pearl': 8, 'legends-arceus': 8,
    'scarlet-violet': 9, 'the-teal-mask': 9, 'the-indigo-disk': 9, 'legends-za': 9, 'mega-dimension': 9, 'champions': 9,
}

export interface EvolutionMethod {
    detail: EvolutionDetail;
    text: string;
    generations: number[];
}

export function getEvolutionMethods(details: EvolutionDetail[], describe: (detail: EvolutionDetail) => string) {
    const ordered = [...details].sort((a, b) => Number(Boolean(b.is_default)) - Number(Boolean(a.is_default)))
    const methods = new Map<string, EvolutionMethod>()
    for (const detail of ordered) {
        const text = describe(detail)
        const method = methods.get(text) ?? { detail, text, generations: [] }
        const generation = VERSION_GROUP_GENERATION[detail.version_group?.name ?? '']
        if (generation) method.generations.push(generation)
        methods.set(text, method)
    }
    return [...methods.values()]
}

export function describeEvolution(detail: EvolutionDetail, t: Translate, itemName: (item: string) => string, typeName: (type: string) => string) {
    const parts: string[] = []

    switch (detail.trigger.name) {
        case 'level-up':
            parts.push(detail.min_level ? t('level', { n: detail.min_level }) : t('levelUp'))
            break
        case 'use-item':
            parts.push(detail.item ? itemName(detail.item.name) : t('useItem'))
            break
        case 'trade':
            parts.push(t('trade'))
            break
        default:
            parts.push(t('otherCondition'))
    }

    if (detail.held_item) parts.push(t('holding', { item: itemName(detail.held_item.name) }))
    if (detail.min_happiness) parts.push(t('friendship'))
    if (detail.min_affection) parts.push(t('affection'))
    if (detail.time_of_day === 'day') parts.push(t('day'))
    if (detail.time_of_day === 'night') parts.push(t('night'))
    if (detail.known_move) parts.push(t('knowing', { move: prettify(detail.known_move.name) }))
    if (detail.known_move_type) parts.push(t('knowingType', { type: typeName(detail.known_move_type.name) }))
    if (detail.near_special_rock) parts.push(t('nearSpecialRock'))
    else if (detail.location) parts.push(t('at', { location: prettify(detail.location.name) }))

    return parts.join(' · ')
}
