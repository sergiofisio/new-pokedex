'use client'

import { useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import PokedexModal from "../pokedexModal";
import { useLanguage } from "../../context/languageContext";
import { useAsyncData } from "../../hooks/useAsyncData";
import { getDateKey } from "../../lib/challenge";
import { fetchDuel, saveDuelResult, scoreRound, type Duel, type DuelRoundResult } from "../../lib/duel";
import type { RoundResult } from "../../hooks/useChallenge";
import ChallengeBackdrop from "../challenge/backdrop";
import { ChallengeSession } from "../challenge/game";
import { MODE_META, ModeIcon } from "../challenge/modes";
import { CARD } from "../challenge/shared";
import { DuelGate, DuelPanel, RoundAnswer, Scoreboard, ShareButton, type DuelViewProps } from "./shared";
import LiveDuel from "./live";

const NO_NAVIGATION: number[] = []

const loadDuel = (key: string) => fetchDuel(key.split(':')[0])

export default function DuelRoom({ code }: { code: string }) {
    const [pokedexId, setPokedexId] = useState<number | null>(null)

    return (
        <ChallengeBackdrop generation={6}>
            <DuelGate>
                {(userId, playerName) => <DuelLoader code={code} userId={userId} playerName={playerName} onShowPokedex={setPokedexId} />}
            </DuelGate>
            <PokedexModal speciesId={pokedexId} navigationIds={NO_NAVIGATION} onClose={() => setPokedexId(null)} onNavigate={setPokedexId} />
        </ChallengeBackdrop>
    )
}

interface DuelLoaderProps {
    code: string;
    userId: string;
    playerName: string;
    onShowPokedex: (id: number) => void;
}

function DuelLoader({ code, userId, playerName, onShowPokedex }: DuelLoaderProps) {
    const { t } = useLanguage()
    const [version, setVersion] = useState(0)
    const result = useAsyncData(`${code}:${version}`, loadDuel)
    const [lastDuel, setLastDuel] = useState<Duel | null>(null)
    const duel = result?.status === 'success' ? result.data : lastDuel

    if (result?.status === 'success' && result.data && result.data !== lastDuel) setLastDuel(result.data)

    if (!duel && !result) return <p role="status" className={`${CARD} mx-auto mt-10 w-fit p-5`}>{t('challengeLoading')}</p>
    if (!duel) {
        return (
            <div className={`${CARD} mx-auto mt-10 flex max-w-md flex-col items-center gap-4 p-6 text-center`}>
                <p className="font-bold">{t('duelNotFound')}</p>
                <Link href="/duelo" className="rounded-xl bg-red-600 px-5 py-2 font-black text-white">{t('duelBack')}</Link>
            </div>
        )
    }

    const props: DuelViewProps = { duel, userId, playerName, onReload: () => setVersion((value) => value + 1), onShowPokedex }
    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6">
            <DuelHeader duel={duel} />
            {duel.kind === 'live' ? <LiveDuel {...props} /> : <AsyncDuel {...props} />}
        </div>
    )
}

