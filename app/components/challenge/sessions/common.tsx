'use client'

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { useLanguage } from "../../../context/languageContext";
import type { ChallengeMode, ChallengeStats, ChallengeVariant } from "../../../lib/challenge";
import type { Reward } from "../../../lib/progression";
import type { ChallengeStatus, SeriesRound } from "../../../hooks/useChallenge";
import ResultPanel, { type ChallengeAnswer } from "../resultPanel";
import { CARD } from "../shared";
import AdSlot from "../../ads/adSlot";

export interface SessionProps {
    mode: ChallengeMode;
    variant: ChallengeVariant;
    dateKey: string;
    onNextRound: () => void;
    onNewDay: () => void;
    onShowDetail: (id: number) => void;
    series?: SeriesRound;
    renderEnd?: (status: Exclude<ChallengeStatus, 'playing'>, answer: ChallengeAnswer) => ReactNode;
}

interface SessionLayoutProps {
    clue?: ReactNode;
    aside: ReactNode;
    sticky: boolean;
    children: ReactNode;
}

export function SessionLayout({ clue, aside, sticky, children }: SessionLayoutProps) {
    return (
        <div className={`grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] ${clue ? 'lg:grid-rows-[auto_1fr]' : ''}`}>
            {clue && <div className="lg:col-start-1">{clue}</div>}
            <aside className={`flex flex-col gap-2 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start ${sticky ? 'lg:sticky lg:top-4' : ''}`}>
                {aside}
            </aside>
            <div className="flex min-w-0 flex-col gap-5 lg:col-start-1">{children}</div>
        </div>
    )
}

export function PlayBar({ count, canGiveUp, onGiveUp }: { count: number; canGiveUp: boolean; onGiveUp: () => void }) {
    const { t } = useLanguage()
    return (
        <div className="flex items-center justify-between gap-3 px-1">
            <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-bold shadow dark:bg-zinc-900/90">
                {t('attemptsCount', { n: count })}
            </span>
            {canGiveUp && (
                <motion.button
                    type="button"
                    onClick={onGiveUp}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-red-600 shadow dark:bg-zinc-900/90 dark:text-red-400"
                >
                    {t('giveUp')}
                </motion.button>
            )}
        </div>
    )
}

interface SessionEndProps {
    session: SessionProps;
    status: Exclude<ChallengeStatus, 'playing'>;
    answer: ChallengeAnswer;
    attempts: number;
    stats: ChallengeStats;
    reward: Reward | null;
}

export function SessionEnd({ session, status, answer, attempts, stats, reward }: SessionEndProps) {
    if (session.series) return session.renderEnd?.(status, answer) ?? null
    return (
        <>
        <ResultPanel
            mode={session.mode}
            status={status}
            answer={answer}
            attempts={attempts}
            stats={stats}
            reward={reward}
            variant={session.variant}
            onNext={session.onNextRound}
            onNewDay={session.onNewDay}
            onShowDetail={session.onShowDetail}
        />
        <AdSlot />
        </>
    )
}

export function SessionError({ canRetry, onRetry }: { canRetry: boolean; onRetry: () => void }) {
    const { t } = useLanguage()
    return (
        <div role="alert" className={`${CARD} flex flex-wrap items-center justify-between gap-3 p-5`}>
            {t('challengeError')}
            {canRetry && (
                <button type="button" onClick={onRetry} className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white">
                    {t('tryAnother')}
                </button>
            )}
        </div>
    )
}

export const SessionLoading = () => {
    const { t } = useLanguage()
    return <p role="status" className={`${CARD} p-5`}>{t('challengeLoading')}</p>
}
