'use client'

import type { ReactNode } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";
import { seededFraction } from "../../lib/challenge";
import { cardArt, cardName, type HsCard } from "../../lib/hearthstone";
import { CardText, HsCardImage } from "../hearthstone/cardImage";
import { useCardText } from "../hearthstone/data";
import { CARD } from "./shared";

const MAX_ZOOM = 5
const ZOOM_STEPS = 8
const MAX_BLUR = 6

interface CardClueProps {
    card: HsCard
    revealed: boolean
    wrongCount: number
}

function ClueCard({ children }: { children: ReactNode }) {
    const { t } = useLanguage()
    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={`${CARD} p-6`}>
            <p className="mb-4 text-center text-sm font-black uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">{t('whichCard')}</p>
            {children}
        </motion.div>
    )
}

function RevealedCard({ card }: { card: HsCard }) {
    return (
        <motion.div
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 14 }}
            className="mx-auto w-44 perspective-distant"
        >
            <HsCardImage card={card} eager />
        </motion.div>
    )
}

export function CardArtClue({ card, revealed, wrongCount }: CardClueProps) {
    const { t, language } = useLanguage()
    const progress = Math.max(0, 1 - wrongCount / ZOOM_STEPS)
    const scale = revealed ? 1 : 1 + (MAX_ZOOM - 1) * progress
    const blur = revealed ? 0 : MAX_BLUR * progress
    const origin = `${30 + seededFraction(`${card.dbfId}:x`) * 40}% ${30 + seededFraction(`${card.dbfId}:y`) * 40}%`

    return (
        <ClueCard>
            <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
                <div className="relative aspect-square w-full max-w-72 overflow-hidden rounded-full border-8 border-amber-700 bg-zinc-900 shadow-[inset_0_0_30px_rgba(0,0,0,0.6)]">
                    <motion.div
                        initial={false}
                        animate={{ scale, filter: `blur(${blur}px)` }}
                        transition={{ type: 'spring', stiffness: 90, damping: 18 }}
                        style={{ transformOrigin: origin }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={cardArt(card)}
                            alt={revealed ? cardName(card, language) : t('mysteryCardAlt')}
                            fill
                            unoptimized
                            loading="eager"
                            draggable={false}
                            className="select-none object-cover"
                        />
                    </motion.div>
                </div>
                {revealed && <RevealedCard card={card} />}
            </div>
        </ClueCard>
    )
}

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

function redactCardName(text: string, card: HsCard) {
    const names = card.name.flatMap((name) => [name, name.split(/[,:]/)[0]]).filter((name) => name.length > 2)
    return text.replace(new RegExp(names.map(escapeRegExp).join('|'), 'gi'), '???')
}

export function CardTextClue({ card, revealed }: CardClueProps) {
    const { t } = useLanguage()
    const text = useCardText(card)

    return (
        <ClueCard>
            <div className="flex flex-col items-center gap-5">
                {text ? (
                    <blockquote className="w-full max-w-xl rounded-[2rem] border-4 border-amber-800/60 bg-[#f3e2c0] px-6 py-8 text-center text-lg leading-relaxed text-amber-950 shadow-inner">
                        {text.text
                            ? <CardText text={redactCardName(text.text, card)} />
                            : <p className="italic">“{redactCardName(text.flavor, card)}”</p>}
                        {!text.text && <p className="mt-2 text-xs font-bold uppercase tracking-wide text-amber-800/70">{t('hsFlavorOnly')}</p>}
                    </blockquote>
                ) : (
                    <div className="h-28 w-full max-w-xl animate-pulse rounded-[2rem] bg-amber-100" />
                )}
                {revealed && <RevealedCard card={card} />}
            </div>
        </ClueCard>
    )
}
