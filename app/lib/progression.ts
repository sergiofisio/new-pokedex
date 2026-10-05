import { CHALLENGE_MODES, readStats, type ChallengeMode, type ChallengeStats, type ChallengeVariant } from "./challenge";
import type { MessageKey } from "../i18n/translations";

export type StatsMap = Record<ChallengeMode, Partial<Record<ChallengeVariant, ChallengeStats>>>

const VARIANTS: ChallengeVariant[] = ['daily', 'random']
const WIN_XP: Record<ChallengeVariant, number> = { daily: 100, random: 50 }
const FIRST_TRY_BONUS = 50
const BONUS_STEP = 10
const STREAK_XP = 20
const LEVEL_STEP = 100

export const emptyStatsMap = (): StatsMap =>
    Object.fromEntries(CHALLENGE_MODES.map((mode) => [mode, {}])) as StatsMap

export function readLocalStatsMap(): StatsMap {
    const map = emptyStatsMap()
    for (const mode of CHALLENGE_MODES) {
        for (const variant of VARIANTS) map[mode][variant] = readStats(mode, variant)
    }
    return map
}

export const attemptBonus = (attempts: number) =>
    attempts === 1 ? FIRST_TRY_BONUS : Math.max(0, (5 - attempts) * BONUS_STEP)

const entries = (map: StatsMap) =>
    CHALLENGE_MODES.flatMap((mode) =>
        VARIANTS.flatMap((variant) => {
            const stats = map[mode][variant]
            return stats ? [{ mode, variant, stats }] : []
        }),
    )

export function totalXp(map: StatsMap) {
    return entries(map).reduce((total, { variant, stats }) => {
        const wins = stats.wins ?? 0
        const bonus = (stats.distribution ?? []).reduce((sum, count, index) => sum + count * attemptBonus(index + 1), 0)
        return total + wins * WIN_XP[variant] + bonus + (stats.bestStreak ?? 0) * STREAK_XP
    }, 0)
}

const xpForLevel = (level: number) => (LEVEL_STEP * level * (level - 1)) / 2

export interface LevelInfo {
    level: number;
    xp: number;
    current: number;
    needed: number;
    rank: MessageKey;
}

const RANKS: { level: number; key: MessageKey }[] = [
    { level: 1, key: 'rankRookie' },
    { level: 3, key: 'rankTrainer' },
    { level: 6, key: 'rankAce' },
    { level: 10, key: 'rankGymLeader' },
    { level: 15, key: 'rankElite' },
    { level: 20, key: 'rankChampion' },
    { level: 30, key: 'rankMaster' },
]

export function getLevelInfo(xp: number): LevelInfo {
    let level = 1
    while (xpForLevel(level + 1) <= xp) level++
    const floor = xpForLevel(level)
    return {
        level,
        xp,
        current: xp - floor,
        needed: xpForLevel(level + 1) - floor,
        rank: RANKS.findLast((rank) => level >= rank.level)!.key,
    }
}

interface Totals {
    wins: number;
    firstTry: number;
    modesPlayed: number;
    bestDailyStreak: number;
    bestRandomStreak: number;
    winsByMode: Record<ChallengeMode, number>;
}

function getTotals(map: StatsMap): Totals {
    const list = entries(map)
    const winsByMode = Object.fromEntries(
        CHALLENGE_MODES.map((mode) => [mode, VARIANTS.reduce((sum, variant) => sum + (map[mode][variant]?.wins ?? 0), 0)]),
    ) as Record<ChallengeMode, number>
    const bestStreak = (variant: ChallengeVariant) =>
        Math.max(0, ...list.filter((entry) => entry.variant === variant).map(({ stats }) => stats.bestStreak ?? 0))

    return {
        wins: list.reduce((sum, { stats }) => sum + (stats.wins ?? 0), 0),
        firstTry: list.reduce((sum, { stats }) => sum + (stats.distribution?.[0] ?? 0), 0),
        modesPlayed: CHALLENGE_MODES.filter((mode) => winsByMode[mode] > 0).length,
        bestDailyStreak: bestStreak('daily'),
        bestRandomStreak: bestStreak('random'),
        winsByMode,
    }
}

export type BadgeTier = 'bronze' | 'silver' | 'gold'

interface BadgeDefinition {
    id: string;
    icon: string;
    tier: BadgeTier;
    target: number;
    value: (totals: Totals) => number;
}

const BADGES: BadgeDefinition[] = [
    { id: 'firstWin', icon: '🎉', tier: 'bronze', target: 1, value: (t) => t.wins },
    { id: 'wins10', icon: '🥉', tier: 'bronze', target: 10, value: (t) => t.wins },
    { id: 'wins50', icon: '🥈', tier: 'silver', target: 50, value: (t) => t.wins },
    { id: 'wins100', icon: '🥇', tier: 'gold', target: 100, value: (t) => t.wins },
    { id: 'firstTry', icon: '🎯', tier: 'bronze', target: 1, value: (t) => t.firstTry },
    { id: 'firstTry10', icon: '🦅', tier: 'gold', target: 10, value: (t) => t.firstTry },
    { id: 'explorer', icon: '🧭', tier: 'silver', target: CHALLENGE_MODES.length, value: (t) => t.modesPlayed },
    { id: 'daily7', icon: '📅', tier: 'silver', target: 7, value: (t) => t.bestDailyStreak },
    { id: 'daily30', icon: '🔥', tier: 'gold', target: 30, value: (t) => t.bestDailyStreak },
    { id: 'endless10', icon: '♾️', tier: 'silver', target: 10, value: (t) => t.bestRandomStreak },
    { id: 'silhuetaMaster', icon: '👤', tier: 'gold', target: 25, value: (t) => t.winsByMode.silhueta },
    { id: 'descricaoMaster', icon: '📖', tier: 'gold', target: 25, value: (t) => t.winsByMode.descricao },
    { id: 'zoomMaster', icon: '🔍', tier: 'gold', target: 25, value: (t) => t.winsByMode.zoom },
    { id: 'infinitoMaster', icon: '🧩', tier: 'gold', target: 25, value: (t) => t.winsByMode.infinito },
]

export interface Badge {
    id: string;
    icon: string;
    tier: BadgeTier;
    target: number;
    progress: number;
    unlocked: boolean;
}

export function getBadges(map: StatsMap): Badge[] {
    const totals = getTotals(map)
    return BADGES.map(({ value, ...badge }) => {
        const progress = Math.min(badge.target, value(totals))
        return { ...badge, progress, unlocked: progress >= badge.target }
    })
}

export interface Reward {
    xp: number;
    levelUp: number | null;
    badges: Badge[];
}

export function getReward(before: StatsMap, after: StatsMap): Reward {
    const previousXp = totalXp(before)
    const nextXp = totalXp(after)
    const previousLevel = getLevelInfo(previousXp).level
    const nextLevel = getLevelInfo(nextXp).level
    const unlockedBefore = new Set(getBadges(before).filter((badge) => badge.unlocked).map((badge) => badge.id))

    return {
        xp: nextXp - previousXp,
        levelUp: nextLevel > previousLevel ? nextLevel : null,
        badges: getBadges(after).filter((badge) => badge.unlocked && !unlockedBefore.has(badge.id)),
    }
}
