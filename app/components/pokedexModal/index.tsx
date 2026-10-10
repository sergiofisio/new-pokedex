'use client'

import { Fragment, useEffect, useEffectEvent, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";
import { useAsyncData } from "../../hooks/useAsyncData";
import { useTranslatedText } from "../../hooks/useTranslatedText";
import { prettify, type MessageKey } from "../../i18n/translations";
import {
    fetchLearnedMoves,
    fetchPokedexEntry,
    getSpeciesId,
    type ChainLink,
    type EvolutionDetail,
    type PokedexEntry,
    type PokemonData,
    type SpeciesDetail,
} from "../../lib/pokeapi";
import { getAllSprites, getItemSprite, getMainSprite, getSpeciesArtwork } from "../../lib/sprites";
import { TYPE_COLORS } from "../../lib/typeColors";
import { getCryUrls, type CrySource } from "../../lib/cries";
import { GENERATIONS } from "../generationMenu";
import { describeEvolution, getEvolutionMethods, getEvolutionStages } from "../../lib/evolution";

type Translate = ReturnType<typeof useLanguage>['t']
type Section = 'about' | 'abilities' | 'stats' | 'moves' | 'evolutions' | 'forms' | 'images'

const SECTIONS: { id: Section; label: MessageKey }[] = [
    { id: 'about', label: 'about' },
    { id: 'abilities', label: 'abilities' },
    { id: 'stats', label: 'stats' },
    { id: 'moves', label: 'moves' },
    { id: 'evolutions', label: 'evolutions' },
    { id: 'forms', label: 'forms' },
    { id: 'images', label: 'images' },
]

const loadEntry = (key: string) => fetchPokedexEntry(Number(key))

const isRasterPng = (url: string) => url.endsWith('.png')

interface PokedexModalProps {
    speciesId: number | null;
    navigationIds: number[];
    onClose: () => void;
    onNavigate: (speciesId: number) => void;
}

export default function PokedexModal({ speciesId, navigationIds, onClose, onNavigate }: PokedexModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const [section, setSection] = useState<Section>('about')

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return
        if (speciesId !== null && !dialog.open) dialog.showModal()
        if (speciesId === null && dialog.open) dialog.close()
    }, [speciesId])

    const handleClose = () => {
        setSection('about')
        onClose()
    }

    return (
        <dialog
            ref={dialogRef}
            onClose={handleClose}
            onClick={(event) => { if (event.target === event.currentTarget) event.currentTarget.close() }}
            aria-label="Pokédex"
            className="m-auto w-[96vw] max-w-6xl max-h-[96vh] overflow-y-auto bg-transparent p-0 backdrop:bg-black/75 md:h-[min(90vh,760px)] md:overflow-hidden"
        >
            {speciesId !== null && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.85, y: 40, rotateX: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                    className="md:h-full perspective-distant"
                >
                    <PokedexDevice
                        key={speciesId}
                        speciesId={speciesId}
                        section={section}
                        onSectionChange={setSection}
                        previousId={navigationIds.findLast((id) => id < speciesId)}
                        nextId={navigationIds.find((id) => id > speciesId)}
                        onNavigate={onNavigate}
                        onClose={() => dialogRef.current?.close()}
                    />
                </motion.div>
            )}
        </dialog>
    )
}

interface PokedexDeviceProps {
    speciesId: number;
    section: Section;
    onSectionChange: (section: Section) => void;
    previousId?: number;
    nextId?: number;
    onNavigate: (speciesId: number) => void;
    onClose: () => void;
}

