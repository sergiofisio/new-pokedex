'use client'

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";
import { TEAM_SIZE } from "../../lib/profile";
import { getOfficialArtwork } from "../../lib/sprites";
import { useSpeciesName } from "../challenge/shared";
import { PokemonSearch } from "./pokemonPicker";

const SLOT_BUTTON = 'flex size-6 items-center justify-center rounded-full bg-white/90 text-xs font-black text-zinc-800 shadow disabled:opacity-30 dark:bg-zinc-700 dark:text-white'

export default function TeamEditor({ team, onChange }: { team: number[]; onChange: (team: number[]) => void }) {
    const { t } = useLanguage()
    const getName = useSpeciesName()
    const isFull = team.length >= TEAM_SIZE

    const move = (index: number, step: number) => {
        const next = [...team]
        ;[next[index], next[index + step]] = [next[index + step], next[index]]
        onChange(next)
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
                <p className="text-sm font-bold">{t('myTeam')}</p>
                <span className="text-xs text-zinc-500">{team.length}/{TEAM_SIZE}</span>
            </div>
            <p className="text-xs text-zinc-500">{t('teamHint')}</p>

            <ol className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                <AnimatePresence mode="popLayout" initial={false}>
                    {team.map((id, index) => (
                        <motion.li
                            key={id}
                            layout
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.6 }}
                            className="group relative flex aspect-square flex-col items-center justify-center rounded-2xl bg-linear-to-b from-red-500 to-red-700 p-1 text-white shadow-md"
                        >
                            <span className="absolute left-1.5 top-1 font-mono text-[10px] font-black opacity-80">{index + 1}</span>
                            <Image src={getOfficialArtwork(id)} alt="" width={64} height={64} className="size-3/5 object-contain drop-shadow" />
                            <span className="w-full truncate text-center text-[11px] font-bold">{getName(id)}</span>
                            <div className="absolute inset-x-1 bottom-1 flex justify-between opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 max-sm:opacity-100">
                                <button type="button" aria-label={t('moveLeft')} disabled={index === 0} onClick={() => move(index, -1)} className={SLOT_BUTTON}>←</button>
                                <button type="button" aria-label={t('removeFromTeam', { name: getName(id) })} onClick={() => onChange(team.filter((member) => member !== id))} className={`${SLOT_BUTTON} text-red-600`}>✕</button>
                                <button type="button" aria-label={t('moveRight')} disabled={index === team.length - 1} onClick={() => move(index, 1)} className={SLOT_BUTTON}>→</button>
                            </div>
                        </motion.li>
                    ))}
                    {Array.from({ length: TEAM_SIZE - team.length }, (_, index) => (
                        <motion.li
                            key={`empty-${team.length + index}`}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex aspect-square items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 text-2xl font-black text-zinc-300 dark:border-zinc-700 dark:text-zinc-700"
                            aria-hidden="true"
                        >
                            +
                        </motion.li>
                    ))}
                </AnimatePresence>
            </ol>

            <PokemonSearch
                label={t('addToTeam')}
                exclude={team}
                disabled={isFull}
                onSelect={(id) => { if (!isFull) onChange([...team, id]) }}
            />
        </div>
    )
}
