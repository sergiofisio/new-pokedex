'use client'

import { motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";
import type { MessageKey } from "../../i18n/translations";
import { getBadges, getLevelInfo, totalXp, type Badge, type BadgeTier, type LevelInfo, type StatsMap } from "../../lib/progression";

const TIER_STYLES: Record<BadgeTier, string> = {
    bronze: 'from-amber-600 to-orange-800 ring-amber-300',
    silver: 'from-slate-300 to-slate-500 ring-slate-100',
    gold: 'from-yellow-300 to-amber-500 ring-yellow-100',
}

export const badgeTitle = (id: string) => `badge_${id}` as MessageKey
export const badgeDescription = (id: string) => `badge_${id}_desc` as MessageKey

export function XpBar({ info, compact = false }: { info: LevelInfo; compact?: boolean }) {
    const { t } = useLanguage()
    const percent = Math.round((info.current / info.needed) * 100)

    return (
        <div className="flex w-full items-center gap-4">
            <motion.div
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                className={`relative flex shrink-0 flex-col items-center justify-center rounded-full bg-linear-to-br from-red-500 to-red-700 font-black text-white shadow-lg ring-4 ring-white dark:ring-zinc-800 ${compact ? 'size-14' : 'size-20'}`}
            >
                <span className="text-[10px] uppercase leading-none tracking-widest opacity-80">{t('levelShort')}</span>
                <span className={`leading-none ${compact ? 'text-xl' : 'text-3xl'}`}>{info.level}</span>
            </motion.div>
            <div className="min-w-0 flex-1 text-left">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className={`font-black ${compact ? 'text-base' : 'text-xl'}`}>{t(info.rank)}</p>
                    <p className="font-mono text-xs font-bold text-zinc-500">
                        {info.current} / {info.needed} XP
                    </p>
                </div>
                <div
                    role="progressbar"
                    aria-label={t('xpProgress')}
                    aria-valuemin={0}
                    aria-valuemax={info.needed}
                    aria-valuenow={info.current}
                    className="relative mt-1.5 h-4 overflow-hidden rounded-full bg-zinc-200 shadow-inner dark:bg-zinc-800"
                >
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                        className="relative h-full overflow-hidden rounded-full bg-linear-to-r from-sky-400 via-blue-500 to-indigo-600"
                    >
                        <motion.span
                            aria-hidden="true"
                            animate={{ x: ['-100%', '250%'] }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
                            className="absolute inset-y-0 w-1/3 bg-linear-to-r from-transparent via-white/50 to-transparent"
                        />
                    </motion.div>
                </div>
                {!compact && <p className="mt-1 text-xs text-zinc-500">{t('totalXp', { n: info.xp })}</p>}
            </div>
        </div>
    )
}

export function BadgeIcon({ badge, size = 'md' }: { badge: Pick<Badge, 'icon' | 'tier' | 'unlocked'>; size?: 'md' | 'lg' }) {
    return (
        <span
            aria-hidden="true"
            className={`flex shrink-0 items-center justify-center rounded-full ring-4 ${size === 'lg' ? 'size-16 text-3xl' : 'size-12 text-2xl'} ${
                badge.unlocked
                    ? `bg-linear-to-br shadow-lg ${TIER_STYLES[badge.tier]}`
                    : 'bg-zinc-200 ring-zinc-100 grayscale dark:bg-zinc-800 dark:ring-zinc-700'
            }`}
        >
            <span className={badge.unlocked ? '' : 'opacity-40'}>{badge.unlocked ? badge.icon : '🔒'}</span>
        </span>
    )
}

export function BadgeGrid({ badges }: { badges: Badge[] }) {
    const { t } = useLanguage()
    const unlocked = badges.filter((badge) => badge.unlocked).length

    return (
        <div>
            <p className="mb-3 text-sm font-bold text-zinc-500">{t('badgesUnlocked', { n: unlocked, total: badges.length })}</p>
            <ul className="grid gap-3 sm:grid-cols-2">
                {badges.map((badge, index) => (
                    <motion.li
                        key={badge.id}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1, transition: { delay: 0.05 * index } }}
                        whileHover={badge.unlocked ? { y: -3 } : undefined}
                        title={t(badgeDescription(badge.id))}
                        className={`flex items-center gap-3 rounded-2xl p-3 ${badge.unlocked ? 'bg-amber-50 dark:bg-amber-950/40' : 'bg-zinc-100 dark:bg-zinc-800/60'}`}
                    >
                        <BadgeIcon badge={badge} />
                        <div className="min-w-0 flex-1">
                            <p className={`truncate font-black ${badge.unlocked ? '' : 'text-zinc-500'}`}>{t(badgeTitle(badge.id))}</p>
                            <p className="truncate text-xs text-zinc-500">{t(badgeDescription(badge.id))}</p>
                            {!badge.unlocked && (
                                <div className="mt-1 flex items-center gap-2">
                                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-300 dark:bg-zinc-700">
                                        <span className="block h-full rounded-full bg-zinc-500" style={{ width: `${(badge.progress / badge.target) * 100}%` }} />
                                    </span>
                                    <span className="font-mono text-[10px] font-bold text-zinc-500">{badge.progress}/{badge.target}</span>
                                </div>
                            )}
                        </div>
                    </motion.li>
                ))}
            </ul>
        </div>
    )
}

export function ProgressionOverview({ stats }: { stats: StatsMap }) {
    const { t } = useLanguage()
    return (
        <div className="flex flex-col gap-5">
            <XpBar info={getLevelInfo(totalXp(stats))} />
            <div>
                <h4 className="mb-2 text-lg font-black">{t('badgesTitle')}</h4>
                <BadgeGrid badges={getBadges(stats)} />
            </div>
        </div>
    )
}
