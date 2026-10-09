'use client'

import Image from "next/image";
import { motion } from "motion/react";
import { useLanguage } from "../../../context/languageContext";
import { useChallenge } from "../../../hooks/useChallenge";
import { buildGymRound } from "../../../lib/gym";
import { getOfficialArtwork } from "../../../lib/sprites";
import { TYPE_COLORS } from "../../../lib/typeColors";
import { CARD, useSpeciesName } from "../shared";
import { PlayBar, SessionEnd, SessionLayout, type SessionProps } from "./common";

export default function GymSession(session: SessionProps) {
    const { mode, variant, dateKey, series, onShowDetail } = session
    const { t, typeName } = useLanguage()
    const getName = useSpeciesName()
    const { target, guesses, attempts, status, stats, reward, guess, giveUp } = useChallenge(mode, variant, dateKey, series)
    const { gym, options, intruder, types } = buildGymRound(target)
    const revealed = status !== 'playing'
    const colors = TYPE_COLORS[gym.type]
    const typesLabel = (id: number) => types[id].map(typeName).join(' / ')

    const clue = (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={`${CARD} overflow-hidden`}>
            <div className={`flex flex-wrap items-center justify-between gap-4 p-6 ${colors?.card ?? 'bg-zinc-300'} ${colors?.text ?? ''}`}>
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80">{t('gymOf', { city: gym.city })}</p>
                    <h3 className="text-3xl font-black">{gym.leader}</h3>
                    <p className="text-sm font-bold capitalize opacity-90">{gym.region} · {t('generation')} {gym.generation}</p>
                </div>
                <div className="flex flex-col items-end gap-1 text-right">
                    <span className="rounded-full bg-black/20 px-3 py-1 text-sm font-black">{typeName(gym.type)}</span>
                    <span className="text-sm font-bold">🏅 {gym.badge}</span>
                </div>
            </div>
            <p className="p-5 text-center font-bold">{t('gymQuestion')}</p>
        </motion.div>
    )

    return (
        <SessionLayout
            clue={clue}
            sticky={!revealed}
            aside={status === 'playing' ? (
                <>
                    <div className={`${CARD} p-4 text-sm`}>
                        <p className="font-black">{t('gymHowTo')}</p>
                        <p className="mt-1 text-zinc-500">{t('gymHowToDetail', { type: typeName(gym.type) })}</p>
                    </div>
                    <PlayBar count={guesses.length} canGiveUp={variant === 'random' || Boolean(series)} onGiveUp={giveUp} />
                </>
            ) : (
                <SessionEnd
                    session={session}
                    status={status}
                    answer={{ ids: [intruder], label: getName(intruder) }}
                    attempts={attempts}
                    stats={stats}
                    reward={reward}
                />
            )}
        >
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                {options.map((id, index) => {
                    const picked = guesses.includes(id)
                    const isIntruder = id === intruder
                    const showAsIntruder = isIntruder && (picked || revealed)
                    const eliminated = picked && !isIntruder
                    return (
                        <motion.li
                            key={id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0, scale: eliminated ? 0.95 : 1 }}
                            transition={{ delay: index * 0.06 }}
                        >
                            <motion.button
                                type="button"
                                disabled={revealed || picked}
                                onClick={() => guess(id)}
                                whileHover={revealed || picked ? undefined : { y: -4 }}
                                whileTap={revealed || picked ? undefined : { scale: 0.95 }}
                                className={`flex w-full flex-col items-center gap-2 rounded-3xl p-3 font-bold shadow-lg transition-colors ${
                                    showAsIntruder
                                        ? 'bg-green-600 text-white'
                                        : eliminated
                                            ? 'bg-red-600/85 text-white'
                                            : 'bg-white/90 hover:bg-white dark:bg-zinc-900/90 dark:hover:bg-zinc-900'
                                }`}
                            >
                                <span className="relative size-24">
                                    <Image
                                        src={getOfficialArtwork(id)}
                                        alt={getName(id)}
                                        fill
                                        sizes="6rem"
                                        className={`object-contain ${eliminated ? 'opacity-60 grayscale' : ''}`}
                                    />
                                </span>
                                <span className="truncate">{getName(id)}</span>
                                {(eliminated || revealed) && (
                                    <span className="text-[11px] font-black uppercase opacity-90">{typesLabel(id)}</span>
                                )}
                            </motion.button>
                        </motion.li>
                    )
                })}
            </ul>

            {revealed && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`${CARD} flex flex-wrap items-center justify-between gap-3 p-5`}>
                    <p className="font-bold">
                        {t('gymExplanation', { name: getName(intruder), types: typesLabel(intruder), type: typeName(gym.type) })}
                    </p>
                    <button type="button" onClick={() => onShowDetail(intruder)} className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-bold text-white dark:bg-white dark:text-zinc-900">
                        {t('viewInPokedex')}
                    </button>
                </motion.div>
            )}
        </SessionLayout>
    )
}
