'use client'

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";
import { useAuth } from "../../context/authContext";
import { CRAFT_COST, HS_CLASSES, cardName, hsLabel, isStandard, maxCopies, normalizeSearch, setName, type HsCard, type HsData } from "../../lib/hearthstone";
import { clearCollection, ownedCopies, setCopies } from "../../lib/hsCollection";
import { decodeDeck } from "../../lib/hsDeck";
import { HsCardImage } from "./cardImage";
import { useCollection, useHsData } from "./data";

const PAGE_SIZE = 36
const PANEL = 'rounded-3xl border-2 border-amber-700/40 bg-black/25 p-4 shadow-xl backdrop-blur-sm'
const SELECT = 'rounded-xl border-2 border-amber-700/60 bg-black/30 px-3 py-2 text-sm font-bold text-amber-50 focus:border-amber-400 focus:outline-none [&>option]:bg-[#2b1a10]'

type Show = 'all' | 'owned' | 'missing'

export default function CollectionPage() {
    const { t } = useLanguage()
    const state = useHsData()
    if (!state) return <div className="h-64 animate-pulse rounded-3xl bg-white/10" />
    if (state.status === 'error') return <p role="alert" className="rounded-2xl bg-red-900/50 p-6 text-center font-bold">{t('hsLoadError')}</p>
    return <Collection data={state.data} />
}

const collectable = (card: HsCard) => !card.bundled && card.rarity !== 'FREE'

function Collection({ data }: { data: HsData }) {
    const { t, language } = useLanguage()
    const { user } = useAuth()
    const owned = useCollection()
    const cards = useMemo(() => data.unique.filter(collectable), [data])
    const standardCards = useMemo(() => cards.filter((card) => isStandard(data, card)), [cards, data])

    const summary = (list: HsCard[]) => {
        let have = 0
        let total = 0
        let dust = 0
        for (const card of list) {
            const copies = ownedCopies(owned, card)
            have += copies
            total += maxCopies(card)
            dust += copies * CRAFT_COST[card.rarity]
        }
        return { have, total, dust }
    }
    const standard = summary(standardCards)
    const wild = summary(cards)

    return (
        <div className="flex flex-col gap-5">
            <section className={`${PANEL} flex flex-col gap-2 border-sky-700/50`}>
                <h3 className="font-black text-sky-300">ℹ️ {t('collectionWhyTitle')}</h3>
                <p className="text-sm text-amber-100/85">{t('collectionWhyText')}</p>
                {!user && (
                    <p className="text-sm font-bold">
                        <Link href="/entrar" className="text-amber-300 underline-offset-2 hover:underline">{t('signInToSync')}</Link>
                    </p>
                )}
            </section>

            <div className="grid gap-4 md:grid-cols-2">
                <StatCard title={t('hsFormatStandard')} {...standard} />
                <StatCard title={t('hsFormatWild')} {...wild} />
            </div>

            <QuickActions data={data} cards={cards} />

            <CollectionGrid data={data} cards={cards} language={language} />
        </div>
    )
}

