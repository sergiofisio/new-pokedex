'use client'

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";
import { CLASS_COLORS, HS_HERO_CLASSES, cardName, hsLabel, type HsCard, type HsData } from "../../lib/hearthstone";
import { ownedCopies, type Collection } from "../../lib/hsCollection";
import { META, deckCost, deckEntries, metaToDeck, suggestSubstitutes, type Deck, type MetaDeck } from "../../lib/hsDeck";
import { DeckCardRow } from "./deckPanel";
import { ManaGem } from "./cardImage";
import { useCollection } from "./data";

const PANEL = 'rounded-3xl border-2 border-amber-700/40 bg-black/25 shadow-xl backdrop-blur-sm'

interface MetaDecksProps {
    data: HsData
    onOpen: (deck: Deck, name: string) => void
}

export default function MetaDecks({ data, onOpen }: MetaDecksProps) {
    const { t, language } = useLanguage()
    const owned = useCollection()
    const [cls, setCls] = useState('')
    const [open, setOpen] = useState<string | null>(null)
    const hasCollection = Object.keys(owned).length > 0

    const ranked = useMemo(() => META
        .filter((meta) => !cls || meta.class === cls)
        .map((meta) => ({ meta, deck: metaToDeck(meta), cost: deckCost(data, metaToDeck(meta), owned) }))
        .sort((a, b) => a.cost.missing - b.cost.missing || a.meta.name.localeCompare(b.meta.name)),
    [data, owned, cls])

    return (
        <div className="flex flex-col gap-4">
            <div className={`${PANEL} flex flex-col gap-3 p-4`}>
                <p className="text-sm text-amber-100/85">{t(hasCollection ? 'metaIntro' : 'metaIntroNoCollection')}</p>
                <div role="group" aria-label={t('hsFilterClass')} className="flex flex-wrap gap-1.5">
                    <ClassChip active={!cls} color="#a16207" onClick={() => setCls('')}>{t('hsFilterAll')}</ClassChip>
                    {HS_HERO_CLASSES.filter((value) => META.some((meta) => meta.class === value)).map((value) => (
                        <ClassChip key={value} active={cls === value} color={CLASS_COLORS[value]} onClick={() => setCls(cls === value ? '' : value)}>
                            {hsLabel(value, language)}
                        </ClassChip>
                    ))}
                </div>
            </div>

            <ul className="flex flex-col gap-3">
                {ranked.map(({ meta, deck, cost }, index) => (
                    <motion.li
                        key={meta.code}
                        layout
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: Math.min(index, 10) * 0.04 } }}
                        className={`${PANEL} overflow-hidden`}
                    >
                        <button
                            type="button"
                            aria-expanded={open === meta.code}
                            onClick={() => setOpen(open === meta.code ? null : meta.code)}
                            className="flex w-full flex-wrap items-center gap-3 p-4 text-left hover:bg-white/5"
                        >
                            <span className="h-12 w-2 shrink-0 rounded-full" style={{ backgroundColor: CLASS_COLORS[meta.class] }} />
                            <span className="min-w-0 flex-1">
                                <span className="block text-lg font-black">{meta.name}</span>
                                <span className="block text-xs font-bold text-amber-200/75">
                                    {hsLabel(meta.class, language)} · {t(meta.format === 'standard' ? 'hsFormatStandard' : 'hsFormatWild')} · {t('deckDustTotal', { n: cost.total.toLocaleString() })}
                                </span>
                            </span>
                            <ProgressRing value={cost.owned} total={cost.owned + cost.missingCards.reduce((sum, { count }) => sum + count, 0)} />
                            <span className={`rounded-full px-3 py-1 text-sm font-black ${cost.missing ? 'bg-red-600/90' : 'bg-emerald-500 text-emerald-950'}`}>
                                {cost.missing ? t('deckDustMissing', { n: cost.missing.toLocaleString() }) : t('deckComplete')}
                            </span>
                            <span aria-hidden="true" className={`transition-transform ${open === meta.code ? 'rotate-180' : ''}`}>▾</span>
                        </button>
                        <AnimatePresence initial={false}>
                            {open === meta.code && (
                                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                    <MetaDetail data={data} meta={meta} deck={deck} owned={owned} onOpen={() => onOpen(deck, meta.name)} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.li>
                ))}
            </ul>
            <p className="text-center text-xs text-amber-100/60">{t('metaSource')}</p>
        </div>
    )
}

