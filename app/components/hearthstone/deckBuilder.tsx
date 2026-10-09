'use client'

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";
import { useAuth } from "../../context/authContext";
import { CLASS_COLORS, HS_HERO_CLASSES, cardName, hsLabel, isStandard, normalizeSearch, type HsCard, type HsData, type HsFormat } from "../../lib/hearthstone";
import { ownedCopies } from "../../lib/hsCollection";
import { addBlock, addCard, decodeDeck, deckSize, emptyDeck, encodeDeck, isClassCard, removeCard, type AddBlock, type Deck } from "../../lib/hsDeck";
import { saveDeck } from "../../lib/hsSavedDecks";
import type { MessageKey } from "../../i18n/translations";
import { HsCardImage, ManaGem } from "./cardImage";
import HsCardModal from "./cardModal";
import DeckPanel from "./deckPanel";
import { useCollection } from "./data";

const PAGE_SIZE = 30
const MAX_COST = 7
const PANEL = 'rounded-3xl border-2 border-amber-700/40 bg-black/25 p-4 shadow-xl backdrop-blur-sm'

const BLOCK_MESSAGES: Record<AddBlock, MessageKey> = {
    full: 'deckBlockFull',
    copies: 'deckBlockCopies',
    class: 'deckBlockClass',
    format: 'deckBlockFormat',
    bundled: 'deckBlockBundled',
}

export interface BuilderState {
    deck: Deck | null
    name: string
    savedId?: string
}

interface DeckBuilderProps {
    data: HsData
    state: BuilderState
    onChange: (state: BuilderState) => void
    onSaved: () => void
}

export default function DeckBuilder({ data, state, onChange, onSaved }: DeckBuilderProps) {
    if (!state.deck) return <DeckStart data={data} onStart={(deck, name) => onChange({ deck, name })} />
    return <Workshop data={data} deck={state.deck} name={state.name} savedId={state.savedId} onChange={onChange} onSaved={onSaved} />
}

function DeckStart({ data, onStart }: { data: HsData; onStart: (deck: Deck, name: string) => void }) {
    const { t, language } = useLanguage()
    const [format, setFormat] = useState<HsFormat>('standard')
    const [code, setCode] = useState('')
    const [error, setError] = useState('')

    const importCode = () => {
        const result = decodeDeck(data, code)
        if ('error' in result) {
            setError(t('deckImportError'))
            return
        }
        onStart(result.deck, `${hsLabel(result.deck.cls, language)} ${t('deckImported')}`)
    }

    return (
        <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
            <section className={PANEL}>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-xl font-black text-amber-300">{t('deckChooseClass')}</h3>
                    <FormatToggle value={format} onChange={setFormat} />
                </div>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {HS_HERO_CLASSES.map((cls, index) => (
                        <motion.li key={cls} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1, transition: { delay: index * 0.03 } }}>
                            <motion.button
                                type="button"
                                whileHover={{ y: -4, scale: 1.04 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onStart(emptyDeck(cls, format), `${hsLabel(cls, language)} ${t('deckNew')}`)}
                                style={{ backgroundColor: CLASS_COLORS[cls] }}
                                className="flex h-20 w-full items-center justify-center rounded-2xl border-2 border-white/25 px-3 text-center font-black text-white shadow-lg [text-shadow:0_1px_3px_rgb(0_0_0/0.7)]"
                            >
                                {hsLabel(cls, language)}
                            </motion.button>
                        </motion.li>
                    ))}
                </ul>
            </section>
            <section className={`${PANEL} flex flex-col gap-3`}>
                <h3 className="text-xl font-black text-amber-300">{t('deckImportTitle')}</h3>
                <p className="text-sm text-amber-100/75">{t('deckImportText')}</p>
                <textarea
                    value={code}
                    onChange={(event) => { setCode(event.target.value); setError('') }}
                    rows={4}
                    placeholder="AAECAf0E..."
                    className="rounded-xl border-2 border-amber-700/60 bg-black/30 p-3 font-mono text-xs text-amber-50 focus:border-amber-400 focus:outline-none"
                />
                {error && <p role="alert" className="text-sm font-bold text-red-400">{error}</p>}
                <button type="button" disabled={!code.trim()} onClick={importCode} className="rounded-xl bg-amber-400 px-4 py-2 font-black text-amber-950 disabled:opacity-50">
                    {t('deckImportButton')}
                </button>
            </section>
        </div>
    )
}

function FormatToggle({ value, onChange }: { value: HsFormat; onChange: (format: HsFormat) => void }) {
    const { t } = useLanguage()
    return (
        <div role="group" aria-label={t('hsFormat')} className="flex rounded-xl border-2 border-amber-700/60 p-0.5">
            {(['standard', 'wild'] as const).map((format) => (
                <button
                    key={format}
                    type="button"
                    aria-pressed={value === format}
                    onClick={() => onChange(format)}
                    className={`rounded-lg px-3 py-1 text-sm font-black transition-colors ${value === format ? 'bg-amber-400 text-amber-950' : 'hover:bg-white/10'}`}
                >
                    {t(format === 'standard' ? 'hsFormatStandard' : 'hsFormatWild')}
                </button>
            ))}
        </div>
    )
}

