'use client'

import { useEffect, useEffectEvent, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";
import Link from "next/link";
import { formatCountdown, getDateKey, getNextMode, msUntilTomorrow, type ChallengeMode, type ChallengeStats, type ChallengeVariant } from "../../lib/challenge";
import { MODE_META, ModeIcon } from "./modes";
import { getOfficialArtwork } from "../../lib/sprites";
import { prettify } from "../../i18n/translations";
import type { ChallengeStatus } from "../../hooks/useChallenge";
import { getLevelInfo, readLocalStatsMap, totalXp, type Reward } from "../../lib/progression";
import { BadgeIcon, XpBar, badgeDescription, badgeTitle } from "../progression";
import { CARD } from "./shared";

interface ResultPanelProps {
    mode: ChallengeMode;
    status: Exclude<ChallengeStatus, 'playing'>;
    target: { id: number; name: string };
    attempts: number;
    stats: ChallengeStats;
    reward: Reward | null;
    variant: ChallengeVariant;
    onNext: () => void;
    onNewDay: () => void;
    onShowPokedex: (id: number) => void;
}

export default function ResultPanel({ mode, status, target, attempts, stats, reward, variant, onNext, onNewDay, onShowPokedex }: ResultPanelProps) {
    const { t } = useLanguage()
    const won = status === 'won'
    const name = prettify(target.name)
    const average = stats.wins ? (stats.totalAttempts / stats.wins).toFixed(1) : '-'
    const maxBucket = Math.max(1, ...stats.distribution)
    const [nextMode] = useState(() => getNextMode(mode, getDateKey()))

    const summary = [
        { label: t('statsWins'), value: stats.wins },
        { label: t('statsStreak'), value: stats.streak },
        { label: t('statsBestStreak'), value: stats.bestStreak },
        { label: t('statsAverage'), value: average },
    ]

    return (
        <motion.section
            role="status"
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className={`${CARD} border-4 p-6 text-center ${won ? 'border-green-500' : 'border-red-500'}`}
        >
            <h3 className={`text-2xl font-black ${won ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {t(won ? 'wonTitle' : 'gaveUpTitle')}
            </h3>

            <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 180, damping: 12, delay: 0.15 }}
                className="relative mx-auto my-3 size-40"
            >
                <Image src={getOfficialArtwork(target.id)} alt={t('illustrationOf', { name })} fill sizes="10rem" className="object-contain drop-shadow-xl" />
            </motion.div>

            <p className="text-lg font-bold">{t('itWas', { name })}</p>
            {won && <p className="text-sm text-zinc-600 dark:text-zinc-400">{t('attemptsCount', { n: attempts })}</p>}

            {reward && <RewardSummary reward={reward} />}

            <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {summary.map(({ label, value }, index) => (
                    <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: 0.3 + index * 0.06 } }}
                        className="rounded-xl bg-zinc-100 p-2 dark:bg-zinc-800"
                    >
                        <dt className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">{label}</dt>
                        <dd className="text-2xl font-black">{value}</dd>
                    </motion.div>
                ))}
            </dl>

            {stats.wins > 0 && (
                <div className="mt-5 text-left">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">{t('statsDistribution')}</p>
                    <ul className="flex flex-col gap-1">
                        {stats.distribution.map((count, index) => {
                            const current = won && Math.min(attempts, stats.distribution.length) === index + 1
                            return (
                                <li key={index} className="flex items-center gap-2 text-xs font-bold">
                                    <span className="w-6 text-right font-mono">{index + 1}{index === stats.distribution.length - 1 ? '+' : ''}</span>
                                    <motion.span
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.max(8, (count / maxBucket) * 100)}%` }}
                                        transition={{ duration: 0.6, delay: 0.4 + index * 0.05 }}
                                        className={`rounded px-1.5 py-0.5 text-right text-white ${current ? 'bg-green-600' : 'bg-zinc-500'}`}
                                    >
                                        {count}
                                    </motion.span>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <motion.button
                    type="button"
                    onClick={() => onShowPokedex(target.id)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-xl bg-zinc-900 px-4 py-2 font-bold text-white dark:bg-white dark:text-zinc-900"
                >
                    {t('viewInPokedex')}
                </motion.button>
                {variant === 'random' ? (
                    <motion.button
                        type="button"
                        autoFocus
                        onClick={onNext}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.95 }}
                        className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white"
                    >
                        {t('newPokemon')}
                    </motion.button>
                ) : (
                    <Countdown onNewDay={onNewDay} />
                )}
            </div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.6 } }} className="mt-4">
                <Link
                    href={`/desafios/${nextMode}`}
                    autoFocus={variant === 'daily'}
                    className={`group flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 active:scale-[0.98] ${MODE_META[nextMode].accent}`}
                >
                    <span className="flex items-center gap-3">
                        <ModeIcon mode={nextMode} className="size-8 shrink-0" />
                        <span>
                            <span className="block text-[11px] font-black uppercase tracking-wide opacity-80">{t('nextChallenge')}</span>
                            <span className="block text-lg font-black leading-tight">{t(MODE_META[nextMode].title)}</span>
                        </span>
                    </span>
                    <span aria-hidden="true" className="text-2xl transition-transform group-hover:translate-x-1">→</span>
                </Link>
            </motion.div>
        </motion.section>
    )
}

