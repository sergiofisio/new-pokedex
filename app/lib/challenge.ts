import { FUSION_COUNT, getFusion } from "./fusion";
import { GYM_COUNT, buildGymRound } from "./gym";
import { HS_POOL, HS_POOL_SIZE } from "./hearthstone";
import { hash } from "./seed";
import type { World } from "./site";

export { seededFraction } from "./seed";

export const POKEMON_MODES = ['silhueta', 'descricao', 'zoom', 'som', 'fusao', 'ginasio', 'infinito'] as const
export const HEARTHSTONE_MODES = ['hs-atributos', 'hs-arte', 'hs-texto'] as const
export const CHALLENGE_MODES = [...POKEMON_MODES, ...HEARTHSTONE_MODES] as const

export type ChallengeMode = typeof CHALLENGE_MODES[number]
export type GameWorld = Exclude<World, 'neutral'>

export const getModeWorld = (mode: ChallengeMode): GameWorld =>
    (HEARTHSTONE_MODES as readonly string[]).includes(mode) ? 'hearthstone' : 'pokemon'

export const getWorldModes = (world: GameWorld): readonly ChallengeMode[] => world === 'hearthstone' ? HEARTHSTONE_MODES : POKEMON_MODES
export type ChallengeVariant = 'daily' | 'random'

export const TOTAL_SPECIES = 1025
const MAX_DISTRIBUTION_BUCKET = 6

export const isChallengeMode = (value: string): value is ChallengeMode =>
    (CHALLENGE_MODES as readonly string[]).includes(value)

export const supportsDaily = (mode: ChallengeMode) => mode !== 'infinito'

export type SessionKind = 'classic' | 'fusion' | 'gym' | 'infinite' | 'card'

export const getSessionKind = (mode: ChallengeMode): SessionKind =>
    getModeWorld(mode) === 'hearthstone' ? 'card'
        : mode === 'fusao' ? 'fusion' : mode === 'ginasio' ? 'gym' : mode === 'infinito' ? 'infinite' : 'classic'

const POOL_SIZE: Record<SessionKind, number> = { classic: TOTAL_SPECIES, infinite: TOTAL_SPECIES, fusion: FUSION_COUNT, gym: GYM_COUNT, card: HS_POOL_SIZE }
const POOL_OFFSET: Record<SessionKind, number> = { classic: 1, infinite: 1, fusion: 0, gym: 0, card: 0 }

export function getSolution(mode: ChallengeMode, target: number): number[] {
    const kind = getSessionKind(mode)
    if (kind === 'fusion') {
        const { head, body } = getFusion(target)
        return [head, body]
    }
    if (kind === 'gym') return [buildGymRound(target).intruder]
    if (kind === 'card') return [HS_POOL[target]]
    return [target]
}

export const isRoundSolved = (mode: ChallengeMode, target: number, guesses: number[]) =>
    getSolution(mode, target).every((id) => guesses.includes(id))

