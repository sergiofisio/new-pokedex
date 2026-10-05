export const CHALLENGE_MODES = ['silhueta', 'descricao', 'zoom', 'infinito'] as const

export type ChallengeMode = typeof CHALLENGE_MODES[number]
export type ChallengeVariant = 'daily' | 'random'

export const TOTAL_SPECIES = 1025
const MAX_DISTRIBUTION_BUCKET = 6

export const isChallengeMode = (value: string): value is ChallengeMode =>
    (CHALLENGE_MODES as readonly string[]).includes(value)

export const supportsDaily = (mode: ChallengeMode) => mode !== 'infinito'

export function getDateKey(date = new Date()) {
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${date.getFullYear()}-${month}-${day}`
}

function hash(text: string) {
    let value = 0x811c9dc5
    for (let index = 0; index < text.length; index++) {
        value ^= text.charCodeAt(index)
        value = Math.imul(value, 0x01000193)
    }
    return value >>> 0
}

export const seededFraction = (seed: string) => hash(seed) / 2 ** 32

export const getDailyTarget = (mode: ChallengeMode, dateKey: string) =>
    (hash(`${dateKey}:${mode}`) % TOTAL_SPECIES) + 1

export function getRandomTarget(exclude?: number) {
    let id = exclude
    while (id === exclude) id = Math.floor(Math.random() * TOTAL_SPECIES) + 1
    return id as number
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
    readDailyGuesses(mode, dateKey).includes(getDailyTarget(mode, dateKey))

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
    const others = CHALLENGE_MODES.map((_, offset) => CHALLENGE_MODES[(start + offset + 1) % CHALLENGE_MODES.length])
        .filter((candidate) => candidate !== mode)
    return others.find((candidate) => supportsDaily(candidate) && !isSolvedToday(candidate, dateKey)) ?? others[0]
}

export function getCurrentStreak(mode: ChallengeMode, variant: ChallengeVariant, dateKey: string) {
    const stats = readStats(mode, variant)
    if (variant === 'random') return stats.streak
    return stats.lastWin === dateKey || stats.lastWin === getPreviousDateKey(dateKey) ? stats.streak : 0
}
