'use client'

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";
import {
    CLASS_COLORS, HS_CLASSES, HS_RARITIES, HS_TYPES, cardName, hsLabel, isStandard, normalizeSearch, setName,
    type HsCard, type HsCardType, type HsData, type HsFormat, type HsRarity,
} from "../../lib/hearthstone";
import { HsCardImage, ManaGem } from "./cardImage";
import HsCardModal from "./cardModal";
import { useHsData } from "./data";
import AdSlot from "../ads/adSlot";
import { adsEnabled } from "../../lib/ads";

const PAGE_SIZE = 36
const AD_EVERY = PAGE_SIZE * 2
const showAds = adsEnabled()
const MAX_COST_FILTER = 7

export interface LibraryFilters {
    query: string
    cardClass: string
    cost: number | null
    type: HsCardType | ''
    rarity: HsRarity | ''
    format: HsFormat
    set: string
    sort: 'cost' | 'name'
}

const DEFAULT_FILTERS: LibraryFilters = { query: '', cardClass: '', cost: null, type: '', rarity: '', format: 'standard', set: '', sort: 'cost' }

export function filterCards(data: HsData, cards: HsCard[], filters: LibraryFilters, language: 'pt' | 'en') {
    const query = normalizeSearch(filters.query)
    const result = cards.filter((card) => {
        if (filters.format === 'standard' && !isStandard(data, card)) return false
        if (filters.cardClass && !card.classes.includes(filters.cardClass)) return false
        if (filters.cost !== null && (filters.cost === MAX_COST_FILTER ? card.cost < MAX_COST_FILTER : card.cost !== filters.cost)) return false
        if (filters.type && card.type !== filters.type) return false
        if (filters.rarity && card.rarity !== filters.rarity) return false
        if (filters.set && data.sets[card.set].id !== filters.set) return false
        if (query && !normalizeSearch(cardName(card, language)).includes(query) && !normalizeSearch(card.name[1]).includes(query)) return false
        return true
    })
    return result.sort((a, b) =>
        filters.sort === 'cost'
            ? a.cost - b.cost || cardName(a, language).localeCompare(cardName(b, language))
            : cardName(a, language).localeCompare(cardName(b, language))
    )
}

const SELECT = 'rounded-xl border-2 border-amber-700/60 bg-black/30 px-3 py-2 text-sm font-bold text-amber-50 focus:border-amber-400 focus:outline-none [&>option]:bg-[#2b1a10]'

export default function HsLibrary({ initialClass = '' }: { initialClass?: string }) {
    const state = useHsData()

    if (!state) return <LibrarySkeleton />
    if (state.status === 'error') return <LibraryError />
    return <Library data={state.data} initialClass={initialClass} />
}

function LibrarySkeleton() {
    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 12 }, (_, index) => (
                <div key={index} className="aspect-256/388 animate-pulse rounded-2xl bg-white/10" />
            ))}
        </div>
    )
}

function LibraryError() {
    const { t } = useLanguage()
    return <p role="alert" className="rounded-2xl bg-red-900/50 p-6 text-center font-bold">{t('hsLoadError')}</p>
}

