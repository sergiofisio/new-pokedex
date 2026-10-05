import { useState } from "react";
import {
    getDailyTarget,
    getRandomTarget,
    readDailyGuesses,
    readStats,
    recordWin,
    resetStreak,
    saveDailyGuesses,
    type ChallengeMode,
    type ChallengeVariant,
} from "../lib/challenge";
import { getReward, readLocalStatsMap, type Reward } from "../lib/progression";

export type ChallengeStatus = 'playing' | 'won' | 'gaveUp'

export function useChallenge(mode: ChallengeMode, variant: ChallengeVariant, dateKey: string) {
    const [target] = useState(() => variant === 'daily' ? getDailyTarget(mode, dateKey) : getRandomTarget())
    const [guesses, setGuesses] = useState<number[]>(() => variant === 'daily' ? readDailyGuesses(mode, dateKey) : [])
    const [gaveUp, setGaveUp] = useState(false)
    const [stats, setStats] = useState(() => readStats(mode, variant))
    const [reward, setReward] = useState<Reward | null>(null)

    const status: ChallengeStatus = guesses.includes(target) ? 'won' : gaveUp ? 'gaveUp' : 'playing'

    const guess = (id: number) => {
        if (status !== 'playing' || guesses.includes(id)) return
        const next = [...guesses, id]
        setGuesses(next)
        if (variant === 'daily') saveDailyGuesses(mode, dateKey, next)
        if (id === target) {
            const before = readLocalStatsMap()
            setStats(recordWin(mode, variant, next.length, dateKey))
            setReward(getReward(before, readLocalStatsMap()))
        }
    }

    const giveUp = () => {
        if (status !== 'playing') return
        setGaveUp(true)
        setStats(resetStreak(mode, variant))
    }

    return {
        target,
        guesses,
        wrongCount: guesses.filter((id) => id !== target).length,
        status,
        stats,
        reward,
        guess,
        giveUp,
    }
}