function MetaDetail({ data, meta, deck, owned, onOpen }: { data: HsData; meta: MetaDeck; deck: Deck; owned: Collection; onOpen: () => void }) {
    const { t } = useLanguage()
    const [copied, setCopied] = useState(false)
    const [substitutesFor, setSubstitutesFor] = useState<number | null>(null)
    const entries = deckEntries(data, deck)

    const copy = async () => {
        await navigator.clipboard.writeText(meta.code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="grid gap-4 border-t border-amber-700/30 p-4 md:grid-cols-2">
            <ul className="flex flex-col gap-1">
                {entries.map(({ card, count }) => {
                    const missing = Math.max(0, count - ownedCopies(owned, card))
                    return (
                        <DeckCardRow
                            key={card.dbfId}
                            card={card}
                            count={count}
                            missing={missing}
                            onClick={missing > 0 ? () => setSubstitutesFor(substitutesFor === card.dbfId ? null : card.dbfId) : undefined}
                        />
                    )
                })}
            </ul>
            <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={onOpen} className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-black text-amber-950">🛠️ {t('metaOpenBuilder')}</button>
                    <button type="button" onClick={copy} className="rounded-xl bg-black/35 px-4 py-2 text-sm font-black hover:bg-black/50">
                        {copied ? `✓ ${t('deckCodeCopied')}` : `📋 ${t('deckCopyCode')}`}
                    </button>
                </div>
                <p className="text-sm text-amber-100/80">{t('metaSubstitutesHint')}</p>
                {substitutesFor !== null && data.byDbf.get(substitutesFor) && (
                    <Substitutes data={data} deck={deck} missing={data.byDbf.get(substitutesFor)!} owned={owned} />
                )}
            </div>
        </div>
    )
}

function Substitutes({ data, deck, missing, owned }: { data: HsData; deck: Deck; missing: HsCard; owned: Collection }) {
    const { t, language } = useLanguage()
    const options = suggestSubstitutes(data, deck, missing, owned)
    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-black/30 p-3">
            <p className="mb-2 text-sm font-black text-amber-300">{t('metaSubstitutesFor', { name: cardName(missing, language) })}</p>
            {options.length === 0 ? (
                <p className="text-sm text-amber-100/70">{t('metaNoSubstitutes')}</p>
            ) : (
                <ul className="flex flex-col gap-1">
                    {options.map((card) => (
                        <li key={card.dbfId} className="flex items-center gap-2 rounded-lg bg-black/30 px-2 py-1.5 text-sm font-bold">
                            <ManaGem value={card.cost} className="size-6 text-[10px]" />
                            <span className="flex-1 truncate">{cardName(card, language)}</span>
                            <span className="text-[11px] text-amber-200/70">{hsLabel(card.rarity, language)}</span>
                        </li>
                    ))}
                </ul>
            )}
        </motion.div>
    )
}

function ProgressRing({ value, total }: { value: number; total: number }) {
    const ratio = total ? value / total : 0
    const circumference = 2 * Math.PI * 16
    return (
        <span className="relative flex size-12 items-center justify-center" aria-label={`${value}/${total}`}>
            <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90">
                <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="5" />
                <motion.circle
                    cx="20" cy="20" r="16" fill="none" stroke={ratio === 1 ? '#10b981' : '#f59e0b'} strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference * (1 - ratio) }}
                    transition={{ duration: 0.8 }}
                />
            </svg>
            <span className="text-[10px] font-black">{value}/{total}</span>
        </span>
    )
}

function ClassChip({ active, color, onClick, children }: { active: boolean; color: string; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            aria-pressed={active}
            onClick={onClick}
            style={{ backgroundColor: active ? color : undefined, borderColor: color }}
            className={`rounded-full border-2 px-3 py-1 text-xs font-black transition-colors ${active ? 'text-white [text-shadow:0_1px_2px_rgb(0_0_0/0.6)]' : 'text-amber-50/85 hover:bg-white/10'}`}
        >
            {children}
        </button>
    )
}