function DuelHeader({ duel }: { duel: Duel }) {
    const { t } = useLanguage()
    const meta = MODE_META[duel.mode]
    return (
        <>
            <Link href="/duelo" className="w-fit rounded-full bg-white/90 px-3 py-1 text-sm font-bold shadow dark:bg-zinc-900/90">
                ← {t('duelBack')}
            </Link>
            <motion.header
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-wrap items-center gap-4 rounded-3xl p-5 text-white shadow-xl ${meta.accent}`}
            >
                <ModeIcon mode={duel.mode} className="size-12 shrink-0" />
                <div className="flex-1">
                    <h2 className="text-2xl font-black">⚔️ {t('duelTitle')} · {t(meta.title)}</h2>
                    <p className="text-sm opacity-90">
                        {t(duel.kind === 'async' ? 'duelAsync' : 'duelLive')} · {t('duelCreatedBy', { name: duel.creator_name })}
                    </p>
                </div>
                <span className="rounded-xl bg-white/20 px-3 py-1 font-mono text-lg font-black tracking-[0.3em]">{duel.code}</span>
            </motion.header>
        </>
    )
}

const progressKey = (code: string) => `duel-progress:${code}`

function readProgress(code: string): DuelRoundResult[] {
    try {
        const parsed = JSON.parse(localStorage.getItem(progressKey(code)) ?? '[]')
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

const roundStartKey = (code: string) => `duel-round-start:${code}`

function readRoundStart(code: string, index: number) {
    try {
        const saved = JSON.parse(localStorage.getItem(roundStartKey(code)) ?? 'null') as { index: number; at: number } | null
        return saved?.index === index ? saved.at : null
    } catch {
        return null
    }
}

function AsyncDuel({ duel, userId, playerName, onReload, onShowPokedex }: DuelViewProps) {
    const { t } = useLanguage()
    const mine = duel.duel_results.find((result) => result.user_id === userId)
    const [results, setResults] = useState<DuelRoundResult[]>(() => readProgress(duel.code))
    const [resumed] = useState(() => readRoundStart(duel.code, results.length))
    const [playing, setPlaying] = useState(resumed !== null)
    const [saveError, setSaveError] = useState<string | null>(null)
    const startedAt = useRef(resumed ?? 0)
    const [dateKey] = useState(getDateKey)
    const index = results.length
    const rounds = duel.rounds.length
    const shareText = t('duelShareText', { mode: t(MODE_META[duel.mode].title) })

    const begin = () => {
        startedAt.current = Date.now()
        localStorage.setItem(roundStartKey(duel.code), JSON.stringify({ index, at: startedAt.current }))
        setPlaying(true)
    }

    const save = async (final: DuelRoundResult[]) => {
        try {
            await saveDuelResult(duel.id, playerName, final)
            localStorage.removeItem(progressKey(duel.code))
            localStorage.removeItem(roundStartKey(duel.code))
            onReload()
        } catch (failure) {
            setSaveError(t('authGenericError', { message: (failure as Error).message }))
        }
    }

    const finishRound = ({ solved, attempts }: RoundResult) => {
        const ms = Date.now() - startedAt.current
        const next = [...results, { solved, attempts, ms, score: scoreRound(solved, attempts, ms) }]
        localStorage.setItem(progressKey(duel.code), JSON.stringify(next))
        setResults(next)
        setPlaying(false)
    }

    if (mine) {
        return (
            <DuelPanel>
                <h3 className="text-2xl font-black">{t('duelScoreboard')}</h3>
                <div className="w-full max-w-2xl text-left">
                    <Scoreboard results={duel.duel_results} userId={userId} rounds={rounds} />
                </div>
                {duel.duel_results.length < 2 && <p className="text-sm text-zinc-500">{t('duelWaitingRival')}</p>}
                <div className="flex flex-wrap justify-center gap-2">
                    <ShareButton code={duel.code} text={shareText} />
                    <button type="button" onClick={onReload} className="rounded-xl bg-zinc-100 px-4 py-2 font-bold dark:bg-zinc-800">↻ {t('duelRefresh')}</button>
                </div>
            </DuelPanel>
        )
    }

    const last = results.at(-1)
    const lastSummary = last && (
        <div className="flex flex-col items-center gap-2 rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-800">
            <p className="text-sm font-black uppercase tracking-wide text-zinc-500">
                {t('duelRoundResult', { n: index })} · {last.solved ? `+${last.score} pts` : t('duelRoundMissed')}
            </p>
            <RoundAnswer mode={duel.mode} target={duel.rounds[index - 1]} />
        </div>
    )

    if (index >= rounds) {
        const total = results.reduce((sum, round) => sum + round.score, 0)
        return (
            <DuelPanel>
                <RoundTracker results={results} total={rounds} />
                {lastSummary}
                <h3 className="text-2xl font-black">{t('duelFinished', { score: total })}</h3>
                {saveError ? (
                    <>
                        <p role="alert" className="text-red-600">{saveError}</p>
                        <button type="button" onClick={() => save(results)} className="rounded-xl bg-red-600 px-5 py-2 font-black text-white">{t('duelRetrySave')}</button>
                    </>
                ) : (
                    <button type="button" onClick={() => save(results)} className="rounded-xl bg-red-600 px-5 py-2 font-black text-white">{t('duelSeeScoreboard')}</button>
                )}
            </DuelPanel>
        )
    }

    if (!playing) {
        return (
            <DuelPanel>
                {index > 0 && <RoundTracker results={results} total={rounds} />}
                {lastSummary}
                <h3 className="text-2xl font-black">{index === 0 ? t('duelReady') : t('duelRoundNext', { n: index + 1, total: rounds })}</h3>
                <p className="max-w-lg text-zinc-500">{t('duelAsyncRules', { n: rounds })}</p>
                {duel.duel_results.length > 0 && (
                    <p className="font-bold">{t('duelBeat', { name: duel.duel_results[0].player_name, score: duel.duel_results[0].score })}</p>
                )}
                <motion.button
                    type="button"
                    onClick={begin}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-2xl bg-red-600 px-8 py-3 text-xl font-black text-white shadow-lg"
                >
                    {index === 0 ? t('duelStart') : t('duelContinue')}
                </motion.button>
                {index === 0 && <ShareButton code={duel.code} text={shareText} />}
            </DuelPanel>
        )
    }

    return (
        <>
            <RoundTracker results={results} total={rounds} />
            <ChallengeSession
                key={`${duel.code}:${index}`}
                mode={duel.mode}
                variant="random"
                dateKey={dateKey}
                onNextRound={() => undefined}
                onNewDay={() => undefined}
                onShowPokedex={onShowPokedex}
                series={{ target: duel.rounds[index], onFinish: finishRound }}
            />
        </>
    )
}

function RoundTracker({ results, total }: { results: DuelRoundResult[]; total: number }) {
    const { t } = useLanguage()
    return (
        <ol className="flex flex-wrap items-center justify-center gap-2" aria-label={t('duelRounds')}>
            {Array.from({ length: total }, (_, round) => {
                const entry = results[round]
                const current = round === results.length
                return (
                    <li
                        key={round}
                        className={`flex h-10 min-w-16 items-center justify-center rounded-full px-3 text-sm font-black shadow ${
                            entry ? (entry.solved ? 'bg-green-600 text-white' : 'bg-red-600 text-white') : current ? 'bg-white ring-4 ring-red-600 dark:bg-zinc-900' : 'bg-white/80 dark:bg-zinc-900/80'
                        }`}
                    >
                        {entry ? `${entry.score} pts` : t('duelRoundShort', { n: round + 1 })}
                    </li>
                )
            })}
            <li className="rounded-full bg-white/90 px-3 py-2 text-sm font-black shadow dark:bg-zinc-900/90">
                Σ {results.reduce((sum, round) => sum + round.score, 0)}
            </li>
        </ol>
    )
}
