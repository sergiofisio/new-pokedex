import { useState } from "react";
import {
    getDailyTarget,
    getRandomTarget,
    getSolution,
    readDailyGuesses,
    readStats,
    recordWin,
    resetStreak,
    saveDailyGuesses,
    type ChallengeMode,
    type ChallengeStats,
    type ChallengeVariant,
} from "../lib/challenge";
import { getReward, readLocalStatsMap, type Reward } from "../lib/progression";

export type ChallengeStatus = 'playing' | 'won' | 'gaveUp'

export interface RoundResult {
    solved: boolean;
    attempts: number;
}

export interface SeriesRound {
    target: number;
    onFinish: (result: RoundResult) => void;
    onGuess?: (wrongCount: number) => void;
}

export function useChallenge(mode: ChallengeMode, variant: ChallengeVariant, dateKey: string, series?: SeriesRound) {
    const persistent = !series
    const [target] = useState(() =>
        series ? series.target : variant === 'daily' ? getDailyTarget(mode, dateKey) : getRandomTarget(mode)
    )
    const [guesses, setGuesses] = useState<number[]>(() => persistent && variant === 'daily' ? readDailyGuesses(mode, dateKey) : [])
    const [gaveUp, setGaveUp] = useState(false)
    const [stats, setStats] = useState<ChallengeStats>(() => readStats(mode, variant))
    const [reward, setReward] = useState<Reward | null>(null)

    const solution = getSolution(mode, target)
    const isSolved = (list: number[]) => solution.every((id) => list.includes(id))
    const countWrong = (list: number[]) => list.filter((id) => !solution.includes(id)).length
    const wrongCount = countWrong(guesses)
    const status: ChallengeStatus = isSolved(guesses) ? 'won' : gaveUp ? 'gaveUp' : 'playing'

    const guess = (id: number) => {
        if (status !== 'playing' || guesses.includes(id)) return
        const next = [...guesses, id]
        setGuesses(next)
        if (!isSolved(next)) {
            if (persistent && variant === 'daily') saveDailyGuesses(mode, dateKey, next)
            series?.onGuess?.(countWrong(next))
            return
        }
        const attempts = countWrong(next) + 1
        if (!persistent) {
            series.onFinish({ solved: true, attempts })
            return
        }
        if (variant === 'daily') saveDailyGuesses(mode, dateKey, next)
        const before = readLocalStatsMap()
        setStats(recordWin(mode, variant, attempts, dateKey))
        setReward(getReward(before, readLocalStatsMap()))
    }

    const giveUp = () => {
        if (status !== 'playing') return
        setGaveUp(true)
        if (persistent) setStats(resetStreak(mode, variant))
        else series.onFinish({ solved: false, attempts: wrongCount + 1 })
    }

    return {
        target,
        solution,
        guesses,
        wrongCount,
        attempts: wrongCount + 1,
        status,
        stats,
        reward,
        guess,
        giveUp,
    }
}
