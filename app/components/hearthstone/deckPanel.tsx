'use client'

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";
import { RARITY_COLORS, cardName, cardTile, hsLabel, type HsCard, type HsData } from "../../lib/hearthstone";
import { ownedCopies, type Collection } from "../../lib/hsCollection";
import { deckCost, deckEntries, deckLimit, deckSize, manaCurve, typeCounts, type Deck } from "../../lib/hsDeck";
import { ManaGem } from "./cardImage";

interface DeckPanelProps {
    data: HsData
    deck: Deck
    owned: Collection
    onCardClick?: (card: HsCard) => void
    onCardInfo?: (card: HsCard) => void
}

export function DeckCardRow({ card, count, missing, onClick, onInfo }: { card: HsCard; count: number; missing: number; onClick?: () => void; onInfo?: () => void }) {
    const { t, language } = useLanguage()
    const Tag = onClick ? motion.button : motion.div
    return (
        <motion.li layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20, height: 0 }} className="flex items-stretch gap-1">
            <Tag
                type={onClick ? 'button' : undefined}
                onClick={onClick}
                whileHover={onClick ? { x: -3 } : undefined}
                title={onClick ? t('deckRemoveCard') : undefined}
                style={{ borderLeftColor: RARITY_COLORS[card.rarity] }}
                className="relative flex h-9 min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-lg border-l-4 bg-zinc-950 pr-2 text-left text-sm font-bold text-white"
            >
                <span className="absolute inset-y-0 right-0 w-32">
                    <Image src={cardTile(card)} alt="" fill sizes="128px" unoptimized loading="lazy" className="object-cover" />
                </span>
                <span aria-hidden="true" className="absolute inset-0 bg-linear-to-r from-zinc-950 via-zinc-950/90 to-transparent" />
                <ManaGem value={card.cost} className="relative ml-1 size-7 text-xs" />
                <span className="relative min-w-0 flex-1 truncate [text-shadow:0_1px_2px_rgb(0_0_0/0.9)]">{cardName(card, language)}</span>
                {missing > 0 && (
                    <span className="relative rounded bg-red-600 px-1.5 text-[10px] font-black" title={t('deckMissingCopies', { n: missing })}>
                        −{missing}
                    </span>
                )}
                <span className="relative w-5 text-center text-amber-300">{card.rarity === 'LEGENDARY' ? '★' : count > 1 ? `×${count}` : ''}</span>
            </Tag>
            {onInfo && (
                <button type="button" onClick={onInfo} aria-label={t('viewCard')} className="w-7 shrink-0 rounded-lg bg-black/30 text-xs font-black text-amber-200 hover:bg-black/50">
                    i
                </button>
            )}
        </motion.li>
    )
}

export default function DeckPanel({ data, deck, owned, onCardClick, onCardInfo }: DeckPanelProps) {
    const { t, language } = useLanguage()
    const entries = deckEntries(data, deck)
    const size = deckSize(deck)
    const limit = deckLimit(deck)
    const cost = deckCost(data, deck, owned)
    const curve = manaCurve(data, deck)
    const peak = Math.max(1, ...curve)
    const types = typeCounts(data, deck)

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-end justify-between gap-2">
                <p className="text-2xl font-black">
                    <span className={size === limit ? 'text-emerald-400' : ''}>{size}</span>
                    <span className="text-base text-amber-200/70">/{limit}</span>
                </p>
                <div className="text-right text-xs font-bold">
                    <p>{t('deckDustTotal', { n: cost.total.toLocaleString() })}</p>
                    <p className={cost.missing ? 'text-red-400' : 'text-emerald-400'}>
                        {cost.missing ? t('deckDustMissing', { n: cost.missing.toLocaleString() }) : t('deckComplete')}
                    </p>
                </div>
            </div>

            <div className="flex h-24 items-end gap-1 rounded-xl bg-black/25 p-2" aria-label={t('deckCurve')}>
                {curve.map((count, cost) => (
                    <div key={cost} className="flex flex-1 flex-col items-center gap-1">
                        <span className="text-[10px] font-bold text-amber-200/80">{count || ''}</span>
                        <motion.span
                            initial={false}
                            animate={{ height: `${(count / peak) * 56}px` }}
                            className="w-full rounded-t bg-linear-to-t from-blue-700 to-sky-400"
                        />
                        <span className="text-[10px] font-black">{cost === curve.length - 1 ? `${cost}+` : cost}</span>
                    </div>
                ))}
            </div>

            {Object.keys(types).length > 0 && (
                <p className="flex flex-wrap gap-1.5 text-[11px] font-bold">
                    {Object.entries(types).map(([type, count]) => (
                        <span key={type} className="rounded-full bg-black/30 px-2 py-0.5">{hsLabel(type, language)}: {count}</span>
                    ))}
                </p>
            )}

            {entries.length === 0 ? (
                <p className="rounded-xl border-2 border-dashed border-amber-700/50 p-4 text-center text-sm text-amber-100/70">{t('deckEmpty')}</p>
            ) : (
                <ul className="flex flex-col gap-1">
                    <AnimatePresence initial={false}>
                        {entries.map(({ card, count }) => (
                            <DeckCardRow
                                key={card.dbfId}
                                card={card}
                                count={count}
                                missing={Math.max(0, count - ownedCopies(owned, card))}
                                onClick={onCardClick ? () => onCardClick(card) : undefined}
                                onInfo={onCardInfo ? () => onCardInfo(card) : undefined}
                            />
                        ))}
                    </AnimatePresence>
                </ul>
            )}
        </div>
    )
}
