'use client'

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { GENERATIONS, getBackgroundSourceUrl } from "../generationMenu";
import { useLanguage } from "../../context/languageContext";
import type { GameWorld } from "../../lib/challenge";
import Tavern from "../hearthstone/tavern";

export default function ChallengeBackdrop({ generation, world = 'pokemon', children }: { generation: number; world?: GameWorld; children: ReactNode }) {
    const { t } = useLanguage()
    const region = GENERATIONS.find(({ id }) => id === generation) ?? GENERATIONS[0]

    if (world === 'hearthstone') {
        return (
            <Tavern className="text-zinc-900 dark:text-zinc-100">
                <section className="flex min-w-0 flex-1 flex-col">{children}</section>
            </Tavern>
        )
    }

    return (
        <section className="relative isolate flex min-w-0 flex-1 flex-col">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-clip">
                <div className="sticky top-0 h-dvh w-full">
                    <motion.div
                        key={region.background.src}
                        initial={{ opacity: 0, scale: 1.08 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                        style={{ backgroundImage: `url("${region.background.src}")` }}
                        className="absolute inset-0 bg-cover bg-center"
                    />
                </div>
                <div className="absolute inset-0 bg-white/30 dark:bg-black/55" />
            </div>

            {children}

            <p className="mt-auto mb-4 mr-6 self-end rounded-full bg-white/85 px-3 py-1 text-[11px] text-zinc-700 shadow dark:bg-zinc-900/85 dark:text-zinc-300">
                <a
                    href={getBackgroundSourceUrl(region.background.file)}
                    target="_blank"
                    rel="noreferrer"
                    className="underline-offset-2 hover:underline"
                >
                    {t('backgroundCredit', { region: region.region, author: region.background.author, license: region.background.license })}
                </a>
            </p>
        </section>
    )
}
