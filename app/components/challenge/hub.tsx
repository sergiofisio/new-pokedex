'use client'

import Link from "next/link";
import { motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";
import { useAuth } from "../../context/authContext";
import { useIsClient } from "../../hooks/useIsClient";
import { CHALLENGE_MODES, getCurrentStreak, getDateKey, isSolvedToday, supportsDaily, type ChallengeMode } from "../../lib/challenge";
import ChallengeBackdrop from "./backdrop";
import { MODE_META, ModeIcon } from "./modes";
import { getBadges, getLevelInfo, readLocalStatsMap, totalXp } from "../../lib/progression";
import { BadgeIcon, XpBar, badgeDescription, badgeTitle } from "../progression";

function PlayerProgress({ profileHref }: { profileHref: string | null }) {
    const { t } = useLanguage()
    const stats = readLocalStatsMap()
    const badges = getBadges(stats)
    const unlocked = badges.filter((badge) => badge.unlocked).length

    return (
        <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.05 } }}
            className="mt-6 rounded-3xl bg-white/85 p-5 shadow-xl backdrop-blur-sm dark:bg-zinc-900/85"
        >
            <XpBar info={getLevelInfo(totalXp(stats))} />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-bold text-zinc-500">{t('badgesUnlocked', { n: unlocked, total: badges.length })}</p>
                {profileHref && (
                    <Link href={profileHref} className="text-sm font-bold text-red-600 underline-offset-2 hover:underline dark:text-red-400">
                        {t('viewAllBadges')} →
                    </Link>
                )}
            </div>
            <ul className="mt-2 flex flex-wrap gap-2">
                {badges.map((badge, index) => (
                    <motion.li
                        key={badge.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1, transition: { delay: 0.15 + index * 0.03 } }}
                        whileHover={{ scale: 1.15 }}
                        title={`${t(badgeTitle(badge.id))}: ${t(badgeDescription(badge.id))} (${badge.progress}/${badge.target})`}
                        className="cursor-pointer"
                    >
                        <BadgeIcon badge={badge} />
                        <span className="sr-only">{t(badgeTitle(badge.id))}</span>
                    </motion.li>
                ))}
            </ul>
        </motion.section>
    )
}

export default function ChallengeHub() {
    const { t } = useLanguage()
    const { user, profile, loading } = useAuth()
    const isClient = useIsClient()

    const getBadge = (mode: ChallengeMode) => {
        if (!isClient) return null
        const dateKey = getDateKey()
        if (supportsDaily(mode)) return isSolvedToday(mode, dateKey) ? `✓ ${t('solvedToday')}` : null
        const streak = getCurrentStreak(mode, 'random', dateKey)
        return streak > 0 ? t('streakCount', { n: streak }) : null
    }

    return (
        <ChallengeBackdrop generation={1}>
            <div className="mx-auto w-full max-w-4xl px-4 py-10">
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl bg-white/85 p-6 text-center shadow-xl backdrop-blur-sm dark:bg-zinc-900/85"
                >
                    <h2 className="text-4xl font-black tracking-tight">{t('challengesTitle')}</h2>
                    <p className="mt-2 text-zinc-600 dark:text-zinc-300">{t('challengesSubtitle')}</p>
                    {!loading && (
                        <p className="mx-auto mt-4 w-fit rounded-full bg-zinc-100 px-4 py-1.5 text-sm font-semibold dark:bg-zinc-800">
                            {user && profile?.username ? (
                                t('syncedProgress', { name: profile.username })
                            ) : (
                                <Link href="/entrar" className="text-red-600 underline-offset-2 hover:underline dark:text-red-400">
                                    {t('signInToSync')}
                                </Link>
                            )}
                        </p>
                    )}
                </motion.div>

                {isClient && <PlayerProgress profileHref={profile?.username ? `/u/${profile.username}` : null} />}

                <ul className="mt-8 grid gap-5 sm:grid-cols-2">
                    {CHALLENGE_MODES.map((mode, index) => {
                        const meta = MODE_META[mode]
                        const badge = getBadge(mode)
                        return (
                            <motion.li
                                key={mode}
                                initial={{ opacity: 0, y: 24, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: 0.1 + index * 0.08 } }}
                            >
                                <Link href={`/desafios/${mode}`} className="block rounded-3xl focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-red-600">
                                    <motion.div
                                        whileHover={{ y: -6, scale: 1.02 }}
                                        whileTap={{ scale: 0.97 }}
                                        className={`relative flex min-h-36 items-center gap-5 overflow-hidden rounded-3xl border-4 border-white/30 p-6 text-white shadow-xl ${meta.accent}`}
                                    >
                                        <span aria-hidden="true" className="absolute -right-8 -bottom-8 size-36 rounded-full border-14 border-white/10" />
                                        <motion.span
                                            whileHover={{ rotate: [0, -12, 12, 0], transition: { type: 'tween', duration: 0.5 } }}
                                            className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white/15"
                                        >
                                            <ModeIcon mode={mode} />
                                        </motion.span>
                                        <div className="relative">
                                            <h3 className="text-2xl font-black">{t(meta.title)}</h3>
                                            <p className="text-sm opacity-90">{t(meta.description)}</p>
                                            {badge && (
                                                <motion.span
                                                    initial={{ opacity: 0, scale: 0.6 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="mt-2 inline-block rounded-full bg-white px-2.5 py-0.5 text-xs font-black text-green-700"
                                                >
                                                    {badge}
                                                </motion.span>
                                            )}
                                        </div>
                                    </motion.div>
                                </Link>
                            </motion.li>
                        )
                    })}
                </ul>
            </div>
        </ChallengeBackdrop>
    )
}