function Library({ data, initialClass }: { data: HsData; initialClass: string }) {
    const { t, language } = useLanguage()
    const [filters, setFilters] = useState<LibraryFilters>({ ...DEFAULT_FILTERS, cardClass: (HS_CLASSES as readonly string[]).includes(initialClass) ? initialClass : '' })
    const [limit, setLimit] = useState({ key: '', count: PAGE_SIZE })
    const [selected, setSelected] = useState<number | null>(null)
    const sentinelRef = useRef<HTMLDivElement>(null)

    const results = useMemo(() => filterCards(data, data.unique, filters, language), [data, filters, language])
    const filterKey = JSON.stringify(filters)
    const count = limit.key === filterKey ? limit.count : PAGE_SIZE
    const visible = results.slice(0, count)
    const hasMore = count < results.length

    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel || !hasMore) return
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) setLimit({ key: filterKey, count: count + PAGE_SIZE })
        }, { rootMargin: '600px' })
        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [hasMore, filterKey, count])

    const update = (patch: Partial<LibraryFilters>) => setFilters((current) => ({ ...current, ...patch }))
    const availableSets = data.sets.filter((set) => filters.format === 'wild' || set.standard)
    const navigation = useMemo(() => results.map((card) => card.dbfId), [results])
    const isDirty = filterKey !== JSON.stringify({ ...DEFAULT_FILTERS, format: filters.format, sort: filters.sort })

    return (
        <div className="flex flex-col gap-5">
            <section className="flex flex-col gap-4 rounded-3xl border-2 border-amber-700/40 bg-black/25 p-4 shadow-xl backdrop-blur-sm">
                <div className="flex flex-wrap gap-3">
                    <label className="flex min-w-60 flex-1">
                        <span className="sr-only">{t('hsSearchPlaceholder')}</span>
                        <input
                            type="search"
                            value={filters.query}
                            onChange={(event) => update({ query: event.target.value })}
                            placeholder={t('hsSearchPlaceholder')}
                            className="w-full rounded-xl border-2 border-amber-700/60 bg-black/30 px-4 py-2 font-bold text-amber-50 placeholder:text-amber-100/40 focus:border-amber-400 focus:outline-none"
                        />
                    </label>
                    <div role="group" aria-label={t('hsFormat')} className="flex rounded-xl border-2 border-amber-700/60 p-0.5">
                        {(['standard', 'wild'] as const).map((format) => (
                            <button
                                key={format}
                                type="button"
                                aria-pressed={filters.format === format}
                                onClick={() => update({ format, set: '' })}
                                className={`rounded-lg px-3 py-1.5 text-sm font-black transition-colors ${filters.format === format ? 'bg-amber-400 text-amber-950' : 'hover:bg-white/10'}`}
                            >
                                {t(format === 'standard' ? 'hsFormatStandard' : 'hsFormatWild')}
                            </button>
                        ))}
                    </div>
                </div>

                <div role="group" aria-label={t('hsFilterClass')} className="flex flex-wrap gap-1.5">
                    <ClassChip active={!filters.cardClass} onClick={() => update({ cardClass: '' })} color="#a16207">{t('hsFilterAll')}</ClassChip>
                    {HS_CLASSES.map((cls) => (
                        <ClassChip key={cls} active={filters.cardClass === cls} onClick={() => update({ cardClass: filters.cardClass === cls ? '' : cls })} color={CLASS_COLORS[cls]}>
                            {hsLabel(cls, language)}
                        </ClassChip>
                    ))}
                </div>

                <div role="group" aria-label={t('hsFilterCost')} className="flex flex-wrap items-center gap-1.5">
                    {Array.from({ length: MAX_COST_FILTER + 1 }, (_, cost) => (
                        <motion.button
                            key={cost}
                            type="button"
                            whileHover={{ scale: 1.12 }}
                            whileTap={{ scale: 0.9 }}
                            aria-pressed={filters.cost === cost}
                            aria-label={`${t('hsFilterCost')} ${cost === MAX_COST_FILTER ? `${cost}+` : cost}`}
                            onClick={() => update({ cost: filters.cost === cost ? null : cost })}
                            className={`rounded-full transition-opacity ${filters.cost === null || filters.cost === cost ? '' : 'opacity-40'} ${filters.cost === cost ? 'ring-2 ring-amber-300' : ''}`}
                        >
                            <ManaGem value={cost === MAX_COST_FILTER ? `${cost}+` : cost} className="size-9 text-sm" />
                        </motion.button>
                    ))}
                </div>

                <div className="flex flex-wrap gap-2">
                    <select aria-label={t('hsFilterType')} value={filters.type} onChange={(event) => update({ type: event.target.value as HsCardType | '' })} className={SELECT}>
                        <option value="">{t('hsFilterType')}: {t('hsFilterAll')}</option>
                        {HS_TYPES.map((type) => <option key={type} value={type}>{hsLabel(type, language)}</option>)}
                    </select>
                    <select aria-label={t('hsFilterRarity')} value={filters.rarity} onChange={(event) => update({ rarity: event.target.value as HsRarity | '' })} className={SELECT}>
                        <option value="">{t('hsFilterRarity')}: {t('hsFilterAll')}</option>
                        {HS_RARITIES.map((rarity) => <option key={rarity} value={rarity}>{hsLabel(rarity, language)}</option>)}
                    </select>
                    <select aria-label={t('hsFilterSet')} value={filters.set} onChange={(event) => update({ set: event.target.value })} className={`${SELECT} max-w-64`}>
                        <option value="">{t('hsAllSets')}</option>
                        {[...availableSets].reverse().map((set) => <option key={set.id} value={set.id}>{setName(set, language)} ({set.year})</option>)}
                    </select>
                    <select aria-label={t('hsSort')} value={filters.sort} onChange={(event) => update({ sort: event.target.value as LibraryFilters['sort'] })} className={SELECT}>
                        <option value="cost">{t('hsSortCost')}</option>
                        <option value="name">{t('hsSortName')}</option>
                    </select>
                    {isDirty && (
                        <button type="button" onClick={() => setFilters({ ...DEFAULT_FILTERS, format: filters.format, sort: filters.sort })} className="rounded-xl px-3 py-2 text-sm font-bold text-amber-300 underline-offset-2 hover:underline">
                            {t('hsClearFilters')}
                        </button>
                    )}
                </div>
            </section>

            <p aria-live="polite" className="text-sm font-bold text-amber-200/80">{t('hsResults', { n: results.length })}</p>

            {results.length === 0 ? (
                <p className="rounded-3xl bg-black/25 p-10 text-center font-bold">{t('hsNoResults')}</p>
            ) : (
                <ul className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {visible.map((card, index) => (
                        <Fragment key={card.dbfId}>
                            {showAds && index > 0 && index % AD_EVERY === 0 && (
                                <li className="col-span-full"><AdSlot /></li>
                            )}
                            <motion.li
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0, transition: { delay: (index % PAGE_SIZE) * 0.015 } }}
                            >
                                <motion.button
                                    type="button"
                                    whileHover={{ y: -8, scale: 1.04, rotate: index % 2 ? 1.5 : -1.5 }}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => setSelected(card.dbfId)}
                                    className="block w-full rounded-2xl focus-visible:outline-4 focus-visible:outline-amber-400"
                                >
                                    <HsCardImage card={card} eager={index < 12} />
                                </motion.button>
                            </motion.li>
                        </Fragment>
                    ))}
                </ul>
            )}
            {hasMore && <div ref={sentinelRef} className="h-10" />}

            <HsCardModal data={data} dbfId={selected} navigation={navigation} onClose={() => setSelected(null)} onNavigate={setSelected} />
        </div>
    )
}

function ClassChip({ active, color, onClick, children }: { active: boolean; color: string; onClick: () => void; children: React.ReactNode }) {
    return (
        <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            aria-pressed={active}
            onClick={onClick}
            style={{ backgroundColor: active ? color : undefined, borderColor: color }}
            className={`rounded-full border-2 px-3 py-1 text-xs font-black transition-colors ${active ? 'text-white shadow-md [text-shadow:0_1px_2px_rgb(0_0_0/0.6)]' : 'text-amber-50/85 hover:bg-white/10'}`}
        >
            {children}
        </motion.button>
    )
}
