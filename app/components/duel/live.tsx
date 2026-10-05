'use client'

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { useLanguage } from "../../context/languageContext";
import { getSupabase } from "../../lib/supabase";
import { getDateKey } from "../../lib/challenge";
import { LIVE_COUNTDOWN_SECONDS, LIVE_ROUND_SECONDS, saveDuelResult, type DuelRoundResult } from "../../lib/duel";
import type { RoundResult } from "../../hooks/useChallenge";
import { ChallengeSession } from "../challenge/game";
import { CARD } from "../challenge/shared";
import { DuelPanel, RoundAnswer, Scoreboard, ShareButton, type DuelViewProps } from "./shared";
import { MODE_META } from "../challenge/modes";

const FIRST_POINTS = 3
const SECOND_POINTS = 1
const TICK_MS = 250

interface Player {
    userId: string;
    name: string;
    joinedAt: number;
}

interface Finish {
    solved: boolean;
    attempts: number;
    ms: number;
}

type Scores = Record<string, number>

type LiveEvent =
    | { type: 'round_start'; index: number; delayMs: number; totals: Scores }
    | { type: 'progress'; userId: string; index: number; wrong: number }
    | { type: 'finished'; userId: string; index: number; result: Finish }
    | { type: 'round_end'; index: number; points: Scores; totals: Scores; results: Record<string, Finish> }

type Phase = 'lobby' | 'round' | 'roundEnd' | 'finished'

function useNow(active: boolean) {
    const [now, setNow] = useState(() => Date.now())
    useEffect(() => {
        if (!active) return
        const timer = setInterval(() => setNow(Date.now()), TICK_MS)
        return () => clearInterval(timer)
    }, [active])
    return now
}

function scoreRoundPoints(results: Record<string, Finish>) {
    const solvers = Object.entries(results)
        .filter(([, result]) => result.solved)
        .sort(([, a], [, b]) => a.ms - b.ms)
    const points: Scores = {}
    solvers.forEach(([userId], position) => {
        points[userId] = position === 0 ? FIRST_POINTS : position === 1 ? SECOND_POINTS : 0
    })
    return points
}

const addScores = (totals: Scores, points: Scores) =>
    Object.fromEntries([...new Set([...Object.keys(totals), ...Object.keys(points)])]
        .map((userId) => [userId, (totals[userId] ?? 0) + (points[userId] ?? 0)]))

