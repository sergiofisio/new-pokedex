'use client'

import { motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";
import { useAsyncData } from "../../hooks/useAsyncData";
import { fetchStatsMap, summarizeStats } from "../../lib/profile";
import type { StatsMap } from "../../lib/progression";
import { MODE_META, ModeIcon } from "../challenge/modes";
import { ProgressionOverview } from "../progression";

export default function ProfileProgress({ userId, card }: { userId: string; card: string }) {
    const { t } = useLanguage()
    const result = useAsyncData(userId, fetchStatsMap)

    const content = !result
        ? <p className="text-sm text-zinc-500">{t('challengeLoading')}</p>
        : result.status === 'error'
            ? <p className="text-sm text-zinc-500">{t('profileStatsError')}</p>
            : null

    return (
        <>
            <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }} className={card}>
                <h3 className="mb-4 text-xl font-black">{t('progressTitle')}</h3>
                {content ?? (result?.status === 'success' && <ProgressionOverview stats={result.data} />)}
            </motion.section>
            <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.25 } }} className={card}>
                <h3 className="mb-3 text-xl font-black">{t('challengesTitle')}</h3>
                {content ?? (result?.status === 'success' && <ChallengeSummary stats={result.data} />)}
            </motion.section>
        </>
    )
}

function ChallengeSummary({ stats }: { stats: StatsMap }) {
    const { t } = useLanguage()

    return (
        <ul className="grid gap-3 sm:grid-cols-2">
            {summarizeStats(stats).map(({ mode, wins, bestStreak }, index) => (
                <motion.li
                    key={mode}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: index * 0.06 } }}
                    className={`flex items-center gap-3 rounded-2xl p-3 text-white shadow ${MODE_META[mode].accent}`}
                >
                    <ModeIcon mode={mode} className="size-8 shrink-0" />
                    <div className="flex-1">
                        <p className="font-black">{t(MODE_META[mode].title)}</p>
                        <p className="text-xs opacity-90">
                            {t('statsWins')}: <b>{wins}</b> · {t('statsBestStreak')}: <b>{bestStreak}</b>
                        </p>
                    </div>
                </motion.li>
            ))}
        </ul>
    )
}
