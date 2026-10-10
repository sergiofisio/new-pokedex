import { POKEMON_TYPES } from "./pokeapi";

const SUPER = 2
const HALF = 0.5
const IMMUNE = 0

const CHART: Record<string, Record<string, number>> = {
    normal: { rock: HALF, ghost: IMMUNE, steel: HALF },
    fire: { fire: HALF, water: HALF, grass: SUPER, ice: SUPER, bug: SUPER, rock: HALF, dragon: HALF, steel: SUPER },
    water: { fire: SUPER, water: HALF, grass: HALF, ground: SUPER, rock: SUPER, dragon: HALF },
    electric: { water: SUPER, electric: HALF, grass: HALF, ground: IMMUNE, flying: SUPER, dragon: HALF },
    grass: { fire: HALF, water: SUPER, grass: HALF, poison: HALF, ground: SUPER, flying: HALF, bug: HALF, rock: SUPER, dragon: HALF, steel: HALF },
    ice: { fire: HALF, water: HALF, grass: SUPER, ice: HALF, ground: SUPER, flying: SUPER, dragon: SUPER, steel: HALF },
    fighting: { normal: SUPER, ice: SUPER, poison: HALF, flying: HALF, psychic: HALF, bug: HALF, rock: SUPER, ghost: IMMUNE, dark: SUPER, steel: SUPER, fairy: HALF },
    poison: { grass: SUPER, poison: HALF, ground: HALF, rock: HALF, ghost: HALF, steel: IMMUNE, fairy: SUPER },
    ground: { fire: SUPER, electric: SUPER, grass: HALF, poison: SUPER, flying: IMMUNE, bug: HALF, rock: SUPER, steel: SUPER },
    flying: { electric: HALF, grass: SUPER, fighting: SUPER, bug: SUPER, rock: HALF, steel: HALF },
    psychic: { fighting: SUPER, poison: SUPER, psychic: HALF, dark: IMMUNE, steel: HALF },
    bug: { fire: HALF, grass: SUPER, fighting: HALF, poison: HALF, flying: HALF, psychic: SUPER, ghost: HALF, dark: SUPER, steel: HALF, fairy: HALF },
    rock: { fire: SUPER, ice: SUPER, fighting: HALF, ground: HALF, flying: SUPER, bug: SUPER, steel: HALF },
    ghost: { normal: IMMUNE, psychic: SUPER, ghost: SUPER, dark: HALF },
    dragon: { dragon: SUPER, steel: HALF, fairy: IMMUNE },
    dark: { fighting: HALF, psychic: SUPER, ghost: SUPER, dark: HALF, fairy: HALF },
    steel: { fire: HALF, water: HALF, electric: HALF, ice: SUPER, rock: SUPER, steel: HALF, fairy: SUPER },
    fairy: { fire: HALF, fighting: SUPER, poison: HALF, dragon: SUPER, dark: SUPER, steel: HALF },
}

export const attackMultiplier = (attacker: string, defender: string) => CHART[attacker]?.[defender] ?? 1

export const defenseMultiplier = (attacker: string, defenders: string[]) =>
    defenders.reduce((total, defender) => total * attackMultiplier(attacker, defender), 1)

export interface Matchups {
    quadruple: string[]
    double: string[]
    half: string[]
    quarter: string[]
    immune: string[]
}

export function getDefensiveMatchups(types: string[]): Matchups {
    const matchups: Matchups = { quadruple: [], double: [], half: [], quarter: [], immune: [] }
    for (const attacker of POKEMON_TYPES) {
        const multiplier = defenseMultiplier(attacker, types)
        if (multiplier === 4) matchups.quadruple.push(attacker)
        else if (multiplier === 2) matchups.double.push(attacker)
        else if (multiplier === 0.5) matchups.half.push(attacker)
        else if (multiplier === 0.25) matchups.quarter.push(attacker)
        else if (multiplier === 0) matchups.immune.push(attacker)
    }
    return matchups
}

export function getOffensiveTargets(type: string) {
    return {
        strong: POKEMON_TYPES.filter((defender) => attackMultiplier(type, defender) === SUPER),
        weak: POKEMON_TYPES.filter((defender) => attackMultiplier(type, defender) === HALF),
        none: POKEMON_TYPES.filter((defender) => attackMultiplier(type, defender) === IMMUNE),
    }
}
