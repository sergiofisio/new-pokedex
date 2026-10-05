'use client'

import { useId, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";
import { useAsyncData } from "../../hooks/useAsyncData";
import { POKEMON_TYPES, fetchSpeciesIdsOfType, getGenerationOfId, getSpeciesId, searchSpecies, type Species } from "../../lib/pokeapi";
import { getOfficialArtwork } from "../../lib/sprites";
import { TYPE_COLORS } from "../../lib/typeColors";
import { prettify } from "../../i18n/translations";
import { GENERATIONS } from "../generationMenu";
import { CARD, useSpeciesList } from "./shared";

export interface GuessFilters {
    generation: number | null;
    type: string | null;
}

export const NO_FILTERS: GuessFilters = { generation: null, type: null }

const loadTypeIds = (type: string) => type ? fetchSpeciesIdsOfType(type) : Promise.resolve(null)

interface GuessInputProps {
    guessed: number[];
    onGuess: (id: number) => void;
    filters: GuessFilters;
    onFiltersChange: (filters: GuessFilters) => void;
}

export default function GuessInput({ guessed, onGuess, filters, onFiltersChange }: GuessInputProps) {
    const { t, typeName } = useLanguage()
    const species = useSpeciesList()
    const typeIds = useAsyncData(filters.type ?? '', loadTypeIds)
    const [query, setQuery] = useState('')
    const [active, setActive] = useState(0)
    const id = useId()
    const listId = `${id}-list`

    const hasFilters = filters.generation !== null || filters.type !== null
    const isOpen = query.trim() !== '' || hasFilters
    const typeSet = typeIds?.status === 'success' && typeIds.data ? new Set(typeIds.data) : null
    const loadingType = filters.type !== null && !typeSet

    const options = isOpen && species?.status === 'success' && !loadingType
        ? (query.trim() ? searchSpecies(species.data, query) : species.data).filter(({ url }) => {
            const speciesId = getSpeciesId(url)
            return !guessed.includes(speciesId)
                && (filters.generation === null || getGenerationOfId(speciesId) === filters.generation)
                && (!typeSet || typeSet.has(speciesId))
        })
        : []
    const activeIndex = Math.min(active, options.length - 1)

    const moveActive = (next: number) => {
        setActive(next)
        document.getElementById(`${id}-${next}`)?.scrollIntoView({ block: 'nearest' })
    }

    const select = (option: Species) => {
        onGuess(getSpeciesId(option.url))
        setQuery('')
        setActive(0)
    }

    const updateFilters = (changes: Partial<GuessFilters>) => {
        onFiltersChange({ ...filters, ...changes })
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
            <label htmlFor={id} className="sr-only">{t('guessLabel')}</label>
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
                placeholder={t('guessPlaceholder')}
                whileFocus={{ scale: 1.01 }}
                className="w-full rounded-2xl border-4 border-zinc-900 bg-white px-4 py-2.5 text-lg font-bold shadow outline-none placeholder:font-normal placeholder:text-zinc-400 focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-red-500"
            />

            <fieldset className="flex flex-col gap-2">
                <legend className="mb-1 flex w-full items-center justify-between text-xs font-black uppercase tracking-wide text-zinc-500">
                    {t('filters')}
                    {hasFilters && (
                        <button type="button" onClick={() => updateFilters(NO_FILTERS)} className="text-red-600 normal-case tracking-normal hover:underline dark:text-red-400">
                            {t('clearFilters')}
                        </button>
                    )}
                </legend>
                <div className="grid grid-cols-9 gap-1" role="group" aria-label={t('generation')}>
                    {GENERATIONS.map((generation) => {
                        const selected = filters.generation === generation.id
                        return (
                            <button
                                key={generation.id}
                                type="button"
                                aria-pressed={selected}
                                title={generation.region}
                                onClick={() => updateFilters({ generation: selected ? null : generation.id })}
                                className={`rounded-lg py-1 text-[11px] font-black transition-colors ${
                                    selected ? 'bg-red-600 text-white' : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700'
                                }`}
                            >
                                {generation.label}
                            </button>
                        )
                    })}
                </div>
                <label className="sr-only" htmlFor={`${id}-type`}>{t('hintTypes')}</label>
                <select
                    id={`${id}-type`}
                    value={filters.type ?? ''}
                    onChange={(event) => updateFilters({ type: event.target.value || null })}
                    className={`rounded-lg px-2 py-1.5 text-sm font-bold outline-none ${
                        filters.type ? `${TYPE_COLORS[filters.type]?.card ?? ''} ${TYPE_COLORS[filters.type]?.text ?? ''}` : 'bg-zinc-100 dark:bg-zinc-800'
                    }`}
                >
                    <option value="">{t('allTypes')}</option>
                    {POKEMON_TYPES.map((type) => <option key={type} value={type}>{typeName(type)}</option>)}
                </select>
            </fieldset>

            <AnimatePresence initial={false}>
                {isOpen ? (
                    <motion.div key="results" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <p className="mb-1 px-1 text-xs font-bold text-zinc-500" aria-live="polite">
                            {loadingType ? t('challengeLoading') : t('resultsCount', { n: options.length })}
                        </p>
                        <ul
                            id={listId}
                            role="listbox"
                            className="max-h-[50vh] overflow-y-auto overscroll-contain rounded-2xl bg-zinc-50 p-1.5 ring-1 ring-zinc-200 lg:max-h-[calc(100vh-24rem)] dark:bg-zinc-950/60 dark:ring-zinc-700"
                        >
                            {options.length === 0 && !loadingType ? (
                                <li className="px-4 py-3 text-sm text-zinc-500">{t('guessNoResults')}</li>
                            ) : options.map((option, index) => {
                                const speciesId = getSpeciesId(option.url)
                                return (
                                    <li
                                        key={option.url}
                                        id={`${id}-${index}`}
                                        role="option"
                                        aria-selected={index === activeIndex}
                                        onMouseDown={(event) => event.preventDefault()}
                                        onMouseEnter={() => setActive(index)}
                                        onClick={() => select(option)}
                                        className={`flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1 font-semibold [contain-intrinsic-size:auto_3rem] [content-visibility:auto] ${
                                            index === activeIndex ? 'bg-red-600 text-white' : ''
                                        }`}
                                    >
                                        <Image src={getOfficialArtwork(speciesId)} alt="" width={40} height={40} loading="lazy" className="size-10 object-contain" />
                                        <span className="flex-1 truncate">{prettify(option.name)}</span>
                                        <span className="font-mono text-xs opacity-70">#{String(speciesId).padStart(4, '0')}</span>
                                    </li>
                                )
                            })}
                        </ul>
                    </motion.div>
                ) : (
                    <motion.p key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-1 text-center text-xs text-zinc-500">
                        {t('guessPanelHint')}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    )
}
