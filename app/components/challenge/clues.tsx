'use client'

import { useEffect, useRef, useState, type ReactNode } from "react";
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

const WAVE_BARS = 24

export function CryClue({ data, revealed }: ClueProps) {
    const { t } = useLanguage()
    const audio = useRef<HTMLAudioElement | null>(null)
    const [playing, setPlaying] = useState(false)
    const [failed, setFailed] = useState(false)
    const sources = (['latest', 'legacy'] as const).filter((key) => data.cries[key])
    const [source, setSource] = useState<'latest' | 'legacy'>(sources[0] ?? 'latest')
    const url = data.cries[source]

    const play = async () => {
        if (!url) return
        audio.current?.pause()
        const next = new Audio(url)
        next.volume = 0.6
        next.onended = () => setPlaying(false)
        audio.current = next
        try {
            setFailed(false)
            setPlaying(true)
            await next.play()
        } catch {
            setPlaying(false)
            setFailed(true)
        }
    }

    useEffect(() => () => audio.current?.pause(), [])

    return (
        <ClueCard>
            <div className="flex flex-col items-center gap-5">
                {revealed ? (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative size-48">
                        <Artwork data={data} revealed />
                    </motion.div>
                ) : (
                    <div className="flex h-24 w-full max-w-sm items-center justify-center gap-1" aria-hidden>
                        {Array.from({ length: WAVE_BARS }, (_, index) => {
                            const height = 20 + seededFraction(`${data.id}:wave:${index}`) * 80
                            return (
                                <motion.span
                                    key={index}
                                    className="w-2 rounded-full bg-red-500"
                                    initial={false}
                                    animate={playing ? { height: [`${height * 0.3}%`, `${height}%`, `${height * 0.3}%`] } : { height: `${height * 0.35}%` }}
                                    transition={playing
                                        ? { type: 'tween', duration: 0.5 + (index % 5) * 0.08, repeat: Infinity, ease: 'easeInOut' }
                                        : { type: 'tween', duration: 0.3 }}
                                />
                            )
                        })}
                    </div>
                )}

                {url ? (
                    <motion.button
                        type="button"
                        onClick={play}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.92 }}
                        className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-lg font-black text-white shadow-lg"
                    >
                        <svg viewBox="0 0 24 24" className="size-6 fill-current" aria-hidden><path d="M8 5v14l11-7z" /></svg>
                        {t(playing ? 'cryPlaying' : 'cryPlay')}
                    </motion.button>
                ) : (
                    <p className="text-sm text-zinc-500">{t('cryUnavailable')}</p>
                )}

                {sources.length > 1 && (
                    <div className="flex gap-1 rounded-full bg-zinc-100 p-1 text-xs font-bold dark:bg-zinc-800" role="group" aria-label={t('cryVersion')}>
                        {sources.map((key) => (
                            <button
                                key={key}
                                type="button"
                                aria-pressed={source === key}
                                onClick={() => setSource(key)}
                                className={`rounded-full px-3 py-1 transition-colors ${source === key ? 'bg-white shadow dark:bg-zinc-700' : 'text-zinc-500'}`}
                            >
                                {t(key === 'latest' ? 'cryLatest' : 'cryLegacy')}
                            </button>
                        ))}
                    </div>
                )}
                {failed && <p role="alert" className="text-xs text-red-600">{t('cryError')}</p>}
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
