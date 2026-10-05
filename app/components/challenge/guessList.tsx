'use client'

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { getOfficialArtwork } from "../../lib/sprites";
import { useSpeciesName } from "./shared";

export default function GuessList({ guesses, target }: { guesses: number[]; target: number }) {
    const getName = useSpeciesName()

    return (
        <ul className="flex flex-col gap-2">
            <AnimatePresence initial={false}>
                {[...guesses].reverse().map((id) => {
                    const correct = id === target
                    return (
                        <motion.li
                            key={id}
                            layout
                            initial={{ opacity: 0, y: -16, scale: correct ? 0.6 : 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex items-center gap-3 rounded-2xl px-3 py-2 font-bold text-white shadow-md ${
                                correct ? 'bg-green-600' : 'bg-red-600/90'
                            }`}
                        >
                            <span className="flex size-12 items-center justify-center rounded-xl bg-white/20">
                                <Image src={getOfficialArtwork(id)} alt="" width={48} height={48} className="size-11 object-contain" />
                            </span>
                            <span className="flex-1">{getName(id)}</span>
                            <span aria-hidden="true" className="text-xl">{correct ? '✓' : '✗'}</span>
                        </motion.li>
                    )
                })}
            </AnimatePresence>
        </ul>
    )
}
