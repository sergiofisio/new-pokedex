'use client'

import { useId, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";
import { getSpeciesId, searchSpecies, type Species } from "../../lib/pokeapi";
import { getOfficialArtwork } from "../../lib/sprites";
import { prettify } from "../../i18n/translations";
import { useSpeciesList, useSpeciesName } from "../challenge/shared";

const MAX_OPTIONS = 6

interface PokemonSearchProps {
    label: string;
    onSelect: (id: number) => void;
    exclude?: number[];
    disabled?: boolean;
}

export function PokemonSearch({ label, onSelect, exclude = [], disabled = false }: PokemonSearchProps) {
    const { t } = useLanguage()
    const species = useSpeciesList()
    const [query, setQuery] = useState('')
    const [active, setActive] = useState(0)
    const id = useId()

    const options = query.trim() && species?.status === 'success'
        ? searchSpecies(species.data, query)
            .filter(({ url }) => !exclude.includes(getSpeciesId(url)))
            .slice(0, MAX_OPTIONS)
        : []
    const activeIndex = Math.min(active, options.length - 1)

    const select = (option: Species) => {
        onSelect(getSpeciesId(option.url))
        setQuery('')
    }

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (!options.length) return
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            const step = event.key === 'ArrowDown' ? 1 : -1
            setActive((activeIndex + step + options.length) % options.length)
        } else if (event.key === 'Enter') {
            event.preventDefault()
            select(options[activeIndex])
        }
    }

    return (
        <div className="relative">
            <label htmlFor={id} className="sr-only">{label}</label>
            <input
                id={id}
                type="text"
                role="combobox"
                autoComplete="off"
                disabled={disabled}
                aria-expanded={options.length > 0}
                aria-controls={`${id}-list`}
                value={query}
                onChange={(event) => { setQuery(event.target.value); setActive(0) }}
                onKeyDown={onKeyDown}
                placeholder={t('guessPlaceholder')}
                className="w-full rounded-xl border-2 border-zinc-300 bg-white px-3 py-2 outline-none focus:border-red-600 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-950"
            />
            {options.length > 0 && (
                <ul id={`${id}-list`} role="listbox" className="absolute inset-x-0 top-full z-20 mt-1 rounded-xl bg-white p-1 shadow-2xl ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-700">
                    {options.map((option, index) => (
                        <li
                            key={option.url}
                            role="option"
                            aria-selected={index === activeIndex}
                            onMouseDown={(event) => event.preventDefault()}
                            onMouseEnter={() => setActive(index)}
                            onClick={() => select(option)}
                            className={`flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold ${index === activeIndex ? 'bg-red-600 text-white' : ''}`}
                        >
                            <Image src={getOfficialArtwork(getSpeciesId(option.url))} alt="" width={32} height={32} className="size-8 object-contain" />
                            {prettify(option.name)}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default function PokemonPicker({ value, onChange }: { value: number | null; onChange: (id: number | null) => void }) {
    const { t } = useLanguage()
    const getName = useSpeciesName()

    return (
        <div className="flex flex-col gap-2">
            <p className="text-sm font-bold">{t('favoritePokemon')}</p>
            <AnimatePresence mode="wait">
                {value && (
                    <motion.div
                        key={value}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center gap-3 rounded-2xl bg-zinc-100 p-2 dark:bg-zinc-800"
                    >
                        <Image src={getOfficialArtwork(value)} alt="" width={56} height={56} className="size-14 object-contain" />
                        <span className="flex-1 font-bold">{getName(value)}</span>
                        <button type="button" onClick={() => onChange(null)} className="rounded-lg px-2 py-1 text-sm font-bold text-red-600 hover:bg-zinc-200 dark:text-red-400 dark:hover:bg-zinc-700">
                            {t('remove')}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
            <PokemonSearch label={t('favoritePokemon')} onSelect={onChange} />
        </div>
    )
}
