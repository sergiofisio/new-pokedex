'use client'

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";
import { CRAFT_COST, RARITY_COLORS, CLASS_COLORS, cardClassLabel, cardPath, cardName, cardTribe, hsLabel, isStandard, setName, type HsCard, type HsData } from "../../lib/hearthstone";
import { CardText, HsCardImage, ManaGem } from "./cardImage";
import { useCardText } from "./data";

interface HsCardModalProps {
    data: HsData | null
    dbfId: number | null
    navigation?: number[]
    onClose: () => void
    onNavigate?: (dbfId: number) => void
}

export default function HsCardModal({ data, dbfId, navigation = [], onClose, onNavigate }: HsCardModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const card = dbfId !== null ? data?.byDbf.get(dbfId) : undefined

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return
        if (card && !dialog.open) dialog.showModal()
        if (!card && dialog.open) dialog.close()
    }, [card])

    const index = card ? navigation.indexOf(card.dbfId) : -1
    const previousId = index > 0 ? navigation[index - 1] : undefined
    const nextId = index >= 0 && index < navigation.length - 1 ? navigation[index + 1] : undefined

    return (
        <dialog
            ref={dialogRef}
            onClose={onClose}
            onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close() }}
            onKeyDown={(event) => {
                if (event.key === 'ArrowLeft' && previousId !== undefined) onNavigate?.(previousId)
                if (event.key === 'ArrowRight' && nextId !== undefined) onNavigate?.(nextId)
            }}
            aria-label="Hearthstone"
            className="m-auto w-[96vw] max-w-4xl max-h-[94vh] overflow-y-auto bg-transparent p-0 backdrop:bg-black/80"
        >
            {card && data && (
                <CardDetail
                    key={card.dbfId}
                    card={card}
                    data={data}
                    previousId={previousId}
                    nextId={nextId}
                    onNavigate={onNavigate}
                    onClose={() => dialogRef.current?.close()}
                />
            )}
        </dialog>
    )
}

interface CardDetailProps {
    card: HsCard
    data: HsData
    previousId?: number
    nextId?: number
    onNavigate?: (dbfId: number) => void
    onClose: () => void
}