interface WorkshopProps {
    data: HsData
    deck: Deck
    name: string
    savedId?: string
    onChange: (state: BuilderState) => void
    onSaved: () => void
}

function Workshop({ data, deck, name, savedId, onChange, onSaved }: WorkshopProps) {
    const { t, language } = useLanguage()
    const { user } = useAuth()
    const owned = useCollection()
    const [query, setQuery] = useState('')
    const [cost, setCost] = useState<number | null>(null)
    const [onlyOwned, setOnlyOwned] = useState(false)
    const [onlyClass, setOnlyClass] = useState(false)
    const [limit, setLimit] = useState({ key: '', count: PAGE_SIZE })
    const [toast, setToast] = useState<string | null>(null)
    const [info, setInfo] = useState<number | null>(null)
    const sentinelRef = useRef<HTMLDivElement>(null)
    const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

    const notify = (message: string) => {
        setToast(message)
        clearTimeout(toastTimer.current)
        toastTimer.current = setTimeout(() => setToast(null), 2200)
    }

    const update = (next: Partial<BuilderState>) => onChange({ deck, name, savedId, ...next })

    const normalized = normalizeSearch(query)
    const results = useMemo(() => data.unique
        .filter((card) =>
            !card.bundled
            && isClassCard(card, deck.cls)
            && (!onlyClass || card.classes.includes(deck.cls))
            && (deck.format === 'wild' || isStandard(data, card))
            && (cost === null || (cost === MAX_COST ? card.cost >= MAX_COST : card.cost === cost))
            && (!onlyOwned || ownedCopies(owned, card) > 0)
            && (!normalized || normalizeSearch(cardName(card, language)).includes(normalized) || normalizeSearch(card.name[1]).includes(normalized)))
        .sort((a, b) => Number(b.classes.includes(deck.cls)) - Number(a.classes.includes(deck.cls)) || a.cost - b.cost || cardName(a, language).localeCompare(cardName(b, language))),
    [data, deck.cls, deck.format, onlyClass, cost, onlyOwned, owned, normalized, language])

    const filterKey = `${deck.cls}:${deck.format}:${normalized}:${cost}:${onlyOwned}:${onlyClass}`
    const count = limit.key === filterKey ? limit.count : PAGE_SIZE
    const hasMore = count < results.length

    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel || !hasMore) return
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) setLimit({ key: filterKey, count: count + PAGE_SIZE })
        }, { rootMargin: '500px' })
        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [hasMore, filterKey, count])

    const add = (card: HsCard) => {
        const block = addBlock(data, deck, card)
        if (block) notify(t(BLOCK_MESSAGES[block]))
        else update({ deck: addCard(deck, card) })
    }

    const code = deckSize(deck) > 0 ? encodeDeck(deck) : ''

    const copy = async (text: string, message: MessageKey) => {
        await navigator.clipboard.writeText(text)
        notify(t(message))
    }

    const save = async () => {
        try {
            const saved = await saveDeck(user?.id ?? null, { id: savedId, name: name.trim() || t('deckNew'), class: deck.cls, format: deck.format, code })
            update({ savedId: saved.id })
            notify(t(user ? 'deckSavedAccount' : 'deckSavedLocal'))
            onSaved()
        } catch (error) {
            console.error(error)
            notify(t('deckSaveError'))
        }
    }

    return (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <section className={`${PANEL} flex min-w-0 flex-col gap-3`}>
                <div className="flex flex-wrap gap-2">
                    <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={t('hsSearchPlaceholder')}
                        aria-label={t('hsSearchPlaceholder')}
                        className="min-w-48 flex-1 rounded-xl border-2 border-amber-700/60 bg-black/30 px-3 py-2 font-bold text-amber-50 placeholder:text-amber-100/40 focus:border-amber-400 focus:outline-none"
                    />
                    <Toggle active={onlyClass} onClick={() => setOnlyClass(!onlyClass)}>{t('deckOnlyClass', { cls: hsLabel(deck.cls, language) })}</Toggle>
                    <Toggle active={onlyOwned} onClick={() => setOnlyOwned(!onlyOwned)}>{t('deckOnlyOwned')}</Toggle>
                </div>
                <div role="group" aria-label={t('hsFilterCost')} className="flex flex-wrap gap-1.5">
                    {Array.from({ length: MAX_COST + 1 }, (_, value) => (
                        <button
                            key={value}
                            type="button"
                            aria-pressed={cost === value}
                            onClick={() => setCost(cost === value ? null : value)}
                            className={`rounded-full transition-opacity ${cost === null || cost === value ? '' : 'opacity-40'} ${cost === value ? 'ring-2 ring-amber-300' : ''}`}
                        >
                            <ManaGem value={value === MAX_COST ? `${value}+` : value} className="size-8 text-xs" />
                        </button>
                    ))}
                </div>
                <p className="text-xs font-bold text-amber-200/80">{t('deckBrowserHint')}</p>
                <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-5">
                    {results.slice(0, count).map((card) => {
                        const inDeck = deck.cards[card.dbfId] ?? 0
                        const have = ownedCopies(owned, card)
                        return (
                            <li key={card.dbfId} className="relative">
                                <motion.button
                                    type="button"
                                    whileHover={{ y: -4, scale: 1.03 }}
                                    whileTap={{ scale: 0.94 }}
                                    onClick={() => add(card)}
                                    onContextMenu={(event) => { event.preventDefault(); setInfo(card.dbfId) }}
                                    className={`block w-full rounded-xl ${have === 0 ? 'opacity-55 grayscale-[60%]' : ''}`}
                                    aria-label={`${t('deckAddCard')}: ${cardName(card, language)}`}
                                >
                                    <HsCardImage card={card} />
                                </motion.button>
                                {inDeck > 0 && (
                                    <motion.span
                                        key={inDeck}
                                        initial={{ scale: 1.6 }}
                                        animate={{ scale: 1 }}
                                        className="pointer-events-none absolute top-1 right-1 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-black text-amber-950 shadow"
                                    >
                                        {inDeck}
                                    </motion.span>
                                )}
                                {have === 0 && (
                                    <span className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-black/80 px-2 py-0.5 text-[10px] font-black whitespace-nowrap text-red-300">
                                        {t('deckNotOwned')}
                                    </span>
                                )}
                            </li>
                        )
                    })}
                </ul>
                {hasMore && <div ref={sentinelRef} className="h-8" />}
            </section>

            <aside className={`${PANEL} flex flex-col gap-3 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:self-start lg:overflow-y-auto`}>
                <div className="flex items-center gap-2">
                    <span className="size-4 shrink-0 rounded-full" style={{ backgroundColor: CLASS_COLORS[deck.cls] }} />
                    <input
                        value={name}
                        maxLength={60}
                        onChange={(event) => update({ name: event.target.value })}
                        aria-label={t('deckName')}
                        className="min-w-0 flex-1 rounded-lg border-2 border-transparent bg-transparent px-1 text-lg font-black text-amber-50 hover:border-amber-700/50 focus:border-amber-400 focus:outline-none"
                    />
                </div>
                <div className="flex items-center justify-between gap-2 text-xs font-bold text-amber-200/80">
                    <span>{hsLabel(deck.cls, language)} · {t(deck.format === 'standard' ? 'hsFormatStandard' : 'hsFormatWild')}</span>
                    <button type="button" onClick={() => onChange({ deck: null, name: '' })} className="text-amber-300 underline-offset-2 hover:underline">
                        {t('deckStartOver')}
                    </button>
                </div>

                <DeckPanel data={data} deck={deck} owned={owned} onCardClick={(card) => update({ deck: removeCard(deck, card) })} onCardInfo={(card) => setInfo(card.dbfId)} />

                <div className="grid grid-cols-2 gap-2">
                    <ActionButton disabled={!code} onClick={() => copy(code, 'deckCodeCopied')}>📋 {t('deckCopyCode')}</ActionButton>
                    <ActionButton disabled={!code} onClick={() => copy(`${location.origin}/hearthstone/decks?deck=${encodeURIComponent(code)}`, 'deckLinkCopied')}>🔗 {t('deckShare')}</ActionButton>
                    <ActionButton disabled={!code} onClick={save} primary>💾 {t(savedId ? 'deckUpdate' : 'deckSave')}</ActionButton>
                    <ActionButton disabled={deckSize(deck) === 0} onClick={() => update({ deck: { ...deck, cards: {}, sideboard: [] } })}>🗑️ {t('deckClear')}</ActionButton>
                </div>
                {!user && <p className="text-[11px] text-amber-100/60">{t('deckLocalNote')}</p>}
            </aside>

            <AnimatePresence>
                {toast && (
                    <motion.p
                        role="status"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-zinc-900 px-5 py-2 font-bold text-white shadow-2xl ring-2 ring-amber-400"
                    >
                        {toast}
                    </motion.p>
                )}
            </AnimatePresence>

            <HsCardModal data={data} dbfId={info} onClose={() => setInfo(null)} />
        </div>
    )
}

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            aria-pressed={active}
            onClick={onClick}
            className={`rounded-xl border-2 px-3 py-2 text-sm font-black transition-colors ${active ? 'border-amber-400 bg-amber-400 text-amber-950' : 'border-amber-700/60 hover:bg-white/10'}`}
        >
            {children}
        </button>
    )
}

function ActionButton({ disabled, onClick, primary, children }: { disabled?: boolean; onClick: () => void; primary?: boolean; children: React.ReactNode }) {
    return (
        <motion.button
            type="button"
            disabled={disabled}
            onClick={onClick}
            whileTap={{ scale: 0.95 }}
            className={`rounded-xl px-3 py-2 text-sm font-black shadow disabled:opacity-40 ${primary ? 'bg-amber-400 text-amber-950' : 'bg-black/35 hover:bg-black/50'}`}
        >
            {children}
        </motion.button>
    )
}
