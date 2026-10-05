'use client'

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";
import { DUEL_MODES, createDuel, fetchRecentDuels, isDuelCode, normalizeCode, type Duel, type DuelKind } from "../../lib/duel";
import type { ChallengeMode } from "../../lib/challenge";
import ChallengeBackdrop from "../challenge/backdrop";
import { MODE_META, ModeIcon } from "../challenge/modes";
import { CARD } from "../challenge/shared";
import { DuelGate } from "./shared";

export default function DuelLobby() {
    return (
        <ChallengeBackdrop generation={6}>
            <DuelGate>{(userId, playerName) => <LobbyContent userId={userId} playerName={playerName} />}</DuelGate>
        </ChallengeBackdrop>
    )
}

function LobbyContent({ userId, playerName }: { userId: string; playerName: string }) {
    const { t } = useLanguage()
    const router = useRouter()
    const [mode, setMode] = useState<ChallengeMode>(DUEL_MODES[0])
    const [kind, setKind] = useState<DuelKind>('async')
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [code, setCode] = useState('')
    const [recent, setRecent] = useState<Duel[] | null>(null)

    useEffect(() => {
        let ignore = false
        fetchRecentDuels(userId).then(
            (duels) => { if (!ignore) setRecent(duels) },
            (failure) => {
                console.error(failure)
                if (!ignore) setRecent([])
            },
        )
        return () => { ignore = true }
    }, [userId])

    const create = async () => {
        setBusy(true)
        setError(null)
        try {
            router.push(`/duelo/${await createDuel(mode, kind, playerName)}`)
        } catch (failure) {
            setError(t('authGenericError', { message: (failure as Error).message }))
            setBusy(false)
        }
    }

    const join = (event: FormEvent) => {
        event.preventDefault()
        const normalized = normalizeCode(code)
        if (isDuelCode(normalized)) router.push(`/duelo/${normalized}`)
        else setError(t('duelInvalidCode'))
    }

    return (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10">
            <Link href="/desafios" className="w-fit rounded-full bg-white/90 px-3 py-1 text-sm font-bold shadow dark:bg-zinc-900/90">
                ← {t('backToChallenges')}
            </Link>

            <motion.header
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl bg-linear-to-br from-red-600 to-orange-500 p-6 text-white shadow-xl"
            >
                <h2 className="text-3xl font-black">⚔️ {t('duelTitle')}</h2>
                <p className="mt-1 opacity-90">{t('duelSubtitle')}</p>
            </motion.header>

            <section className={`${CARD} flex flex-col gap-5 p-6`}>
                <h3 className="text-xl font-black">{t('duelCreate')}</h3>
                <div role="radiogroup" aria-label={t('duelKind')} className="grid gap-3 sm:grid-cols-2">
                    {(['async', 'live'] as const).map((option) => (
                        <button
                            key={option}
                            type="button"
                            role="radio"
                            aria-checked={kind === option}
                            onClick={() => setKind(option)}
                            className={`rounded-2xl border-4 p-4 text-left transition-colors ${
                                kind === option ? 'border-red-600 bg-red-50 dark:bg-red-950/40' : 'border-transparent bg-zinc-100 dark:bg-zinc-800'
                            }`}
                        >
                            <span className="block font-black">{t(option === 'async' ? 'duelAsync' : 'duelLive')}</span>
                            <span className="block text-sm text-zinc-500">{t(option === 'async' ? 'duelAsyncDesc' : 'duelLiveDesc')}</span>
                        </button>
                    ))}
                </div>
                <div role="radiogroup" aria-label={t('duelMode')} className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {DUEL_MODES.map((option) => {
                        const meta = MODE_META[option]
                        const selected = mode === option
                        return (
                            <motion.button
                                key={option}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                onClick={() => setMode(option)}
                                whileTap={{ scale: 0.95 }}
                                className={`flex items-center gap-3 rounded-2xl p-3 font-black text-white shadow ${meta.accent} ${
                                    selected ? 'ring-4 ring-red-600 ring-offset-2 dark:ring-offset-zinc-900' : 'opacity-75 hover:opacity-100'
                                }`}
                            >
                                <ModeIcon mode={option} className="size-8 shrink-0" />
                                {t(meta.title)}
                            </motion.button>
                        )
                    })}
                </div>
                <motion.button
                    type="button"
                    disabled={busy}
                    onClick={create}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="rounded-2xl bg-red-600 px-5 py-3 text-lg font-black text-white shadow-lg disabled:opacity-60"
                >
                    {busy ? t('challengeLoading') : t('duelCreateButton')}
                </motion.button>
            </section>

            <form onSubmit={join} className={`${CARD} flex flex-wrap items-end gap-3 p-6`}>
                <label className="flex flex-1 flex-col gap-1 font-black">
                    {t('duelJoin')}
                    <input
                        value={code}
                        onChange={(event) => setCode(event.target.value)}
                        maxLength={6}
                        placeholder="ABC123"
                        className="rounded-xl border-4 border-zinc-900 px-3 py-2 font-mono text-lg uppercase tracking-[0.3em] outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-900"
                    />
                </label>
                <button type="submit" className="rounded-xl bg-zinc-900 px-5 py-3 font-black text-white dark:bg-white dark:text-zinc-900">
                    {t('duelJoinButton')}
                </button>
            </form>

            {error && <p role="alert" className={`${CARD} p-4 font-bold text-red-600`}>{error}</p>}

            <section className={`${CARD} p-6`}>
                <h3 className="mb-3 text-xl font-black">{t('duelRecent')}</h3>
                {recent === null ? (
                    <p role="status">{t('challengeLoading')}</p>
                ) : recent.length === 0 ? (
                    <p className="text-zinc-500">{t('duelNoRecent')}</p>
                ) : (
                    <ul className="flex flex-col gap-2">
                        {recent.map((duel) => (
                            <li key={duel.id}>
                                <Link href={`/duelo/${duel.code}`} className="flex flex-wrap items-center gap-3 rounded-2xl bg-zinc-100 p-3 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">
                                    <span className={`flex size-10 items-center justify-center rounded-xl text-white ${MODE_META[duel.mode].accent}`}>
                                        <ModeIcon mode={duel.mode} className="size-6" />
                                    </span>
                                    <span className="flex-1">
                                        <span className="block font-black">{t(MODE_META[duel.mode].title)} · {t(duel.kind === 'async' ? 'duelAsync' : 'duelLive')}</span>
                                        <span className="block text-xs text-zinc-500">
                                            {duel.duel_results.length
                                                ? duel.duel_results.map((result) => `${result.player_name} ${result.score}`).join(' × ')
                                                : t('duelWaiting')}
                                        </span>
                                    </span>
                                    <span className="font-mono text-sm font-bold tracking-widest">{duel.code}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    )
}