function CardDetail({ card, data, previousId, nextId, onNavigate, onClose }: CardDetailProps) {
    const { t, language } = useLanguage()
    const text = useCardText(card)
    const set = data.sets[card.set]
    const standard = isStandard(data, card)
    const tribe = cardTribe(card)
    const craft = CRAFT_COST[card.rarity]
    const accent = CLASS_COLORS[card.classes[0]] ?? CLASS_COLORS.NEUTRAL

    const stats = [
        card.attack !== undefined && { label: t('hsAttack'), value: card.attack },
        card.health !== undefined && { label: t(card.type === 'WEAPON' ? 'hsDurability' : 'hsHealth'), value: card.health },
        card.armor !== undefined && { label: t('hsArmor'), value: card.armor },
    ].filter((stat) => stat !== false)

    const chips = [
        cardClassLabel(card, language),
        hsLabel(card.type, language),
        ...tribe.map((value) => hsLabel(value, language)),
    ]

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 24 }}
            className="relative grid gap-6 overflow-hidden rounded-3xl border-4 border-amber-500/70 bg-[#2b1a10] p-6 text-amber-50 shadow-2xl md:grid-cols-[minmax(0,18rem)_1fr]"
        >
            <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-0 h-40 opacity-40" style={{ background: `linear-gradient(180deg, ${accent}, transparent)` }} />
            <button
                type="button"
                onClick={onClose}
                aria-label={t('close')}
                className="absolute top-3 right-3 z-10 flex size-9 items-center justify-center rounded-full bg-black/40 text-xl font-black hover:bg-black/60"
            >
                ×
            </button>

            <motion.div
                initial={{ rotateY: -90 }}
                animate={{ rotateY: 0 }}
                transition={{ type: 'spring', stiffness: 120, damping: 16 }}
                className="relative mx-auto w-full max-w-72 perspective-distant"
            >
                <HsCardImage card={card} size={512} eager className="drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]" />
            </motion.div>

            <div className="relative flex min-w-0 flex-col gap-4">
                <div className="flex items-start gap-3 pr-10">
                    <ManaGem value={card.cost} className="size-11 text-xl" />
                    <div className="min-w-0">
                        <h2 className="text-3xl font-black leading-tight">{cardName(card, language)}</h2>
                        {language === 'pt' && <p className="text-sm text-amber-200/70">{card.name[1]}</p>}
                    </div>
                </div>

                <ul className="flex flex-wrap gap-2">
                    {chips.map((chip) => (
                        <li key={chip} className="rounded-full bg-black/30 px-3 py-1 text-xs font-bold">{chip}</li>
                    ))}
                    <li className="rounded-full px-3 py-1 text-xs font-black text-zinc-900" style={{ backgroundColor: RARITY_COLORS[card.rarity] }}>
                        {hsLabel(card.rarity, language)}
                    </li>
                    <li className={`rounded-full px-3 py-1 text-xs font-black ${standard ? 'bg-emerald-500 text-emerald-950' : 'bg-orange-500 text-orange-950'}`}>
                        {t(standard ? 'hsFormatStandard' : 'hsFormatWild')}
                    </li>
                </ul>

                {stats.length > 0 && (
                    <dl className="grid grid-cols-3 gap-2">
                        {stats.map((stat) => (
                            <div key={stat.label} className="rounded-2xl bg-black/30 p-3 text-center">
                                <dt className="text-xs font-bold text-amber-200/80 uppercase">{stat.label}</dt>
                                <dd className="text-2xl font-black">{stat.value}</dd>
                            </div>
                        ))}
                    </dl>
                )}

                <div className="rounded-2xl bg-amber-50 p-4 text-zinc-900 shadow-inner">
                    {text ? (
                        <>
                            {text.text ? <CardText text={text.text} /> : <p className="text-zinc-500 italic">{t('hsNoText')}</p>}
                            {text.flavor && <p className="mt-3 border-t border-amber-900/20 pt-3 text-sm text-amber-900 italic">{text.flavor}</p>}
                        </>
                    ) : (
                        <div className="h-12 animate-pulse rounded-lg bg-amber-200/60" />
                    )}
                </div>

                <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
                    <div>
                        <dt className="inline font-bold text-amber-200/80">{t('hsFilterSet')}: </dt>
                        <dd className="inline">{setName(set, language)} ({set.year})</dd>
                    </div>
                    <div>
                        <dt className="inline font-bold text-amber-200/80">{t('hsCraft')}: </dt>
                        <dd className="inline">{craft ? t('hsDust', { n: craft }) : t('hsNotCraftable')}</dd>
                    </div>
                    {card.artist && (
                        <div className="sm:col-span-2">
                            <dt className="inline font-bold text-amber-200/80">{t('hsArtist')}: </dt>
                            <dd className="inline">{card.artist}</dd>
                        </div>
                    )}
                </dl>

                <Link href={cardPath(card)} className="self-start font-bold text-amber-300 underline underline-offset-2 hover:text-amber-100">
                    {t('viewFullPage')} →
                </Link>

                {onNavigate && (previousId !== undefined || nextId !== undefined) && (
                    <div className="mt-auto flex justify-between gap-2">
                        <button
                            type="button"
                            disabled={previousId === undefined}
                            onClick={() => previousId !== undefined && onNavigate(previousId)}
                            className="rounded-full bg-black/30 px-4 py-2 text-sm font-bold hover:bg-black/50 disabled:opacity-30"
                        >
                            ← {t('hsPrevCard')}
                        </button>
                        <button
                            type="button"
                            disabled={nextId === undefined}
                            onClick={() => nextId !== undefined && onNavigate(nextId)}
                            className="rounded-full bg-black/30 px-4 py-2 text-sm font-bold hover:bg-black/50 disabled:opacity-30"
                        >
                            {t('hsNextCard')} →
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    )
}
