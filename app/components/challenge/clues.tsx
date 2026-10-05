'use client'

import type { ReactNode } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";
import { useTranslatedText } from "../../hooks/useTranslatedText";
import { seededFraction } from "../../lib/challenge";
import { getOfficialArtwork } from "../../lib/sprites";
import type { ChallengeData } from "../../lib/pokeapi";
import { prettify } from "../../i18n/translations";
import { CARD } from "./shared";

const MAX_ZOOM = 6
const ZOOM_STEPS = 8

interface ClueProps {
    data: ChallengeData;
    revealed: boolean;
    wrongCount: number;
    seed: string;
}

function ClueCard({ children }: { children: ReactNode }) {
    const { t } = useLanguage()
    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={`${CARD} p-6`}>
            <p className="mb-4 text-center text-sm font-black uppercase tracking-[0.2em] text-red-600 dark:text-red-400">{t('whoIsThat')}</p>
            {children}
        </motion.div>
    )
}

function Artwork({ data, revealed }: { data: ChallengeData; revealed: boolean }) {
    const { t } = useLanguage()
    return (
        <Image
            src={getOfficialArtwork(data.id)}
            alt={revealed ? t('illustrationOf', { name: prettify(data.name) }) : t('mysteryAlt')}
            fill
            priority
            sizes="18rem"
            draggable={false}
            className="select-none object-contain"
        />
    )
}

export function SilhouetteClue({ data, revealed }: ClueProps) {
    return (
        <ClueCard>
            <div className="relative mx-auto aspect-square w-full max-w-72">
                <motion.div
                    initial={false}
                    animate={{ filter: revealed ? 'brightness(1)' : 'brightness(0)', scale: revealed ? [1, 1.12, 1] : 1 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0 drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)]"
                >
                    <Artwork data={data} revealed={revealed} />
                </motion.div>
            </div>
        </ClueCard>
    )
}

export function ZoomClue({ data, revealed, wrongCount }: ClueProps) {
    const scale = revealed ? 1 : 1 + (MAX_ZOOM - 1) * Math.max(0, 1 - wrongCount / ZOOM_STEPS)
    const origin = `${35 + seededFraction(`${data.id}:x`) * 30}% ${35 + seededFraction(`${data.id}:y`) * 30}%`

    return (
        <ClueCard>
            <div className="relative mx-auto aspect-square w-full max-w-72 overflow-hidden rounded-2xl border-4 border-zinc-900 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                <motion.div
                    initial={false}
                    animate={{ scale }}
                    transition={{ type: 'spring', stiffness: 90, damping: 18 }}
                    style={{ transformOrigin: origin }}
                    className="absolute inset-0"
                >
                    <Artwork data={data} revealed={revealed} />
                </motion.div>
            </div>
        </ClueCard>
    )
}

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function redactName(text: string, name: string) {
    const parts = name.split('-')
    const patterns = [parts.map(escapeRegExp).join('[\\s.\\-]*')]
    if (parts.length > 1 && parts[0].length > 3) patterns.push(escapeRegExp(parts[0]))
    return text.replace(new RegExp(patterns.join('|'), 'gi'), '???')
}

export function DescriptionClue({ data, revealed, seed }: ClueProps) {
    const { t, language } = useLanguage()
    const entry = data.flavorTexts[Math.floor(seededFraction(seed) * data.flavorTexts.length)] ?? ''
    const description = useTranslatedText(redactName(entry, data.name))

    return (
        <ClueCard>
            <blockquote className="rounded-2xl bg-zinc-100 p-5 text-center text-lg leading-relaxed font-medium italic dark:bg-zinc-800">
                “{description.text}”
            </blockquote>
            {language === 'pt' && (
                <p className="mt-1 text-center text-[11px] text-zinc-500">
                    {t(description.translated ? 'descriptionTranslated' : 'descriptionOnlyEnglish')}
                </p>
            )}
            {revealed && (
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative mx-auto mt-4 size-32">
                    <Artwork data={data} revealed />
                </motion.div>
            )}
        </ClueCard>
    )
}
