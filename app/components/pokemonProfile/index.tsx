'use client'

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";
import { describeEvolution, getEvolutionMethods, getEvolutionStages } from "../../lib/evolution";
import { getSpeciesId } from "../../lib/pokeapi";
import type { PokemonProfile } from "../../lib/pokemonServer";
import {
    REGIONS,
    describePokemon,
    eggGroupLabel,
    formatHeight,
    formatWeight,
    genderSplit,
    growthLabel,
    statLabel,
    statTotal,
    typeLabel,
} from "../../lib/pokemonText";
import { getDefensiveMatchups } from "../../lib/typeChart";
import { getSpeciesArtwork } from "../../lib/sprites";
import { TYPE_COLORS } from "../../lib/typeColors";
import { prettify, type Language } from "../../i18n/translations";

const LABELS = {
    pt: {
        back: 'Pokédex', about: 'Sobre', stats: 'Atributos base', total: 'Total', matchups: 'Fraquezas e resistências',
        x4: 'Dano 4×', x2: 'Dano 2×', half: 'Dano ½×', quarter: 'Dano ¼×', immune: 'Imune', evolution: 'Evolução',
        training: 'Habilidades, captura e criação', abilities: 'Habilidades', hiddenAbility: 'oculta', height: 'Altura',
        weight: 'Peso', generation: 'Geração', region: 'Região', captureRate: 'Taxa de captura', gender: 'Gênero',
        genderless: 'Sem gênero', eggGroups: 'Grupos de ovos', growth: 'Crescimento', happiness: 'Amizade inicial',
        hatch: 'Ciclos de ovo', moves: 'Golpes que aprende', forms: 'Outras formas', previous: 'Anterior', next: 'Próximo',
        play: 'Teste o que você sabe', playText: 'Reconheça este e outros Pokémon pela silhueta, pelo grito ou pela descrição nos desafios diários.',
        playButton: 'Jogar desafios', typeChart: 'Ver a tabela de tipos completa', none: 'Nenhuma', team: 'Dicas para a equipe',
    },
    en: {
        back: 'Pokédex', about: 'About', stats: 'Base stats', total: 'Total', matchups: 'Weaknesses and resistances',
        x4: '4× damage', x2: '2× damage', half: '½× damage', quarter: '¼× damage', immune: 'Immune', evolution: 'Evolution',
        training: 'Abilities, catching and breeding', abilities: 'Abilities', hiddenAbility: 'hidden', height: 'Height',
        weight: 'Weight', generation: 'Generation', region: 'Region', captureRate: 'Catch rate', gender: 'Gender',
        genderless: 'Genderless', eggGroups: 'Egg groups', growth: 'Growth rate', happiness: 'Base friendship',
        hatch: 'Egg cycles', moves: 'Learnable moves', forms: 'Other forms', previous: 'Previous', next: 'Next',
        play: 'Test your knowledge', playText: 'Recognize this and other Pokémon by silhouette, cry or description in the daily challenges.',
        playButton: 'Play challenges', typeChart: 'See the full type chart', none: 'None', team: 'Team tips',
    },
} satisfies Record<Language, Record<string, string>>

const STAT_MAX = 255
const statColor = (value: number) => value < 60 ? 'bg-red-500' : value < 90 ? 'bg-yellow-400' : value < 120 ? 'bg-green-500' : 'bg-sky-500'

function TypeBadge({ type, language }: { type: string; language: Language }) {
    const colors = TYPE_COLORS[type] ?? TYPE_COLORS.normal
    return (
        <Link href={`/guias/tabela-de-tipos#${type}`} className={`rounded-full px-3 py-1 text-xs font-black uppercase ${colors.card} ${colors.text}`}>
            {typeLabel(type, language)}
        </Link>
    )
}

function Section({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay }}
            className="flex flex-col gap-3 rounded-3xl bg-white/90 p-6 shadow-lg dark:bg-zinc-900/90"
        >
            <h2 className="text-xl font-black">{title}</h2>
            {children}
        </motion.section>
    )
}