export default function LiveDuel({ duel, userId, playerName, onReload, onShowPokedex }: DuelViewProps) {
    const { t } = useLanguage()
    const isHost = duel.created_by === userId
    const rounds = duel.rounds.length
    const channel = useRef<RealtimeChannel | null>(null)
    const endedRound = useRef(-1)
    const saved = useRef(false)
    const [connected, setConnected] = useState(false)
    const [present, setPresent] = useState<Player[]>([])
    const [phase, setPhase] = useState<Phase>('lobby')
    const [index, setIndex] = useState(0)
    const [startAt, setStartAt] = useState(0)
    const [finished, setFinished] = useState<Record<string, Finish>>({})
    const [progress, setProgress] = useState<Scores>({})
    const [totals, setTotals] = useState<Scores>({})
    const [lastPoints, setLastPoints] = useState<Scores>({})
    const [history, setHistory] = useState<DuelRoundResult[]>([])
    const [dateKey] = useState(getDateKey)
    const now = useNow(phase === 'round')

    const players = [...present].sort((a, b) => a.joinedAt - b.joinedAt).slice(0, 2)
    const isPlayer = players.some((player) => player.userId === userId)
    const hostPresent = present.some((player) => player.userId === duel.created_by)
    const countdown = Math.ceil((startAt - now) / 1000)
    const remaining = Math.max(0, Math.ceil((startAt + LIVE_ROUND_SECONDS * 1000 - now) / 1000))

    useEffect(() => {
        const supabase = getSupabase()
        const room = supabase.channel(`duel:${duel.code}`, {
            config: { broadcast: { self: true }, presence: { key: userId } },
        })

        const handle = (event: LiveEvent) => {
            switch (event.type) {
                case 'round_start':
                    setIndex(event.index)
                    setStartAt(Date.now() + event.delayMs)
                    setFinished({})
                    setProgress({})
                    setTotals(event.totals)
                    setPhase('round')
                    break
                case 'progress':
                    setProgress((current) => ({ ...current, [event.userId]: event.wrong }))
                    break
                case 'finished':
                    setFinished((current) => ({ ...current, [event.userId]: event.result }))
                    break
                case 'round_end': {
                    const mine = event.results[userId]
                    setTotals(event.totals)
                    setLastPoints(event.points)
                    setFinished(event.results)
                    setHistory((current) => {
                        const next = [...current]
                        next[event.index] = {
                            solved: mine?.solved ?? false,
                            attempts: mine?.attempts ?? 0,
                            ms: mine?.ms ?? LIVE_ROUND_SECONDS * 1000,
                            score: event.points[userId] ?? 0,
                        }
                        return next
                    })
                    setPhase(event.index >= rounds - 1 ? 'finished' : 'roundEnd')
                    break
                }
            }
        }

        room
            .on('presence', { event: 'sync' }, () => {
                const state = room.presenceState<Player>()
                setPresent(Object.values(state).map((metas) => metas[0]).filter(Boolean))
            })
            .on('broadcast', { event: 'duel' }, ({ payload }) => handle(payload as LiveEvent))
            .subscribe(async (status) => {
                if (status !== 'SUBSCRIBED') return
                setConnected(true)
                await room.track({ userId, name: playerName, joinedAt: Date.now() } satisfies Player)
            })
        channel.current = room

        return () => {
            channel.current = null
            supabase.removeChannel(room)
        }
    }, [duel.code, userId, playerName, rounds])

    const send = (event: LiveEvent) => {
        channel.current?.send({ type: 'broadcast', event: 'duel', payload: event })
    }

    const startRound = (next: number) => {
        send({ type: 'round_start', index: next, delayMs: LIVE_COUNTDOWN_SECONDS * 1000, totals })
    }

    useEffect(() => {
        if (!isHost || phase !== 'round' || players.length < 2) return
        const end = () => {
            if (endedRound.current === index) return
            endedRound.current = index
            const points = scoreRoundPoints(finished)
            channel.current?.send({
                type: 'broadcast',
                event: 'duel',
                payload: { type: 'round_end', index, points, totals: addScores(totals, points), results: finished } satisfies LiveEvent,
            })
        }
        if (players.every((player) => finished[player.userId])) {
            end()
            return
        }
        const timer = setTimeout(end, Math.max(0, startAt + LIVE_ROUND_SECONDS * 1000 - Date.now()))
        return () => clearTimeout(timer)
    }, [isHost, phase, players, finished, index, startAt, totals])

    useEffect(() => {
        if (phase !== 'finished' || !isPlayer || saved.current) return
        saved.current = true
        saveDuelResult(duel.id, playerName, history).catch((error) => console.error(error))
    }, [phase, isPlayer, duel.id, playerName, history])

    const finishRound = ({ solved, attempts }: RoundResult) => {
        send({ type: 'finished', userId, index, result: { solved, attempts, ms: Date.now() - startAt } })
    }

    const scoreRow = (
        <ul className="grid gap-3 sm:grid-cols-2">
            {players.map((player) => (
                <li
                    key={player.userId}
                    className={`${CARD} flex items-center gap-3 p-4 ${player.userId === userId ? 'ring-4 ring-red-600' : ''}`}
                >
                    <span className="text-2xl" aria-hidden>{player.userId === duel.created_by ? '👑' : '🧢'}</span>
                    <span className="min-w-0 flex-1">
                        <span className="block truncate font-black">{player.name}</span>
                        {phase === 'round' && (
                            <span className="block text-xs text-zinc-500">
                                {finished[player.userId]
                                    ? finished[player.userId].solved ? `✓ ${t('duelSolved')}` : `✗ ${t('duelGaveUp')}`
                                    : t('duelMistakes', { n: progress[player.userId] ?? 0 })}
                            </span>
                        )}
                    </span>
                    <AnimatePresence mode="popLayout">
                        <motion.span
                            key={totals[player.userId] ?? 0}
                            initial={{ scale: 1.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-3xl font-black"
                        >
                            {totals[player.userId] ?? 0}
                        </motion.span>
                    </AnimatePresence>
                </li>
            ))}
        </ul>
    )

    if (phase === 'lobby' && duel.duel_results.some((result) => result.user_id === userId)) {
        return (
            <DuelPanel>
                <h3 className="text-2xl font-black">{t('duelScoreboard')}</h3>
                <div className="w-full max-w-2xl text-left">
                    <Scoreboard results={duel.duel_results} userId={userId} rounds={rounds} />
                </div>
            </DuelPanel>
        )
    }

    if (phase === 'lobby') {
        const ready = players.length >= 2
        return (
            <DuelPanel>
                <h3 className="text-2xl font-black">{t('duelLiveLobby')}</h3>
                <p className="max-w-lg text-zinc-500">{t('duelLiveRules', { n: rounds, seconds: LIVE_ROUND_SECONDS })}</p>
                <div className="w-full max-w-2xl text-left">{scoreRow}</div>
                {!connected ? (
                    <p role="status">{t('challengeLoading')}</p>
                ) : !ready ? (
                    <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ type: 'tween', duration: 1.6, repeat: Infinity }} className="font-bold">
                        {t('duelWaitingPlayer')}
                    </motion.p>
                ) : null}
                {isHost ? (
                    <motion.button
                        type="button"
                        disabled={!ready}
                        onClick={() => startRound(0)}
                        whileHover={ready ? { scale: 1.05 } : undefined}
                        whileTap={ready ? { scale: 0.95 } : undefined}
                        className="rounded-2xl bg-red-600 px-8 py-3 text-xl font-black text-white shadow-lg disabled:opacity-50"
                    >
                        {t('duelStart')}
                    </motion.button>
                ) : ready && <p className="font-bold">{t('duelWaitingHost')}</p>}
                {!isPlayer && connected && players.length >= 2 && <p className="text-sm text-zinc-500">{t('duelSpectator')}</p>}
                <ShareButton code={duel.code} text={t('duelShareText', { mode: t(MODE_META[duel.mode].title) })} />
            </DuelPanel>
        )
    }

    const hostLeft = !hostPresent && phase !== 'finished' && (
        <p role="alert" className={`${CARD} p-3 text-center font-bold text-red-600`}>{t('duelHostLeft')}</p>
    )

    if (phase === 'round') {
        const counting = countdown > 0
        const myResult = finished[userId]
        return (
            <>
                {hostLeft}
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <span className="rounded-full bg-white/90 px-4 py-2 font-black shadow dark:bg-zinc-900/90">
                        {t('duelRoundNext', { n: index + 1, total: rounds })}
                    </span>
                    {!counting && (
                        <span className={`rounded-full px-4 py-2 font-mono text-lg font-black shadow ${remaining <= 10 ? 'bg-red-600 text-white' : 'bg-white/90 dark:bg-zinc-900/90'}`}>
                            ⏱ {remaining}s
                        </span>
                    )}
                </div>
                {scoreRow}
                {counting ? (
                    <DuelPanel>
                        <AnimatePresence mode="popLayout">
                            <motion.span
                                key={countdown}
                                initial={{ scale: 2.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.4, opacity: 0 }}
                                className="text-8xl font-black text-red-600"
                            >
                                {countdown}
                            </motion.span>
                        </AnimatePresence>
                    </DuelPanel>
                ) : isPlayer && !myResult ? (
                    <ChallengeSession
                        key={`${duel.code}:live:${index}`}
                        mode={duel.mode}
                        variant="random"
                        dateKey={dateKey}
                        onNextRound={() => undefined}
                        onNewDay={() => undefined}
                        onShowPokedex={onShowPokedex}
                        series={{
                            target: duel.rounds[index],
                            onFinish: finishRound,
                            onGuess: (wrong) => send({ type: 'progress', userId, index, wrong }),
                        }}
                    />
                ) : (
                    <DuelPanel>
                        <p className="text-xl font-black">{myResult?.solved ? `✓ ${t('duelSolved')}` : isPlayer ? `✗ ${t('duelGaveUp')}` : t('duelSpectator')}</p>
                        <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ type: 'tween', duration: 1.6, repeat: Infinity }} className="text-zinc-500">
                            {t('duelWaitingRound')}
                        </motion.p>
                    </DuelPanel>
                )}
            </>
        )
    }

    if (phase === 'roundEnd') {
        return (
            <>
                {hostLeft}
                {scoreRow}
                <DuelPanel>
                    <p className="text-sm font-black uppercase tracking-wide text-zinc-500">{t('duelRoundResult', { n: index + 1 })}</p>
                    <RoundAnswer mode={duel.mode} target={duel.rounds[index]} />
                    <ul className="flex flex-wrap justify-center gap-2">
                        {players.map((player) => (
                            <li key={player.userId} className="rounded-full bg-zinc-100 px-3 py-1 font-bold dark:bg-zinc-800">
                                {player.name}: +{lastPoints[player.userId] ?? 0}
                            </li>
                        ))}
                    </ul>
                    {isHost ? (
                        <motion.button
                            type="button"
                            onClick={() => startRound(index + 1)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="rounded-2xl bg-red-600 px-6 py-3 font-black text-white shadow-lg"
                        >
                            {t('duelNextRound')}
                        </motion.button>
                    ) : (
                        <p className="font-bold">{t('duelWaitingHost')}</p>
                    )}
                </DuelPanel>
            </>
        )
    }

    const ranking = players
        .map((player) => ({ ...player, score: totals[player.userId] ?? 0 }))
        .sort((a, b) => b.score - a.score)
    const winner = ranking.length > 1 && ranking[0].score > ranking[1].score ? ranking[0] : null

    return (
        <DuelPanel>
            <motion.p initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} className="text-6xl" aria-hidden>
                {winner ? '🏆' : '🤝'}
            </motion.p>
            <h3 className="text-3xl font-black">{winner ? t('duelWinner', { name: winner.name }) : t('duelDraw')}</h3>
            <div className="w-full max-w-2xl text-left">
                <Scoreboard
                    results={ranking.map((player) => ({
                        user_id: player.userId,
                        player_name: player.name,
                        score: player.score,
                        rounds: player.userId === userId ? history : [],
                        finished_at: '',
                    }))}
                    userId={userId}
                    rounds={rounds}
                />
            </div>
            <p className="text-sm text-zinc-500">{t('duelLiveSaved')}</p>
            <button type="button" onClick={onReload} className="rounded-xl bg-zinc-100 px-4 py-2 font-bold dark:bg-zinc-800">↻ {t('duelRefresh')}</button>
        </DuelPanel>
    )
}