export function getDateKey(date = new Date()) {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${date.getFullYear()}-${month}-${day}`
}

export function getDailyTarget(mode: ChallengeMode, dateKey: string) {
    const kind = getSessionKind(mode)
    return (hash(`${dateKey}:${mode}`) % POOL_SIZE[kind]) + POOL_OFFSET[kind]
}

export function getRandomTarget(mode: ChallengeMode, exclude?: number) {
    const kind = getSessionKind(mode)
    let target = exclude
    while (target === exclude) target = Math.floor(Math.random() * POOL_SIZE[kind]) + POOL_OFFSET[kind]
    return target as number
}

export function msUntilTomorrow(now = new Date()) {
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    return tomorrow.getTime() - now.getTime()
}

export function formatCountdown(ms: number) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000))
    const parts = [Math.floor(totalSeconds / 3600), Math.floor(totalSeconds / 60) % 60, totalSeconds % 60]
    return parts.map((part) => String(part).padStart(2, '0')).join(':')
}

export interface ChallengeStats {
    wins: number;
    streak: number;
    bestStreak: number;
    totalAttempts: number;
    distribution: number[];
    lastWin: string | null;
}

const EMPTY_STATS: ChallengeStats = {
    wins: 0,
    streak: 0,
    bestStreak: 0,
    totalAttempts: 0,
    distribution: Array(MAX_DISTRIBUTION_BUCKET).fill(0),
    lastWin: null,
}

const statsKey = (mode: ChallengeMode, variant: ChallengeVariant) => `challenge-stats:${mode}:${variant}`
const guessesKey = (mode: ChallengeMode, dateKey: string) => `challenge:${mode}:${dateKey}`

export const isProgressKey = (key: string) => key.startsWith('challenge:') || key.startsWith('challenge-stats:')

type ProgressListener = (key: string, value: unknown) => void
const progressListeners = new Set<ProgressListener>()

export function onProgressWrite(listener: ProgressListener) {
    progressListeners.add(listener)
    return () => { progressListeners.delete(listener) }
}

function writeProgress(key: string, value: unknown) {
    localStorage.setItem(key, JSON.stringify(value))
    progressListeners.forEach((listener) => listener(key, value))
}

function readJson<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key)
        return raw ? { ...fallback, ...JSON.parse(raw) } : fallback
    } catch {
        return fallback
    }
}

export const readStats = (mode: ChallengeMode, variant: ChallengeVariant) =>
    readJson(statsKey(mode, variant), EMPTY_STATS)

export function readDailyGuesses(mode: ChallengeMode, dateKey: string): number[] {
    try {
        const parsed = JSON.parse(localStorage.getItem(guessesKey(mode, dateKey)) ?? '[]')
        return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'number') : []
    } catch {
        return []
    }
}

export function saveDailyGuesses(mode: ChallengeMode, dateKey: string, guesses: number[]) {
    writeProgress(guessesKey(mode, dateKey), guesses)
}

export const isSolvedToday = (mode: ChallengeMode, dateKey: string) =>
    isRoundSolved(mode, getDailyTarget(mode, dateKey), readDailyGuesses(mode, dateKey))

const getPreviousDateKey = (dateKey: string) => {
    const [year, month, day] = dateKey.split('-').map(Number)
    return getDateKey(new Date(year, month - 1, day - 1))
}

export function recordWin(mode: ChallengeMode, variant: ChallengeVariant, attempts: number, dateKey: string) {
    const stats = readStats(mode, variant)
    const continues = variant === 'random' || stats.lastWin === getPreviousDateKey(dateKey)
    const streak = continues ? stats.streak + 1 : 1
    const distribution = [...stats.distribution]
    distribution[Math.min(attempts, MAX_DISTRIBUTION_BUCKET) - 1]++

    const next: ChallengeStats = {
        wins: stats.wins + 1,
        streak,
        bestStreak: Math.max(stats.bestStreak, streak),
        totalAttempts: stats.totalAttempts + attempts,
        distribution,
        lastWin: dateKey,
    }
    writeProgress(statsKey(mode, variant), next)
    return next
}

export function resetStreak(mode: ChallengeMode, variant: ChallengeVariant) {
    const next = { ...readStats(mode, variant), streak: 0 }
    writeProgress(statsKey(mode, variant), next)
    return next
}

export function getNextMode(mode: ChallengeMode, dateKey: string) {
    const start = CHALLENGE_MODES.indexOf(mode)
    const world = getModeWorld(mode)
    const others = CHALLENGE_MODES.map((_, offset) => CHALLENGE_MODES[(start + offset + 1) % CHALLENGE_MODES.length])
        .filter((candidate) => candidate !== mode)
        .sort((a, b) => Number(getModeWorld(b) === world) - Number(getModeWorld(a) === world))
    return others.find((candidate) => supportsDaily(candidate) && !isSolvedToday(candidate, dateKey)) ?? others[0]
}

export function getCurrentStreak(mode: ChallengeMode, variant: ChallengeVariant, dateKey: string) {
    const stats = readStats(mode, variant)
    if (variant === 'random') return stats.streak
    return stats.lastWin === dateKey || stats.lastWin === getPreviousDateKey(dateKey) ? stats.streak : 0
}