export default function PokemonProfileView({ profile }: { profile: PokemonProfile }) {
    const { language, t, itemName, typeName } = useLanguage()
    const L = LABELS[language]
    const text = describePokemon(profile, language)
    const matchups = getDefensiveMatchups(profile.types)
    const gender = genderSplit(profile.genderRate)
    const stages = getEvolutionStages(profile.chain)
    const main = TYPE_COLORS[profile.types[0]] ?? TYPE_COLORS.normal

    const facts: [string, string][] = [
        [L.height, formatHeight(profile.height, language)],
        [L.weight, formatWeight(profile.weight, language)],
        [L.generation, String(profile.generation)],
        [L.region, REGIONS[profile.generation - 1]],
        [L.captureRate, `${profile.captureRate} / 255`],
        [L.gender, gender ? `♂ ${gender.male}% · ♀ ${gender.female}%` : L.genderless],
        [L.eggGroups, profile.eggGroups.map((group) => eggGroupLabel(group, language)).join(', ') || L.none],
        ...(profile.growthRate ? [[L.growth, growthLabel(profile.growthRate, language)] as [string, string]] : []),
        ...(profile.baseHappiness !== null ? [[L.happiness, String(profile.baseHappiness)] as [string, string]] : []),
        ...(profile.hatchCounter !== null ? [[L.hatch, String(profile.hatchCounter)] as [string, string]] : []),
        [L.moves, String(profile.moveCount)],
    ]

    const matchupRows: [string, string[]][] = [
        [L.x4, matchups.quadruple],
        [L.x2, matchups.double],
        [L.half, matchups.half],
        [L.quarter, matchups.quarter],
        [L.immune, matchups.immune],
    ]

    return (
        <article className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
            <Link href="/pokemon" className="w-fit text-sm font-bold text-red-600 underline-offset-2 hover:underline dark:text-red-400">← {L.back}</Link>

            <motion.header
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative grid items-center gap-6 overflow-hidden rounded-3xl p-6 shadow-xl sm:grid-cols-[14rem_1fr] ${main.image}`}
            >
                <Image
                    src={getSpeciesArtwork(profile.id)}
                    alt={profile.name}
                    width={320}
                    height={320}
                    priority
                    className="mx-auto aspect-square w-56 object-contain drop-shadow-xl"
                />
                <div className="flex flex-col gap-3">
                    <p className="font-mono text-sm font-bold opacity-70">#{String(profile.id).padStart(4, '0')}</p>
                    <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{profile.name}</h1>
                    {profile.genus && <p className="text-sm font-bold opacity-80">{profile.genus}</p>}
                    <div className="flex flex-wrap gap-2">
                        {profile.types.map((type) => <TypeBadge key={type} type={type} language={language} />)}
                    </div>
                </div>
            </motion.header>

            <Section title={L.about}>
                {text.identity.map((paragraph) => <p key={paragraph} className="leading-relaxed">{paragraph}</p>)}
            </Section>

            <div className="grid gap-6 lg:grid-cols-2">
                <Section title={L.stats}>
                    <p className="leading-relaxed">{text.stats}</p>
                    <dl className="flex flex-col gap-2">
                        {profile.stats.map((stat) => (
                            <div key={stat.name} className="grid grid-cols-[6rem_2.5rem_1fr] items-center gap-2 text-sm">
                                <dt className="font-bold">{statLabel(stat.name, language)}</dt>
                                <dd className="text-right font-mono">{stat.value}</dd>
                                <dd className="h-2.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                                    <div className={`h-full rounded-full ${statColor(stat.value)}`} style={{ width: `${(stat.value / STAT_MAX) * 100}%` }} />
                                </dd>
                            </div>
                        ))}
                        <div className="grid grid-cols-[6rem_2.5rem_1fr] gap-2 border-t border-zinc-200 pt-2 text-sm dark:border-zinc-700">
                            <dt className="font-black">{L.total}</dt>
                            <dd className="text-right font-mono font-black">{statTotal(profile)}</dd>
                        </div>
                    </dl>
                </Section>

                <Section title={L.matchups} delay={0.05}>
                    <p className="leading-relaxed">{text.matchups}</p>
                    <dl className="flex flex-col gap-2">
                        {matchupRows.filter(([, types]) => types.length > 0).map(([label, types]) => (
                            <div key={label} className="flex flex-wrap items-center gap-2">
                                <dt className="w-20 text-sm font-bold">{label}</dt>
                                {types.map((type) => (
                                    <dd key={type}><TypeBadge type={type} language={language} /></dd>
                                ))}
                            </div>
                        ))}
                    </dl>
                    <Link href="/guias/tabela-de-tipos" className="w-fit text-sm font-bold text-red-600 underline-offset-2 hover:underline dark:text-red-400">{L.typeChart} →</Link>
                </Section>
            </div>

            <Section title={L.team}>
                <p className="leading-relaxed">{text.team}</p>
            </Section>

            <Section title={L.evolution}>
                <p className="leading-relaxed">{text.evolution}</p>
                {stages.flat().length > 1 && (
                    <ol className="flex flex-wrap items-center gap-3">
                        {stages.map((stage, index) => (
                            <li key={stage.map(({ species }) => species.name).join()} className="flex flex-wrap items-center gap-3">
                                {index > 0 && <span aria-hidden="true" className="text-2xl text-zinc-400">→</span>}
                                {stage.map((link) => {
                                    const id = getSpeciesId(link.species.url)
                                    const methods = index > 0 ? getEvolutionMethods(link.evolution_details, (detail) => describeEvolution(detail, t, itemName, typeName)) : []
                                    const current = link.species.name === profile.slug
                                    return (
                                        <Link
                                            key={link.species.name}
                                            href={`/pokemon/${link.species.name}`}
                                            aria-current={current ? 'page' : undefined}
                                            className={`flex w-32 flex-col items-center gap-1 rounded-2xl border-2 p-2 text-center ${current ? 'border-red-500 bg-red-50 dark:bg-red-950/40' : 'border-transparent bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700'}`}
                                        >
                                            <Image src={getSpeciesArtwork(id)} alt="" width={96} height={96} className="size-20 object-contain" />
                                            <span className="text-sm font-black">{prettify(link.species.name)}</span>
                                            {methods.length > 0 && <span className="text-[11px] leading-tight text-zinc-500 dark:text-zinc-400">{methods.map(({ text: method }) => method).join(' / ')}</span>}
                                        </Link>
                                    )
                                })}
                            </li>
                        ))}
                    </ol>
                )}
            </Section>

            <Section title={L.training}>
                <p className="leading-relaxed">{text.training}</p>
                <dl className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl bg-zinc-100 p-3 dark:bg-zinc-800 sm:col-span-2 lg:col-span-3">
                        <dt className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">{L.abilities}</dt>
                        <dd className="font-bold">
                            {profile.abilities.map(({ name, hidden }) => `${prettify(name)}${hidden ? ` (${L.hiddenAbility})` : ''}`).join(' · ')}
                        </dd>
                    </div>
                    {facts.map(([label, value]) => (
                        <div key={label} className="rounded-xl bg-zinc-100 p-3 dark:bg-zinc-800">
                            <dt className="text-xs font-bold uppercase text-zinc-500 dark:text-zinc-400">{label}</dt>
                            <dd className="font-bold">{value}</dd>
                        </div>
                    ))}
                </dl>
                {profile.forms.length > 0 && (
                    <p className="text-sm"><strong>{L.forms}:</strong> {profile.forms.map(prettify).join(', ')}</p>
                )}
            </Section>

            <section className="flex flex-col items-start gap-3 rounded-3xl bg-red-600 p-6 text-white shadow-lg sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-black">{L.play}</h2>
                    <p className="text-white/85">{L.playText}</p>
                </div>
                <Link href="/desafios" className="shrink-0 rounded-full bg-white px-5 py-2 font-black text-red-600 shadow">{L.playButton}</Link>
            </section>

            <nav aria-label={L.back} className="flex justify-between gap-3">
                {profile.previous ? (
                    <Link href={`/pokemon/${profile.previous.slug}`} className="rounded-full bg-white/90 px-4 py-2 text-sm font-bold shadow dark:bg-zinc-900/90">
                        ← {L.previous}: #{profile.previous.id} {prettify(profile.previous.slug)}
                    </Link>
                ) : <span />}
                {profile.next && (
                    <Link href={`/pokemon/${profile.next.slug}`} className="rounded-full bg-white/90 px-4 py-2 text-sm font-bold shadow dark:bg-zinc-900/90">
                        {L.next}: #{profile.next.id} {prettify(profile.next.slug)} →
                    </Link>
                )}
            </nav>
        </article>
    )
}
