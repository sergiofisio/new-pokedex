'use client'

import { useDeferredValue, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import PokemonCard from "../components/pokemonCard";
import PokedexModal from "../components/pokedexModal";
import SearchBar from "../components/searchBar";
import GenerationMenu, { GENERATIONS, getBackgroundSourceUrl } from "../components/generationMenu";
import { usePokedex } from "../context/pokedexContext";
import { useLanguage } from "../context/languageContext";
import { useAsyncData } from "../hooks/useAsyncData";
import { fetchAllSpecies, getSpeciesId, searchSpecies, type Species } from "../lib/pokeapi";

const ABOVE_THE_FOLD_CARDS = 12
const SEARCH_LIMIT = 60
const MAX_STAGGERED_CARDS = 20
const FADE_IN = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }

const loadAllSpecies = () => fetchAllSpecies()

export default function HomePage() {
    const [selectedGeneration, setSelectedGeneration] = useState(1)
    const [selectedSpeciesId, setSelectedSpeciesId] = useState<number | null>(null)
    const [query, setQuery] = useState('')
    const searchTerm = useDeferredValue(query).trim()
    const { generations, loadGeneration } = usePokedex()
    const allSpecies = useAsyncData('all-species', loadAllSpecies)
    const { t } = useLanguage()

    useEffect(()=>{
        loadGeneration(selectedGeneration)
    },[selectedGeneration, loadGeneration])

    const selectGeneration = (id: number) => {
        setSelectedGeneration(id)
        setQuery('')
    }

    const isSearching = searchTerm !== ''
    const generation = GENERATIONS.find(({ id }) => id === selectedGeneration)
    const result = generations[selectedGeneration]
    const matches = isSearching && allSpecies?.status === 'success' ? searchSpecies(allSpecies.data, searchTerm) : []

    const pokemonList: Species[] = isSearching
        ? matches.slice(0, SEARCH_LIMIT)
        : result?.status === 'success' ? result.pokemonList : []
    const navigationIds = pokemonList.map(({ url }) => getSpeciesId(url)).sort((a, b) => a - b)

    const title = isSearching
        ? t('searchResults', { query: searchTerm })
        : `${t('generation')} ${generation?.label} · ${generation?.region}`

    const status = isSearching
        ? !allSpecies ? 'loading'
            : allSpecies.status === 'error' ? 'error'
            : matches.length === 0 ? 'empty' : 'ready'
        : !result ? 'loading'
            : result.status === 'error' ? 'error' : 'ready'

  return (
    <div className="flex w-full flex-1 flex-col lg:flex-row">
        <GenerationMenu selected={isSearching ? 0 : selectedGeneration} onSelect={selectGeneration} />

        <section
            aria-labelledby="pokemon-list-title"
            aria-busy={status === 'loading'}
            className="relative isolate flex min-w-0 flex-1 flex-col"
        >
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-clip">
                <div className="sticky top-0 h-dvh w-full">
                    <AnimatePresence initial={false}>
                        {generation && (
                            <motion.div
                                key={generation.background.src}
                                initial={{ opacity: 0, scale: 1.08 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.9, ease: 'easeOut' }}
                                style={{ backgroundImage: `url("${generation.background.src}")` }}
                                className="absolute inset-0 bg-cover bg-center"
                            />
                        )}
                    </AnimatePresence>
                </div>
                <div className="absolute inset-0 bg-white/10 dark:bg-black/45" />
            </div>

            <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 bg-white/70 px-6 py-4 backdrop-blur-md dark:border-zinc-800 dark:bg-black/70">
                <div>
                    <h2 id="pokemon-list-title" className="text-xl font-black">
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.span
                                key={title}
                                initial={{ opacity: 0, y: -12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 12 }}
                                transition={{ duration: 0.2 }}
                                className="block"
                            >
                                {title}
                            </motion.span>
                        </AnimatePresence>
                    </h2>
                    {isSearching && status === 'ready' && (
                        <motion.p {...FADE_IN} role="status" className="text-xs text-zinc-500 dark:text-zinc-400">
                            {t('searchCount', { count: matches.length })}
                        </motion.p>
                    )}
                </div>
                <SearchBar value={query} onChange={setQuery} />
            </div>

            {status === 'loading' ? (
                <motion.p {...FADE_IN} role="status" className="m-6 w-fit rounded-xl bg-white/90 px-4 py-3 shadow-md dark:bg-zinc-900/90">{t('loading')}</motion.p>
            ) : status === 'error' ? (
                <motion.p {...FADE_IN} role="alert" className="m-6 w-fit rounded-xl bg-white/90 px-4 py-3 shadow-md dark:bg-zinc-900/90">{t(isSearching ? 'searchError' : 'loadError')}</motion.p>
            ) : status === 'empty' ? (
                <motion.p {...FADE_IN} role="status" className="m-6 w-fit rounded-xl bg-white/90 px-4 py-3 shadow-md dark:bg-zinc-900/90">{t('noResults', { query: searchTerm })}</motion.p>
            ) : (
                <>
                    <ul className="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-5 p-6">
                        <AnimatePresence mode="popLayout">
                            {pokemonList.map((pokemon, index)=>(
                                <motion.li
                                    key={pokemon.url}
                                    layout
                                    initial={{ opacity: 0, y: 24, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: Math.min(index, MAX_STAGGERED_CARDS) * 0.03 } }}
                                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                                    className="flex"
                                >
                                    <PokemonCard pokemon={pokemon} onSelect={setSelectedSpeciesId} eager={index < ABOVE_THE_FOLD_CARDS} />
                                </motion.li>
                            ))}
                        </AnimatePresence>
                    </ul>
                    {isSearching && matches.length > SEARCH_LIMIT && (
                        <motion.p {...FADE_IN} className="mx-auto mb-6 w-fit rounded-full bg-white/90 px-4 py-1.5 text-center text-sm text-zinc-700 shadow-md dark:bg-zinc-900/90 dark:text-zinc-300">
                            {t('searchLimited', { shown: SEARCH_LIMIT, count: matches.length })}
                        </motion.p>
                    )}
                </>
            )}

            {generation && (
                <p className="mt-auto mb-4 mr-6 self-end rounded-full bg-white/85 px-3 py-1 text-[11px] text-zinc-700 shadow dark:bg-zinc-900/85 dark:text-zinc-300">
                    <a
                        href={getBackgroundSourceUrl(generation.background.file)}
                        target="_blank"
                        rel="noreferrer"
                        className="underline-offset-2 hover:underline"
                    >
                        {t('backgroundCredit', { region: generation.region, author: generation.background.author, license: generation.background.license })}
                    </a>
                </p>
            )}
        </section>

        <PokedexModal
            speciesId={selectedSpeciesId}
            navigationIds={navigationIds}
            onClose={() => setSelectedSpeciesId(null)}
            onNavigate={setSelectedSpeciesId}
        />
    </div>
  );
}