function PokedexDevice({ speciesId, section, onSectionChange, previousId, nextId, onNavigate, onClose }: PokedexDeviceProps) {
    const { t, typeName } = useLanguage()
    const entry = useAsyncData(String(speciesId), loadEntry)
    const [varietyName, setVarietyName] = useState<string | null>(null)
    const [shiny, setShiny] = useState(false)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [crySource, setCrySource] = useState<CrySource>('modern')

    const data = entry?.status === 'success' ? entry.data : null
    const pokemon = data
        ? data.varieties.find(({ name }) => name === varietyName)
            ?? data.varieties.find(({ is_default }) => is_default)
            ?? data.varieties[0]
        : undefined

    const hasShiny = pokemon ? Boolean(getMainSprite(pokemon, true)) : false
    const showShiny = shiny && hasShiny
    const mainImage = pokemon ? selectedImage ?? getMainSprite(pokemon, showShiny) : undefined
    const mainType = pokemon?.types[0]?.type.name ?? ''
    const statusMessage = !entry ? t('loadingEntry') : !pokemon ? t('entryError') : null

    const toggleShiny = (value: boolean) => {
        setShiny(value)
        setSelectedImage(null)
    }

    const selectVariety = (name: string) => {
        setVarietyName(name)
        setSelectedImage(null)
    }

    return (
        <div className="flex flex-col gap-2 md:h-full md:flex-row md:gap-0">
            <div className="relative flex shrink-0 flex-col overflow-hidden rounded-3xl border-4 border-red-950 bg-red-600 text-white shadow-2xl md:w-[46%] md:rounded-r-lg">
                <div className="relative h-24 shrink-0">
                    <div className="absolute inset-0 bg-red-700 [clip-path:polygon(0_0,100%_0,100%_55%,62%_55%,50%_100%,0_100%)]" />
                    <div className="absolute inset-0 border-b-4 border-red-950 [clip-path:polygon(0_0,100%_0,100%_55%,62%_55%,50%_100%,0_100%)]" />
                    <div aria-hidden="true" className="relative flex items-start gap-3 p-4">
                        <span className="size-14 rounded-full border-4 border-white bg-sky-400 shadow-[inset_-6px_-6px_0_rgba(0,0,0,0.25),inset_6px_6px_0_rgba(255,255,255,0.4)] ring-4 ring-red-950" />
                        <span className="size-4 rounded-full border-2 border-red-950 bg-red-500" />
                        <span className="size-4 rounded-full border-2 border-red-950 bg-yellow-300" />
                        <span className="size-4 rounded-full border-2 border-red-950 bg-green-500" />
                    </div>
                </div>

                <div className="flex min-h-0 flex-1 flex-col px-6 pb-3 pt-4 md:px-10">
                    <div className="flex min-h-0 flex-1 flex-col rounded-lg rounded-bl-[2.5rem] border-4 border-red-950 bg-zinc-100 p-3 pb-6 text-black">
                        <div aria-hidden="true" className="mb-2 flex justify-center gap-3">
                            <span className="size-2 rounded-full bg-red-600" />
                            <span className="size-2 rounded-full bg-red-600" />
                        </div>
                        <div className={`relative flex aspect-square min-h-0 flex-1 items-center justify-center overflow-hidden rounded-md border-4 border-zinc-800 bg-white md:aspect-auto`}>
                            <div className={`absolute inset-0 ${TYPE_COLORS[mainType]?.image ?? 'bg-zinc-200'}`} />
                            <AnimatePresence mode="wait">
                                {mainImage ? (
                                    <motion.div
                                        key={mainImage}
                                        initial={{ opacity: 0, scale: 0.6, y: 30 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                                        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                                        className="relative size-full"
                                    >
                                        <motion.div
                                            animate={{ y: [0, -6, 0] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                            className="size-full"
                                        >
                                            <Image
                                                src={mainImage}
                                                alt={t('illustrationOf', { name: pokemon?.name ?? '' })}
                                                width={400}
                                                height={400}
                                                unoptimized={!isRasterPng(mainImage)}
                                                className="size-full object-contain p-2 drop-shadow-xl drop-shadow-black/40"
                                            />
                                        </motion.div>
                                    </motion.div>
                                ) : (
                                    <motion.p
                                        key="status"
                                        role="status"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: [0.4, 1, 0.4] }}
                                        transition={{ duration: 1.4, repeat: Infinity }}
                                        className="relative font-mono text-sm"
                                    >
                                        {statusMessage}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>
                        {pokemon && (
                            <ul aria-label={t('types')} className="mt-2 flex justify-center gap-2">
                                {pokemon.types.map(({ type }, index) => (
                                    <motion.li
                                        key={type.name}
                                        initial={{ opacity: 0, scale: 0, y: 8 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={{ delay: 0.2 + index * 0.1, type: 'spring', stiffness: 400, damping: 15 }}
                                        className={`${TYPE_COLORS[type.name]?.card ?? ''} ${TYPE_COLORS[type.name]?.text ?? ''} rounded-md px-2 py-0.5 text-[10px] font-black uppercase`}
                                    >
                                        {typeName(type.name)}
                                    </motion.li>
                                ))}
                            </ul>
                        )}
                        {data && (
                            <Link href={`/pokemon/${data.species.name}`} className="mt-2 self-center text-xs font-black text-red-700 underline underline-offset-2 hover:text-red-900">
                                {t('viewFullPage')} →
                            </Link>
                        )}
                    </div>
                </div>

                <div className="grid shrink-0 grid-cols-[auto_1fr_auto] items-center gap-4 px-6 pb-6 md:px-10">
                    <div className="flex flex-col items-center gap-2">
                        <CryButton pokemon={pokemon} source={crySource} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <div role="group" aria-label={`${t('normal')} / ${t('shiny')}`} className="flex gap-2">
                            <PillButton color="bg-red-500" pressed={!showShiny} onClick={() => toggleShiny(false)} label={t('normal')} />
                            <PillButton color="bg-sky-500" pressed={showShiny} disabled={!hasShiny} onClick={() => toggleShiny(true)} label={`✨ ${t('shiny')}`} />
                        </div>
                        <div className="rounded-md border-4 border-red-950 bg-green-400 px-2 py-1 font-mono text-green-950 shadow-inner">
                            {data && pokemon ? (
                                <motion.div key={pokemon.name} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
                                    <p className="text-[10px] font-bold">#{String(data.species.id).padStart(4, '0')}</p>
                                    <h2 className="truncate text-sm font-black uppercase">{pokemon.name}</h2>
                                </motion.div>
                            ) : (
                                <p className="text-xs">...</p>
                            )}
                        </div>
                    </div>

                    <DirectionalPad
                        onPrevious={previousId !== undefined ? () => onNavigate(previousId) : undefined}
                        onNext={nextId !== undefined ? () => onNavigate(nextId) : undefined}
                    />
                </div>
            </div>

            <div aria-hidden="true" className="hidden w-5 shrink-0 flex-col py-10 md:flex">
                <div className="h-6 rounded-t-md border-2 border-red-950 bg-red-700" />
                <div className="flex-1 border-x-2 border-red-950 bg-linear-to-r from-red-700 via-orange-400 to-red-700" />
                <div className="h-6 rounded-b-md border-2 border-red-950 bg-red-700" />
            </div>

            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 rounded-3xl border-4 border-red-950 bg-red-600 p-5 text-white shadow-2xl md:rounded-l-lg md:pt-14">
                <div
                    id="pokedex-screen"
                    aria-live="polite"
                    className="max-h-[55vh] min-h-48 flex-1 overflow-y-auto rounded-lg border-4 border-red-950 bg-zinc-900 p-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] md:max-h-none md:min-h-0"
                >
                    {data && pokemon ? (
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={section}
                                initial={{ opacity: 0, x: 24 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -24, transition: { duration: 0.12 } }}
                                transition={{ duration: 0.22, ease: 'easeOut' }}
                            >
                                <SectionContent
                                    section={section}
                                    data={data}
                                    pokemon={pokemon}
                                    showShiny={showShiny}
                                    mainImage={mainImage}
                                    onSelectImage={setSelectedImage}
                                    onSelectVariety={selectVariety}
                                    onNavigate={onNavigate}
                                />
                            </motion.div>
                        </AnimatePresence>
                    ) : (
                        <p role="status" className="font-mono text-sm text-green-300">{statusMessage}</p>
                    )}
                </div>

                <div role="group" aria-label={t('sections')} className="grid shrink-0 grid-cols-4 gap-2">
                    {SECTIONS.map(({ id, label }) => {
                        const disabled = id === 'forms' && (data?.varieties.length ?? 0) < 2
                        return (
                            <motion.button
                                key={id}
                                type="button"
                                aria-pressed={section === id}
                                aria-controls="pokedex-screen"
                                disabled={disabled}
                                onClick={() => onSectionChange(id)}
                                whileHover={disabled ? undefined : { y: -2 }}
                                whileTap={disabled ? undefined : { scale: 0.92, y: 1 }}
                                className={`relative h-12 overflow-hidden rounded-md border-2 border-sky-950 text-xs font-black uppercase text-sky-950 shadow-[inset_-3px_-3px_0_rgba(0,0,0,0.2)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-40 before:absolute before:left-1.5 before:top-1.5 before:h-1.5 before:w-3 before:rotate-[-30deg] before:rounded-full before:bg-white/70 before:content-[''] ${section === id ? 'bg-sky-200' : 'bg-sky-400 hover:bg-sky-300'}`}
                            >
                                {t(label)}
                            </motion.button>
                        )
                    })}
                </div>

                <div className="flex shrink-0 items-center justify-between gap-3">
                    <div role="group" aria-label={t('crySource')} className="flex gap-2">
                        {CRY_SOURCES.map(({ id, label }) => (
                            <button
                                key={id}
                                type="button"
                                aria-pressed={crySource === id}
                                disabled={id === 'classic' && !pokemon?.cries?.legacy}
                                onClick={() => setCrySource(id)}
                                className={`h-8 min-w-10 rounded-md border-2 border-red-950 px-1 text-[9px] font-black uppercase text-zinc-700 shadow-[inset_-3px_-3px_0_rgba(0,0,0,0.2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-40 ${crySource === id ? 'bg-white ring-2 ring-white' : 'bg-zinc-300 hover:bg-zinc-200'}`}
                            >
                                {t(label)}
                            </button>
                        ))}
                    </div>
                    <div aria-hidden="true" className="flex flex-1 flex-col gap-2">
                        <span className="h-3 rounded-full bg-red-950/80" />
                        <span className="h-3 rounded-full bg-red-950/80" />
                    </div>
                    <motion.button
                        type="button"
                        onClick={onClose}
                        aria-label={t('close')}
                        title={t('close')}
                        whileHover={{ rotate: 90, scale: 1.08 }}
                        whileTap={{ scale: 0.85 }}
                        className="flex size-12 items-center justify-center rounded-full border-4 border-red-950 bg-yellow-300 text-lg font-black text-red-950 shadow-[inset_-4px_-4px_0_rgba(0,0,0,0.2)] hover:bg-yellow-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                        ✕
                    </motion.button>
                </div>
            </div>
        </div>
    )
}

interface SectionContentProps {
    section: Section;
    data: PokedexEntry;
    pokemon: PokemonData;
    showShiny: boolean;
    mainImage: string | undefined;
    onSelectImage: (url: string) => void;
    onSelectVariety: (name: string) => void;
    onNavigate: (id: number) => void;
}

function SectionContent({ section, data, pokemon, showShiny, mainImage, onSelectImage, onSelectVariety, onNavigate }: SectionContentProps) {
    const { t, statName } = useLanguage()
    const { species, chain, varieties } = data
    const title = t(SECTIONS.find(({ id }) => id === section)?.label ?? 'about')

    return (
        <section aria-label={title} className="text-white">
            <h3 className="mb-3 font-mono text-sm font-bold uppercase tracking-widest text-green-300">{title}</h3>

            {section === 'about' && (
                <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2">
                        {species.is_legendary && <Badge className="bg-amber-400 text-black">{t('legendary')}</Badge>}
                        {species.is_mythical && <Badge className="bg-fuchsia-500 text-white">{t('mythical')}</Badge>}
                        {species.is_baby && <Badge className="bg-pink-300 text-black">{t('baby')}</Badge>}
                    </div>
                    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <TranslatedInfoItem label={t('category')} value={getGenus(species)} />
                        <InfoItem label={t('height')} value={`${(pokemon.height / 10).toFixed(1)} m`} />
                        <InfoItem label={t('weight')} value={`${(pokemon.weight / 10).toFixed(1)} kg`} />
                        <InfoItem label={t('captureRate')} value={String(species.capture_rate)} />
                    </dl>
                    <Description text={getFlavorText(species)} />
                </div>
            )}

            {section === 'abilities' && (
                <ul className="flex flex-col gap-2">
                    {pokemon.abilities.map(({ ability, is_hidden }, index) => (
                        <motion.li
                            key={ability.name}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                            className="rounded-lg bg-zinc-800 px-3 py-2 text-sm"
                        >
                            {prettify(ability.name)}
                            {is_hidden && <span className="ml-2 text-xs text-green-300">({t('hiddenAbility')})</span>}
                        </motion.li>
                    ))}
                </ul>
            )}

            {section === 'stats' && (
                <dl className="flex flex-col gap-2">
                    {pokemon.stats.map(({ stat, base_stat }, index) => (
                        <motion.div
                            key={stat.name}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="grid grid-cols-[6.5rem_2.5rem_1fr] items-center gap-2 text-sm"
                        >
                            <dt>{statName(stat.name)}</dt>
                            <dd className="text-right font-mono font-bold">{base_stat}</dd>
                            <dd aria-hidden="true" className="h-2.5 overflow-hidden rounded-full bg-zinc-800">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, (base_stat / 255) * 100)}%` }}
                                    transition={{ delay: 0.15 + index * 0.07, duration: 0.8, ease: 'easeOut' }}
                                    className={`h-full rounded-full ${getStatColor(base_stat)}`}
                                />
                            </dd>
                        </motion.div>
                    ))}
                    <div className="grid grid-cols-[6.5rem_2.5rem_1fr] gap-2 border-t border-zinc-700 pt-2 text-sm">
                        <dt className="font-bold">{t('total')}</dt>
                        <dd className="text-right font-mono font-bold">
                            {pokemon.stats.reduce((sum, { base_stat }) => sum + base_stat, 0)}
                        </dd>
                    </div>
                </dl>
            )}

            {section === 'evolutions' && (
                chain.evolves_to.length === 0 ? (
                    <p className="text-sm">{t('noEvolution')}</p>
                ) : (
                    <EvolutionChainView chain={chain} currentSpeciesId={species.id} onNavigate={onNavigate} />
                )
            )}

            {section === 'forms' && (
                <ul className="flex flex-wrap gap-2">
                    {varieties.map((variety, index) => {
                        const sprite = getMainSprite(variety)
                        const isSelected = variety.name === pokemon.name
                        return (
                            <motion.li
                                key={variety.name}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.06 }}
                            >
                                <motion.button
                                    type="button"
                                    aria-pressed={isSelected}
                                    onClick={() => onSelectVariety(variety.name)}
                                    whileHover={{ y: -4 }}
                                    whileTap={{ scale: 0.94 }}
                                    className={`flex w-28 flex-col items-center rounded-xl border-2 p-2 text-xs font-bold ${isSelected ? 'border-green-300 bg-zinc-700' : 'border-transparent bg-zinc-800 hover:bg-zinc-700'}`}
                                >
                                    {sprite && (
                                        <Image src={sprite} alt="" width={80} height={80} unoptimized={!isRasterPng(sprite)} className="size-20 object-contain" />
                                    )}
                                    {getFormLabel(variety, species, t)}
                                </motion.button>
                            </motion.li>
                        )
                    })}
                </ul>
            )}

            {section === 'moves' && <MovesSection pokemonName={pokemon.name} />}

            {section === 'images' && (
                <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
                    {getAllSprites(pokemon)
                        .filter(({ label }) => label.includes('shiny') === showShiny)
                        .map(({ label, url }, index) => (
                            <motion.li
                                key={url}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: Math.min(index, 15) * 0.03 }}
                            >
                                <motion.button
                                    type="button"
                                    title={label}
                                    aria-label={label}
                                    aria-pressed={url === mainImage}
                                    onClick={() => onSelectImage(url)}
                                    whileHover={{ scale: 1.08 }}
                                    whileTap={{ scale: 0.92 }}
                                    className={`aspect-square w-full rounded-lg p-1 ${url === mainImage ? 'bg-zinc-600 ring-2 ring-green-300' : 'bg-zinc-800 hover:bg-zinc-700'}`}
                                >
                                    <Image src={url} alt="" width={96} height={96} unoptimized loading="lazy" className="size-full object-contain" />
                                </motion.button>
                            </motion.li>
                        ))}
                </ul>
            )}
        </section>
    )
}

const LEARN_METHODS: { id: string; label: MessageKey }[] = [
    { id: 'level-up', label: 'methodLevelUp' },
    { id: 'machine', label: 'methodMachine' },
    { id: 'egg', label: 'methodEgg' },
    { id: 'tutor', label: 'methodTutor' },
]

const DAMAGE_CLASS_LABELS: Record<string, MessageKey> = {
    physical: 'physical',
    special: 'special',
    status: 'statusMove',
}

function MovesSection({ pokemonName }: { pokemonName: string }) {
    const { t, typeName } = useLanguage()
    const moves = useAsyncData(pokemonName, fetchLearnedMoves)
    const [method, setMethod] = useState('level-up')

    if (!moves) return <p role="status" className="font-mono text-sm text-green-300">{t('loadingMoves')}</p>
    if (moves.status === 'error') return <p role="alert" className="text-sm">{t('movesError')}</p>

    const filtered = moves.data
        .filter((learned) => learned.method === method)
        .sort((a, b) => a.level - b.level || a.move.name.localeCompare(b.move.name))

    return (
        <div className="flex flex-col gap-3">
            <div role="group" aria-label={t('learnMethod')} className="flex flex-wrap gap-1">
                {LEARN_METHODS.map(({ id, label }) => {
                    const count = moves.data.filter((learned) => learned.method === id).length
                    return (
                        <button
                            key={id}
                            type="button"
                            aria-pressed={method === id}
                            onClick={() => setMethod(id)}
                            className={`rounded-md px-2 py-1 text-xs font-bold ${method === id ? 'bg-green-300 text-zinc-900' : 'bg-zinc-800 text-green-300 hover:bg-zinc-700'}`}
                        >
                            {t(label)} ({count})
                        </button>
                    )
                })}
            </div>

            {filtered.length === 0 ? (
                <p className="text-sm">{t('noMoves')}</p>
            ) : (
                <table className="w-full table-fixed text-left text-xs">
                    <thead className="text-[10px] uppercase text-zinc-400">
                        <tr>
                            {method === 'level-up' && <th scope="col" className="w-9 pb-1">{t('levelShort')}</th>}
                            <th scope="col" className="pb-1">{t('move')}</th>
                            <th scope="col" className="w-20 pb-1">{t('type')}</th>
                            <th scope="col" className="w-16 pb-1">{t('damageClass')}</th>
                            <th scope="col" className="w-10 pb-1 text-right">{t('power')}</th>
                            <th scope="col" className="w-11 pb-1 text-right">{t('accuracy')}</th>
                            <th scope="col" className="w-8 pb-1 text-right">PP</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(({ move, level }) => (
                            <tr key={move.name} className="border-t border-zinc-800">
                                {method === 'level-up' && <td className="py-1 font-mono">{level || '—'}</td>}
                                <th scope="row" className="truncate py-1 font-bold" title={prettify(move.name)}>{prettify(move.name)}</th>
                                <td className="py-1">
                                    <span className={`${TYPE_COLORS[move.type.name]?.card ?? 'bg-zinc-600'} ${TYPE_COLORS[move.type.name]?.text ?? ''} block truncate rounded px-1 text-center text-[10px] font-black uppercase`}>
                                        {typeName(move.type.name)}
                                    </span>
                                </td>
                                <td className="truncate py-1">{t(DAMAGE_CLASS_LABELS[move.damage_class.name] ?? 'statusMove')}</td>
                                <td className="py-1 text-right font-mono">{move.power ?? '—'}</td>
                                <td className="py-1 text-right font-mono">{move.accuracy ? `${move.accuracy}%` : '—'}</td>
                                <td className="py-1 text-right font-mono">{move.pp ?? '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}

const CRY_SOURCES: { id: CrySource; label: MessageKey }[] = [
    { id: 'modern', label: 'cryModern' },
    { id: 'classic', label: 'cryClassic' },
]

function CryButton({ pokemon, source }: { pokemon: PokemonData | undefined; source: CrySource }) {
    const { t } = useLanguage()
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const [playing, setPlaying] = useState(false)
    const urls = pokemon ? getCryUrls(pokemon, source) : []

    useEffect(() => () => audioRef.current?.pause(), [])

    const playFrom = (index: number) => {
        const url = urls[index]
        if (!url) return
        const audio = new Audio(url)
        audio.volume = 0.5
        audio.onplaying = () => setPlaying(true)
        audio.onended = () => setPlaying(false)
        audio.onpause = () => setPlaying(false)
        audio.onerror = () => { if (audioRef.current === audio) playFrom(index + 1) }
        audioRef.current = audio
        audio.play().catch(() => { if (audioRef.current === audio) playFrom(index + 1) })
    }

    const play = () => {
        audioRef.current?.pause()
        playFrom(0)
    }

    const pokemonName = pokemon?.name
    const autoPlay = useEffectEvent(play)

    useEffect(() => {
        if (pokemonName) autoPlay()
    }, [pokemonName])

    return (
        <motion.button
            type="button"
            onClick={play}
            disabled={urls.length === 0}
            aria-label={t('playCry', { name: pokemon?.name ?? '' })}
            title={t('playCry', { name: pokemon?.name ?? '' })}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.85 }}
            animate={playing ? { scale: [1, 1.15, 1] } : { scale: 1 }}
            transition={playing ? { duration: 0.6, repeat: Infinity } : undefined}
            className={`flex size-10 items-center justify-center rounded-full border-4 border-red-950 bg-zinc-800 text-sm text-zinc-300 shadow-[inset_-3px_-3px_0_rgba(0,0,0,0.4)] hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60 ${playing ? 'bg-zinc-600 ring-2 ring-green-400' : ''}`}
        >
            <span aria-hidden="true">🔊</span>
        </motion.button>
    )
}

function PillButton({ color, pressed, disabled, onClick, label }: { color: string; pressed: boolean; disabled?: boolean; onClick: () => void; label: string }) {
    return (
        <motion.button
            type="button"
            aria-pressed={pressed}
            disabled={disabled}
            onClick={onClick}
            whileTap={disabled ? undefined : { scale: 0.9 }}
            animate={{ scale: pressed ? 1.04 : 1 }}
            className={`flex-1 rounded-full border-2 border-red-950 px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.25)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-40 ${color} ${pressed ? 'ring-2 ring-white' : ''}`}
        >
            {label}
        </motion.button>
    )
}

function DirectionalPad({ onPrevious, onNext }: { onPrevious?: () => void; onNext?: () => void }) {
    const { t } = useLanguage()
    const arm = 'size-7 bg-zinc-900'

    return (
        <div className="grid grid-cols-3 grid-rows-3">
            <span aria-hidden="true" />
            <span aria-hidden="true" className={`${arm} rounded-t-md`} />
            <span aria-hidden="true" />
            <motion.button
                type="button"
                onClick={onPrevious}
                disabled={!onPrevious}
                aria-label={t('previous')}
                whileTap={onPrevious ? { x: -3, scale: 0.9 } : undefined}
                className={`${arm} rounded-l-md text-[10px] text-zinc-400 hover:text-white disabled:opacity-60`}
            >
                ◀
            </motion.button>
            <span aria-hidden="true" className={arm} />
            <motion.button
                type="button"
                onClick={onNext}
                disabled={!onNext}
                aria-label={t('next')}
                whileTap={onNext ? { x: 3, scale: 0.9 } : undefined}
                className={`${arm} rounded-r-md text-[10px] text-zinc-400 hover:text-white disabled:opacity-60`}
            >
                ▶
            </motion.button>
            <span aria-hidden="true" />
            <span aria-hidden="true" className={`${arm} rounded-b-md`} />
            <span aria-hidden="true" />
        </div>
    )
}

const MANY_EVOLUTIONS = 3

interface EvolutionChainViewProps {
    chain: ChainLink;
    currentSpeciesId: number;
    onNavigate: (id: number) => void;
}

function EvolutionChainView({ chain, currentSpeciesId, onNavigate }: EvolutionChainViewProps) {
    const stages = getEvolutionStages(chain)
    const columns = stages
        .map((stage) => stage.length > MANY_EVOLUTIONS ? 'minmax(0,3fr)' : 'minmax(0,1fr)')
        .join(' ')

    return (
        <ol className="grid items-center gap-2" style={{ gridTemplateColumns: columns }}>
            {stages.map((stage, stageIndex) => {
                const isMany = stage.length > MANY_EVOLUTIONS
                return (
                    <li
                        key={stage.map(({ species }) => species.name).join()}
                        className={isMany ? 'grid grid-cols-2 gap-2 sm:grid-cols-4' : 'flex flex-col justify-center gap-2'}
                    >
                        {stage.map((link, linkIndex) => (
                            <motion.div
                                key={link.species.name}
                                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                transition={{ delay: stageIndex * 0.25 + linkIndex * 0.06 }}
                                className={`flex min-w-0 items-center gap-1 ${isMany ? 'flex-col' : ''}`}
                            >
                                {stageIndex > 0 && (
                                    <EvolutionStep details={link.evolution_details} target={link} wide={isMany} onNavigate={onNavigate} />
                                )}
                                <EvolutionNode link={link} currentSpeciesId={currentSpeciesId} onNavigate={onNavigate} />
                            </motion.div>
                        ))}
                    </li>
                )
            })}
        </ol>
    )
}

interface EvolutionNodeProps {
    link: ChainLink;
    currentSpeciesId: number;
    onNavigate: (id: number) => void;
}

function EvolutionNode({ link, currentSpeciesId, onNavigate }: EvolutionNodeProps) {
    const { t } = useLanguage()
    const id = getSpeciesId(link.species.url)
    const isCurrent = id === currentSpeciesId

    return (
        <motion.button
            type="button"
            onClick={() => onNavigate(id)}
            aria-current={isCurrent ? 'true' : undefined}
            aria-label={t('viewPokemon', { name: link.species.name })}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.92 }}
            className={`flex w-full min-w-0 flex-1 flex-col items-center rounded-xl border-2 p-1.5 ${isCurrent ? 'border-green-300 bg-zinc-700' : 'border-transparent bg-zinc-800 hover:bg-zinc-700'}`}
        >
            <Image src={getSpeciesArtwork(id)} alt="" width={80} height={80} className="aspect-square w-full max-w-16 object-contain" />
            <span className="w-full truncate text-center text-[10px] font-bold uppercase">{link.species.name}</span>
            {link.is_baby && <Badge className="mt-1 bg-pink-300 text-black">{t('baby')}</Badge>}
        </motion.button>
    )
}

const romanGeneration = (id: number) => GENERATIONS.find((generation) => generation.id === id)?.label ?? String(id)

function formatGenerations(generations: number[], latest: number) {
    if (generations.length === 0) return null
    const first = Math.min(...generations)
    const last = Math.max(...generations)
    if (last === latest) return `Gen ${romanGeneration(first)}+`
    if (first === last) return `Gen ${romanGeneration(first)}`
    return `Gen ${romanGeneration(first)}–${romanGeneration(last)}`
}

interface EvolutionStepProps {
    details: EvolutionDetail[];
    target: ChainLink;
    wide: boolean;
    onNavigate: (id: number) => void;
}

function EvolutionStep({ details, target, wide, onNavigate }: EvolutionStepProps) {
    const { t, itemName, typeName } = useLanguage()
    const methods = getEvolutionMethods(details, (detail) => describeEvolution(detail, t, itemName, typeName))
    const latest = Math.max(0, ...methods.flatMap(({ generations }) => generations))
    const primary = methods[0]?.detail
    const item = primary?.item ?? primary?.held_item
    const targetId = getSpeciesId(target.species.url)

    return (
        <div className={`flex shrink-0 flex-col items-center gap-0.5 text-center text-[10px] leading-tight ${wide ? 'w-full' : 'w-14'}`}>
            {item && (
                <motion.button
                    type="button"
                    onClick={() => onNavigate(targetId)}
                    aria-label={t('showEvolution', { item: itemName(item.name), name: target.species.name })}
                    title={itemName(item.name)}
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                    whileHover={{ scale: 1.25, rotate: 15 }}
                    whileTap={{ scale: 0.9 }}
                    className="rounded-full bg-amber-100 p-0.5 ring-2 ring-amber-400 hover:bg-amber-200"
                >
                    <Image src={getItemSprite(item.name)} alt="" width={30} height={30} className="size-6 object-contain [image-rendering:pixelated]" />
                </motion.button>
            )}
            <span aria-hidden="true" className="text-base leading-none text-green-300">→</span>
            {methods.map((method, index) => (
                <Fragment key={method.text}>
                    {index > 0 && <span className="text-[9px] uppercase text-zinc-500">{t('evolutionOr')}</span>}
                    <span className="wrap-break-word">
                        {method.text}
                        {methods.length > 1 && (
                            <span className="block text-[9px] font-bold text-green-300/80">
                                {formatGenerations(method.generations, latest)}
                            </span>
                        )}
                    </span>
                </Fragment>
            ))}
        </div>
    )
}

function getGenus(species: SpeciesDetail) {
    return species.genera.find(({ language }) => language.name === 'en')?.genus ?? '-'
}

function getFlavorText(species: SpeciesDetail) {
    const entry = species.flavor_text_entries.findLast(({ language }) => language.name === 'en')
    return entry?.flavor_text.replace(/[\f\n\r]+/g, ' ') ?? ''
}

function getFormLabel(variety: PokemonData, species: SpeciesDetail, t: Translate) {
    if (variety.is_default) return t('defaultForm')
    const suffix = variety.name.startsWith(`${species.name}-`) ? variety.name.slice(species.name.length + 1) : variety.name
    return prettify(suffix.replace('gmax', 'gigantamax'))
}

function getStatColor(value: number) {
    if (value < 60) return 'bg-red-500'
    if (value < 90) return 'bg-yellow-400'
    if (value < 120) return 'bg-green-500'
    return 'bg-sky-500'
}

function Badge({ children, className = '' }: { children: ReactNode; className?: string }) {
    return <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${className}`}>{children}</span>
}

function Description({ text }: { text: string }) {
    const { t, language } = useLanguage()
    const description = useTranslatedText(text)

    return (
        <div>
            <h4 className="text-xs font-bold uppercase text-zinc-400">{t('description')}</h4>
            <p lang={description.translated ? 'pt-BR' : 'en'} className="text-sm leading-relaxed">{description.text}</p>
            {language === 'pt' && (
                <p className="mt-1 text-xs text-zinc-500">
                    {t(description.translated ? 'descriptionTranslated' : 'descriptionOnlyEnglish')}
                </p>
            )}
        </div>
    )
}

function TranslatedInfoItem({ label, value }: { label: string; value: string }) {
    const translated = useTranslatedText(value)
    return <InfoItem label={label} value={translated.text} />
}

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg bg-zinc-800 p-2">
            <dt className="text-[10px] uppercase text-zinc-400">{label}</dt>
            <dd className="text-sm font-bold">{value}</dd>
        </div>
    )
}