function RewardSummary({ reward }: { reward: Reward }) {
    const { t } = useLanguage()
    const [info] = useState(() => getLevelInfo(totalXp(readLocalStatsMap())))

    return (
        <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-800/70">
            <div className="flex flex-wrap items-center justify-center gap-2">
                <motion.span
                    initial={{ opacity: 0, scale: 0.4, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 12, delay: 0.3 }}
                    className="rounded-full bg-linear-to-r from-sky-500 to-indigo-600 px-3 py-1 text-sm font-black text-white shadow"
                >
                    +{reward.xp} XP
                </motion.span>
                {reward.levelUp && (
                    <motion.span
                        initial={{ opacity: 0, scale: 0.4 }}
                        animate={{ opacity: 1, scale: [1, 1.15, 1] }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="rounded-full bg-linear-to-r from-amber-400 to-red-500 px-3 py-1 text-sm font-black text-white shadow"
                    >
                        ⬆ {t('levelReached', { n: reward.levelUp })}
                    </motion.span>
                )}
            </div>
            <XpBar info={info} compact />
            {reward.badges.length > 0 && (
                <ul className="flex flex-col gap-2">
                    {reward.badges.map((badge, index) => (
                        <motion.li
                            key={badge.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0, transition: { delay: 0.7 + index * 0.15 } }}
                            className="flex items-center gap-3 rounded-xl bg-amber-50 p-2 text-left dark:bg-amber-950/40"
                        >
                            <motion.span initial={{ rotate: -180, scale: 0 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', delay: 0.8 + index * 0.15 }}>
                                <BadgeIcon badge={badge} />
                            </motion.span>
                            <span>
                                <span className="block text-[11px] font-black uppercase tracking-wide text-amber-600 dark:text-amber-400">{t('badgeUnlocked')}</span>
                                <span className="block font-black">{t(badgeTitle(badge.id))}</span>
                                <span className="block text-xs text-zinc-500">{t(badgeDescription(badge.id))}</span>
                            </span>
                        </motion.li>
                    ))}
                </ul>
            )}
        </div>
    )
}

function Countdown({ onNewDay }: { onNewDay: () => void }) {
    const { t } = useLanguage()
    const [startKey] = useState(getDateKey)
    const [remaining, setRemaining] = useState(msUntilTomorrow)
    const notifyNewDay = useEffectEvent(onNewDay)

    useEffect(() => {
        const timer = setInterval(() => {
            if (getDateKey() !== startKey) notifyNewDay()
            else setRemaining(msUntilTomorrow())
        }, 1000)
        return () => clearInterval(timer)
    }, [startKey])

    return (
        <p className="rounded-xl bg-zinc-100 px-4 py-2 text-sm font-bold dark:bg-zinc-800">
            {t('nextChallengeIn')} <span className="font-mono text-red-600 dark:text-red-400">{formatCountdown(remaining)}</span>
        </p>
    )
}
