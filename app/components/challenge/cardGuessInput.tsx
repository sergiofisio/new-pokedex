'use client'

import { useId, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";
import { CLASS_COLORS, HS_CLASSES, cardName, cardTile, hsLabel, normalizeSearch, type HsCard } from "../../lib/hearthstone";
import { ManaGem } from "../hearthstone/cardImage";
import { CARD } from "./shared";

const MAX_COST = 7

interface CardGuessInputProps {
    cards: HsCard[]
    guessed: number[]
    onGuess: (dbfId: number) => void
}

export default function CardGuessInput({ cards, guessed, onGuess }: CardGuessInputProps) {
    const { t, language } = useLanguage()
    const [query, setQuery] = useState('')
    const [cardClass, setCardClass] = useState('')
    const [cost, setCost] = useState<number | null>(null)
    const [active, setActive] = useState(0)
    const id = useId()
    const listId = `${id}-list`

    const normalized = normalizeSearch(query)
    const hasFilters = cardClass !== '' || cost !== null
    const isOpen = normalized !== '' || hasFilters
    const options = isOpen
        ? cards
            .filter((card) =>
                !guessed.includes(card.dbfId)
                && (!cardClass || card.classes.includes(cardClass))
                && (cost === null || (cost === MAX_COST ? card.cost >= MAX_COST : card.cost === cost))
                && (!normalized || normalizeSearch(cardName(card, language)).includes(normalized) || normalizeSearch(card.name[1]).includes(normalized)))
            .sort((a, b) => {
                const aStarts = normalizeSearch(cardName(a, language)).startsWith(normalized)
                const bStarts = normalizeSearch(cardName(b, language)).startsWith(normalized)
                return Number(bStarts) - Number(aStarts) || a.cost - b.cost || cardName(a, language).localeCompare(cardName(b, language))
            })
        : []
    const activeIndex = Math.min(active, options.length - 1)

    const moveActive = (next: number) => {
        setActive(next)
        document.getElementById(`${id}-${next}`)?.scrollIntoView({ block: 'nearest' })
    }

    const select = (card: HsCard) => {
        onGuess(card.dbfId)
        setQuery('')
        setActive(0)
    }

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'ArrowDown' && options.length) {
            event.preventDefault()
            moveActive((activeIndex + 1) % options.length)
        } else if (event.key === 'ArrowUp' && options.length) {
            event.preventDefault()
            moveActive((activeIndex - 1 + options.length) % options.length)
        } else if (event.key === 'Enter' && options[activeIndex]) {
            event.preventDefault()
            select(options[activeIndex])
        } else if (event.key === 'Escape') {
            setQuery('')
        }
    }

    return (
        <div className={`${CARD} flex flex-col gap-3 p-4`}>
            <label htmlFor={id} className="sr-only">{t('cardGuessLabel')}</label>
            <motion.input
                id={id}
                type="text"
                role="combobox"
                autoComplete="off"
                autoFocus
                aria-expanded={isOpen}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={options[activeIndex] ? `${id}-${activeIndex}` : undefined}
                value={query}
                onChange={(event) => { setQuery(event.target.value); setActive(0) }}
                onKeyDown={onKeyDown}
                placeholder={t('cardGuessPlaceholder')}
                whileFocus={{ scale: 1.01 }}
                className="w-full rounded-2xl border-4 border-amber-900 bg-white px-4 py-2.5 text-lg font-bold shadow outline-none placeholder:font-normal placeholder:text-zinc-400 focus:border-amber-500 dark:border-amber-800 dark:bg-zinc-900"
            />

            <fieldset className="flex flex-col gap-2">
                <legend className="mb-1 flex w-full items-center justify-between text-xs font-black uppercase tracking-wide text-zinc-500">
                    {t('filters')}
                    {hasFilters && (
                        <button
                            type="button"
                            onClick={() => { setCardClass(''); setCost(null); setActive(0) }}
                            className="text-amber-700 normal-case tracking-normal hover:underline dark:text-amber-400"
                        >
                            {t('clearFilters')}
                        </button>
                    )}
                </legend>
                <div role="group" aria-label={t('hsFilterCost')} className="flex justify-between gap-1">
                    {Array.from({ length: MAX_COST + 1 }, (_, value) => (
                        <button
                            key={value}
                            type="button"
                            aria-pressed={cost === value}
                            onClick={() => { setCost(cost === value ? null : value); setActive(0) }}
                            className={`rounded-full transition-opacity ${cost === null || cost === value ? '' : 'opacity-35'} ${cost === value ? 'ring-2 ring-amber-500' : ''}`}
                        >
                            <ManaGem value={value === MAX_COST ? `${value}+` : value} className="size-8 text-xs" />
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor={`${id}-class`} className="shrink-0 text-xs font-black text-zinc-500">{t('hsFilterClass')}</label>
                    <select
                        id={`${id}-class`}
                        value={cardClass}
                        onChange={(event) => { setCardClass(event.target.value); setActive(0) }}
                        style={cardClass ? { backgroundColor: CLASS_COLORS[cardClass] } : undefined}
                        className={`min-w-0 flex-1 rounded-lg px-2 py-1.5 text-sm font-bold outline-none ${cardClass ? 'text-white' : 'bg-zinc-100 dark:bg-zinc-800'}`}
                    >
                        <option value="">{t('hsFilterAll')}</option>
                        {HS_CLASSES.map((cls) => <option key={cls} value={cls}>{hsLabel(cls, language)}</option>)}
                    </select>
                </div>
            </fieldset>

            <AnimatePresence initial={false}>
                {isOpen ? (
                    <motion.div key="results" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <p className="mb-1 px-1 text-xs font-bold text-zinc-500" aria-live="polite">{t('resultsCount', { n: options.length })}</p>
                        <ul
                            id={listId}
                            role="listbox"
                            className="max-h-[50vh] overflow-y-auto overscroll-contain rounded-2xl bg-zinc-50 p-1.5 ring-1 ring-zinc-200 lg:max-h-[calc(100vh-24rem)] dark:bg-zinc-950/60 dark:ring-zinc-700"
                        >
                            {options.length === 0 ? (
                                <li className="px-4 py-3 text-sm text-zinc-500">{t('cardGuessNoResults')}</li>
                            ) : options.map((card, index) => (
                                <li
                                    key={card.dbfId}
                                    id={`${id}-${index}`}
                                    role="option"
                                    aria-selected={index === activeIndex}
                                    onMouseDown={(event) => event.preventDefault()}
                                    onMouseEnter={() => setActive(index)}
                                    onClick={() => select(card)}
                                    className={`relative flex cursor-pointer items-center gap-2 overflow-hidden rounded-xl px-2 py-1.5 font-semibold [contain-intrinsic-size:auto_2.75rem] [content-visibility:auto] ${
                                        index === activeIndex ? 'bg-amber-600 text-white' : ''
                                    }`}
                                >
                                    <ManaGem value={card.cost} className="size-7 text-xs" />
                                    <span className="z-10 flex-1 truncate">{cardName(card, language)}</span>
                                    <Image src={cardTile(card)} alt="" width={128} height={30} unoptimized loading="lazy" className="h-7 w-24 rounded-md object-cover opacity-90" />
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                ) : (
                    <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-1 text-center text-xs text-zinc-500">
                        {t('cardGuessHint')}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    )
}
