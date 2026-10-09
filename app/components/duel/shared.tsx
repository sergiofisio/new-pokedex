'use client'

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useAuth } from "../../context/authContext";
import { useLanguage } from "../../context/languageContext";
import { getModeWorld, getSolution, type ChallengeMode } from "../../lib/challenge";
import { shareDuel, type Duel, type DuelResult } from "../../lib/duel";
import { getOfficialArtwork } from "../../lib/sprites";
import { CARD, useSpeciesName } from "../challenge/shared";
import { useHsData } from "../hearthstone/data";
import { HsCardImage } from "../hearthstone/cardImage";
import { cardName } from "../../lib/hearthstone";

export function DuelGate({ children }: { children: (userId: string, playerName: string) => ReactNode }) {
    const { t } = useLanguage()
    const { user, profile, loading } = useAuth()

    if (loading) return <p role="status" className={`${CARD} mx-auto mt-10 w-fit p-5`}>{t('challengeLoading')}</p>
    if (!user || !profile?.username) {
        return (
            <div className={`${CARD} mx-auto mt-10 flex max-w-md flex-col items-center gap-4 p-6 text-center`}>
                <p className="text-4xl" aria-hidden>⚔️</p>
                <p className="font-bold">{t('duelSignIn')}</p>
                <Link href={user ? '/completar-perfil' : '/entrar'} className="rounded-xl bg-red-600 px-5 py-2 font-black text-white">
                    {t(user ? 'completeProfileTitle' : 'signIn')}
                </Link>
            </div>
        )
    }
    return children(user.id, profile.display_name || profile.username)
}

export function ShareButton({ code, text }: { code: string; text: string }) {
    const { t } = useLanguage()
    const [copied, setCopied] = useState(false)

    const share = async () => {
        if (await shareDuel(code, text) === 'copied') {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <motion.button
            type="button"
            onClick={share}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-xl bg-zinc-900 px-4 py-2 font-black text-white dark:bg-white dark:text-zinc-900"
        >
            {copied ? `✓ ${t('duelLinkCopied')}` : `🔗 ${t('duelShare')}`}
        </motion.button>
    )
}

export function Scoreboard({ results, userId, rounds }: { results: DuelResult[]; userId: string; rounds: number }) {
    const { t } = useLanguage()
    const sorted = [...results].sort((a, b) => b.score - a.score)
    const best = sorted[0]?.score

    return (
        <ol className="flex flex-col gap-2">
            {sorted.map((result, index) => (
                <motion.li
                    key={result.user_id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: index * 0.08 } }}
                    className={`flex flex-wrap items-center gap-3 rounded-2xl p-3 ${
                        result.user_id === userId ? 'bg-red-50 ring-2 ring-red-600 dark:bg-red-950/40' : 'bg-zinc-100 dark:bg-zinc-800'
                    }`}
                >
                    <span className="w-8 text-center text-xl font-black">{result.score === best && sorted.length > 1 ? '👑' : index + 1}</span>
                    <span className="min-w-0 flex-1 truncate font-black">{result.player_name}</span>
                    <span className="flex gap-1" aria-label={t('duelRounds')}>
                        {Array.from({ length: rounds }, (_, round) => {
                            const entry = result.rounds[round]
                            return (
                                <span
                                    key={round}
                                    title={entry ? t('duelRoundTitle', { n: round + 1, score: entry.score }) : undefined}
                                    className={`flex size-8 items-center justify-center rounded-lg text-xs font-black ${
                                        !entry ? 'bg-zinc-300 dark:bg-zinc-700' : entry.solved ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                                    }`}
                                >
                                    {entry ? entry.score : '–'}
                                </span>
                            )
                        })}
                    </span>
                    <span className="w-16 text-right text-2xl font-black">{result.score}</span>
                </motion.li>
            ))}
        </ol>
    )
}

export interface DuelViewProps {
    duel: Duel;
    userId: string;
    playerName: string;
    onReload: () => void;
    onShowDetail: (id: number) => void;
}

export function RoundAnswer({ mode, target }: { mode: ChallengeMode; target: number }) {
    if (getModeWorld(mode) === 'hearthstone') return <CardRoundAnswer dbfId={getSolution(mode, target)[0]} />
    return <PokemonRoundAnswer mode={mode} target={target} />
}

function CardRoundAnswer({ dbfId }: { dbfId: number }) {
    const { language } = useLanguage()
    const state = useHsData()
    const card = state?.status === 'success' ? state.data.byDbf.get(dbfId) : undefined
    if (!card) return null
    return (
        <span className="flex items-center justify-center gap-3 font-black">
            <span className="w-14"><HsCardImage card={card} /></span>
            {cardName(card, language)}
        </span>
    )
}

function PokemonRoundAnswer({ mode, target }: { mode: ChallengeMode; target: number }) {
    const getName = useSpeciesName()
    const ids = getSolution(mode, target)
    return (
        <span className="flex flex-wrap items-center justify-center gap-3">
            {ids.map((id) => (
                <span key={id} className="flex items-center gap-2 font-black">
                    <Image src={getOfficialArtwork(id)} alt="" width={56} height={56} className="size-14 object-contain" />
                    {getName(id)}
                </span>
            ))}
        </span>
    )
}

export function DuelPanel({ children }: { children: ReactNode }) {
    return (
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={`${CARD} flex flex-col items-center gap-4 p-6 text-center`}>
            {children}
        </motion.section>
    )
}