function StatCard({ title, have, total, dust }: { title: string; have: number; total: number; dust: number }) {
    const { t } = useLanguage()
    const ratio = total ? have / total : 0
    return (
        <div className={PANEL}>
            <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-lg font-black text-amber-300">{title}</h3>
                <p className="text-sm font-bold">{t('collectionCopies', { have: have.toLocaleString(), total: total.toLocaleString() })}</p>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-black/40">
                <motion.div initial={{ width: 0 }} animate={{ width: `${ratio * 100}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-linear-to-r from-amber-500 to-yellow-300" />
            </div>
            <p className="mt-2 text-xs font-bold text-amber-200/75">{t('collectionDustValue', { n: dust.toLocaleString() })}</p>
        </div>
    )
}

function QuickActions({ data, cards }: { data: HsData; cards: HsCard[] }) {
    const { t, language } = useLanguage()
    const owned = useCollection()
    const [set, setSet] = useState('CORE')
    const [codes, setCodes] = useState('')
    const [message, setMessage] = useState('')

    const setCards = (list: HsCard[], fill: boolean) => setCopies(list.map((card) => [card, fill ? maxCopies(card) : 0]))
    const inSet = (id: string) => cards.filter((card) => data.sets[card.set].id === id)

    const importCodes = () => {
        let imported = 0
        let failed = 0
        const entries: [HsCard, number][] = []
        for (const line of codes.split(/\n+/).map((value) => value.trim()).filter(Boolean)) {
            const result = decodeDeck(data, line)
            if ('error' in result) {
                failed++
                continue
            }
            imported++
            for (const [id, count] of Object.entries(result.deck.cards)) {
                const card = data.byDbf.get(Number(id))
                if (card && collectable(card)) entries.push([card, count])
            }
        }
        setCopies(entries.map(([card, count]) => [card, Math.max(count, ownedCopies(owned, card))]))
        setMessage(t('collectionImported', { n: imported, failed }))
        if (imported) setCodes('')
    }

    return (
        <section className="grid gap-4 lg:grid-cols-2">
            <div className={`${PANEL} flex flex-col gap-3`}>
                <h3 className="text-lg font-black text-amber-300">{t('collectionSetsTitle')}</h3>
                <select aria-label={t('hsFilterSet')} value={set} onChange={(event) => setSet(event.target.value)} className={SELECT}>
                    {[...data.sets].reverse().filter((item) => inSet(item.id).length).map((item) => (
                        <option key={item.id} value={item.id}>{setName(item, language)} ({item.year}){item.standard ? ` · ${t('hsFormatStandard')}` : ''}</option>
                    ))}
                </select>
                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setCards(inSet(set), true)} className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-black text-amber-950">
                        ✓ {t('collectionOwnSet')}
                    </button>
                    <button type="button" onClick={() => setCards(inSet(set), false)} className="rounded-xl bg-black/35 px-4 py-2 text-sm font-black hover:bg-black/50">
                        {t('collectionRemoveSet')}
                    </button>
                </div>
                <button
                    type="button"
                    onClick={() => { if (confirm(t('collectionClearConfirm'))) clearCollection() }}
                    className="mt-auto w-fit text-xs font-bold text-red-300 underline-offset-2 hover:underline"
                >
                    {t('collectionClear')}
                </button>
            </div>
            <div className={`${PANEL} flex flex-col gap-3`}>
                <h3 className="text-lg font-black text-amber-300">{t('collectionImportTitle')}</h3>
                <p className="text-sm text-amber-100/80">{t('collectionImportText')}</p>
                <textarea
                    value={codes}
                    onChange={(event) => { setCodes(event.target.value); setMessage('') }}
                    rows={3}
                    placeholder="AAECAf0E...&#10;AAECAa0G..."
                    className="rounded-xl border-2 border-amber-700/60 bg-black/30 p-3 font-mono text-xs text-amber-50 focus:border-amber-400 focus:outline-none"
                />
                <div className="flex items-center gap-3">
                    <button type="button" disabled={!codes.trim()} onClick={importCodes} className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-black text-amber-950 disabled:opacity-50">
                        {t('collectionImportButton')}
                    </button>
                    {message && <p role="status" className="text-sm font-bold">{message}</p>}
                </div>
            </div>
        </section>
    )
}

function CollectionGrid({ data, cards, language }: { data: HsData; cards: HsCard[]; language: 'pt' | 'en' }) {
    const { t } = useLanguage()
    const owned = useCollection()
    const [query, setQuery] = useState('')
    const [cardClass, setCardClass] = useState('')
    const [set, setSet] = useState('')
    const [show, setShow] = useState<Show>('all')
    const [limit, setLimit] = useState({ key: '', count: PAGE_SIZE })
    const sentinelRef = useRef<HTMLDivElement>(null)

    const normalized = normalizeSearch(query)
    const filterKey = `${normalized}:${cardClass}:${set}:${show}`
    const results = useMemo(() => cards
        .filter((card) =>
            (!cardClass || card.classes.includes(cardClass))
            && (!set || data.sets[card.set].id === set)
            && (!normalized || normalizeSearch(cardName(card, language)).includes(normalized) || normalizeSearch(card.name[1]).includes(normalized)))
        .sort((a, b) => a.cost - b.cost || cardName(a, language).localeCompare(cardName(b, language))),
    [cards, data, cardClass, set, normalized, language])
    const visible = show === 'all' ? results : results.filter((card) => (ownedCopies(owned, card) > 0) === (show === 'owned'))
    const count = limit.key === filterKey ? limit.count : PAGE_SIZE
    const hasMore = count < visible.length

    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel || !hasMore) return
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) setLimit({ key: filterKey, count: count + PAGE_SIZE })
        }, { rootMargin: '600px' })
        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [hasMore, filterKey, count])

    return (
        <section className={`${PANEL} flex flex-col gap-4`}>
            <h3 className="text-lg font-black text-amber-300">{t('collectionCardsTitle')}</h3>
            <div className="flex flex-wrap gap-2">
                <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t('hsSearchPlaceholder')}
                    aria-label={t('hsSearchPlaceholder')}
                    className="min-w-48 flex-1 rounded-xl border-2 border-amber-700/60 bg-black/30 px-3 py-2 font-bold text-amber-50 placeholder:text-amber-100/40 focus:border-amber-400 focus:outline-none"
                />
                <select aria-label={t('hsFilterClass')} value={cardClass} onChange={(event) => setCardClass(event.target.value)} className={SELECT}>
                    <option value="">{t('hsFilterClass')}: {t('hsFilterAll')}</option>
                    {HS_CLASSES.map((cls) => <option key={cls} value={cls}>{hsLabel(cls, language)}</option>)}
                </select>
                <select aria-label={t('hsFilterSet')} value={set} onChange={(event) => setSet(event.target.value)} className={`${SELECT} max-w-60`}>
                    <option value="">{t('hsAllSets')}</option>
                    {[...data.sets].reverse().map((item) => <option key={item.id} value={item.id}>{setName(item, language)} ({item.year})</option>)}
                </select>
                <select aria-label={t('collectionShow')} value={show} onChange={(event) => setShow(event.target.value as Show)} className={SELECT}>
                    <option value="all">{t('collectionShowAll')}</option>
                    <option value="owned">{t('collectionShowOwned')}</option>
                    <option value="missing">{t('collectionShowMissing')}</option>
                </select>
            </div>
            <p className="text-sm font-bold text-amber-200/80">{t('hsResults', { n: visible.length })}</p>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {visible.slice(0, count).map((card, index) => {
                    const copies = ownedCopies(owned, card)
                    const max = maxCopies(card)
                    return (
                        <li key={card.dbfId} className="flex flex-col items-center gap-1">
                            <motion.button
                                type="button"
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setCopies([[card, copies >= max ? 0 : copies + 1]])}
                                aria-label={`${cardName(card, language)}: ${copies}/${max}`}
                                className={`w-full rounded-xl transition-[filter,opacity] ${copies === 0 ? 'opacity-45 grayscale' : ''}`}
                            >
                                <HsCardImage card={card} eager={index < 12} />
                            </motion.button>
                            <div className="flex items-center gap-1 rounded-full bg-black/40 p-0.5">
                                <button type="button" disabled={copies === 0} onClick={() => setCopies([[card, copies - 1]])} aria-label={t('collectionRemoveCopy')} className="size-7 rounded-full font-black hover:bg-white/10 disabled:opacity-30">−</button>
                                <span className={`w-10 text-center text-sm font-black ${copies === max ? 'text-emerald-400' : ''}`}>{copies}/{max}</span>
                                <button type="button" disabled={copies >= max} onClick={() => setCopies([[card, copies + 1]])} aria-label={t('collectionAddCopy')} className="size-7 rounded-full font-black hover:bg-white/10 disabled:opacity-30">+</button>
                            </div>
                        </li>
                    )
                })}
            </ul>
            {hasMore && <div ref={sentinelRef} className="h-8" />}
        </section>
    )
}
