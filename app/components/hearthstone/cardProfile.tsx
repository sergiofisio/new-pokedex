'use client'

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useLanguage } from "../../context/languageContext";
import { cardMechanics, cardUsage, describeCard } from "../../lib/cardText";
import { CLASS_COLORS, CRAFT_COST, DISENCHANT_VALUE, RARITY_COLORS, cardName, cardRender, hsLabel, isFreeSet, setName, setSlug } from "../../lib/hearthstone";
import type { CardPageData } from "../../lib/hsServer";
import type { Language } from "../../i18n/translations";
import { CardText, HsCardImage, ManaGem } from "./cardImage";

const LABELS = {
    pt: {
        library: 'Cartas', about: 'Sobre a carta', cardText: 'Texto da carta', noText: 'Esta carta não tem texto.',
        format: 'Formato e coleção', collection: 'Coleção e Pó Arcano', stats: 'Análise de atributos', mechanics: 'Mecânicas',
        related: 'Outras cartas da mesma coleção', decks: 'Aparece nos decks do meta', copies: '{n}× no deck',
        craft: 'Criar', disenchant: 'Desencantar', dust: '{n} de pó', notCraftable: 'Não pode ser criada', artist: 'Artista',
        set: 'Coleção', viewSet: 'Ver todas as cartas da coleção', build: 'Montar um deck', buildText: 'Use o montador de decks para testar esta carta com o resto da coleção.',
        standard: 'Padrão', wild: 'Livre', usage: 'Como usar',
    },
    en: {
        library: 'Cards', about: 'About this card', cardText: 'Card text', noText: 'This card has no text.',
        format: 'Format and set', collection: 'Collection and Arcane Dust', stats: 'Stat analysis', mechanics: 'Mechanics',
        related: 'More cards from the same set', decks: 'Featured in meta decks', copies: '{n}× in deck',
        craft: 'Craft', disenchant: 'Disenchant', dust: '{n} dust', notCraftable: 'Can’t be crafted', artist: 'Artist',
        set: 'Set', viewSet: 'See every card in the set', build: 'Build a deck', buildText: 'Use the deck builder to try this card with the rest of the set.',
        standard: 'Standard', wild: 'Wild', usage: 'How to use it',
    },
} satisfies Record<Language, Record<string, string>>

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="flex flex-col gap-3 rounded-3xl border-2 border-amber-500/30 bg-[#2b1a10]/90 p-6 text-amber-50 shadow-xl">
            <h2 className="text-xl font-black text-amber-200">{title}</h2>
            {children}
        </section>
    )
}

export default function HsCardProfile({ page }: { page: CardPageData }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const { card, set, texts, reprints, related, decks } = page
    const name = cardName(card, language)
    const standard = set.standard
    const description = describeCard(card, set, standard, reprints, language, name)
    const mechanics = cardMechanics(card, language)
    const usage = cardUsage(card, language, name)
    const [text, flavor] = texts[language]
    const accent = CLASS_COLORS[card.classes[0]] ?? CLASS_COLORS.NEUTRAL
    const craft = card.bundled || isFreeSet(set) ? 0 : CRAFT_COST[card.rarity]

    return (
        <article className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
            <nav aria-label="breadcrumb" className="text-sm text-amber-200/80">
                <Link href="/hearthstone" className="hover:underline">Hearthstone</Link>
                {' / '}
                <Link href="/hearthstone/cartas" className="hover:underline">{L.library}</Link>
                {' / '}
                <Link href={`/hearthstone/colecoes/${setSlug(set)}`} className="hover:underline">{setName(set, language)}</Link>
            </nav>

            <header className="relative grid gap-6 overflow-hidden rounded-3xl border-4 border-amber-500/70 bg-[#2b1a10] p-6 text-amber-50 shadow-2xl md:grid-cols-[minmax(0,18rem)_1fr]">
                <div aria-hidden="true" className="absolute inset-x-0 top-0 h-40 opacity-40" style={{ background: `linear-gradient(180deg, ${accent}, transparent)` }} />
                <div className="relative mx-auto w-full max-w-72">
                    <HsCardImage card={card} size={512} eager className="drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]" />
                </div>
                <div className="relative flex min-w-0 flex-col gap-4">
                    <div className="flex items-start gap-3">
                        <ManaGem value={card.cost} className="size-11 text-xl" />
                        <div className="min-w-0">
                            <h1 className="text-3xl font-black leading-tight">{name}</h1>
                            <p className="text-sm text-amber-200/70">{language === 'pt' ? card.name[1] : card.name[0]}</p>
                        </div>
                    </div>
                    <ul className="flex flex-wrap gap-2">
                        {card.classes.map((cls) => (
                            <li key={cls}>
                                <Link href={`/hearthstone/cartas?classe=${cls}`} className="block rounded-full bg-black/30 px-3 py-1 text-xs font-bold hover:bg-black/50">
                                    {hsLabel(cls, language)}
                                </Link>
                            </li>
                        ))}
                        <li className="rounded-full bg-black/30 px-3 py-1 text-xs font-bold">{hsLabel(card.type, language)}</li>
                        <li className="rounded-full px-3 py-1 text-xs font-black text-zinc-900" style={{ backgroundColor: RARITY_COLORS[card.rarity] }}>
                            {hsLabel(card.rarity, language)}
                        </li>
                        <li className={`rounded-full px-3 py-1 text-xs font-black ${standard ? 'bg-emerald-500 text-emerald-950' : 'bg-orange-500 text-orange-950'}`}>
                            {standard ? L.standard : L.wild}
                        </li>
                    </ul>
                    <div className="rounded-2xl bg-amber-50 p-4 text-zinc-900 shadow-inner">
                        <h2 className="sr-only">{L.cardText}</h2>
                        {text ? <CardText text={text} /> : <p className="text-zinc-500 italic">{L.noText}</p>}
                        {flavor && <p className="mt-3 border-t border-amber-900/20 pt-3 text-sm text-amber-900 italic">{flavor}</p>}
                    </div>
                    <dl className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
                        <div>
                            <dt className="inline font-bold text-amber-200/80">{L.set}: </dt>
                            <dd className="inline">{setName(set, language)} ({set.year})</dd>
                        </div>
                        <div>
                            <dt className="inline font-bold text-amber-200/80">{L.craft}: </dt>
                            <dd className="inline">{craft ? L.dust.replace('{n}', String(craft)) : L.notCraftable}</dd>
                        </div>
                        {craft > 0 && (
                            <div>
                                <dt className="inline font-bold text-amber-200/80">{L.disenchant}: </dt>
                                <dd className="inline">{L.dust.replace('{n}', String(DISENCHANT_VALUE[card.rarity]))}</dd>
                            </div>
                        )}
                        {card.artist && (
                            <div>
                                <dt className="inline font-bold text-amber-200/80">{L.artist}: </dt>
                                <dd className="inline">{card.artist}</dd>
                            </div>
                        )}
                    </dl>
                </div>
            </header>

            <Section title={L.about}>
                {description.identity.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </Section>

            <Section title={L.usage}>
                {usage.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </Section>

            {description.stats && (
                <Section title={L.stats}>
                    <p>{description.stats}</p>
                </Section>
            )}

            {mechanics.length > 0 && (
                <Section title={L.mechanics}>
                    <dl className="flex flex-col gap-2">
                        {mechanics.map((mechanic) => (
                            <div key={mechanic.name}>
                                <dt className="inline font-black text-amber-200">{mechanic.name}: </dt>
                                <dd className="inline">{mechanic.text}</dd>
                            </div>
                        ))}
                    </dl>
                </Section>
            )}

            <Section title={L.format}>
                <p>{description.format}</p>
                <Link href={`/hearthstone/colecoes/${setSlug(set)}`} className="self-start font-bold text-amber-300 underline underline-offset-2 hover:text-amber-100">
                    {L.viewSet} →
                </Link>
            </Section>

            <Section title={L.collection}>
                {description.collection.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </Section>

            {decks.length > 0 && (
                <Section title={L.decks}>
                    <ul className="flex flex-col gap-1">
                        {decks.map((deck) => (
                            <li key={deck.name}>
                                <Link href="/hearthstone/decks" className="font-bold hover:underline">{deck.name}</Link>
                                <span className="text-amber-200/70"> · {hsLabel(deck.class, language)} · {deck.format === 'standard' ? L.standard : L.wild} · {L.copies.replace('{n}', String(deck.copies))}</span>
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            {related.length > 0 && (
                <Section title={L.related}>
                    <ul className="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-3">
                        {related.map((other) => (
                            <li key={other.dbfId}>
                                <Link href={`/hearthstone/cartas/${other.slug}`} className="flex flex-col items-center gap-1 text-center text-xs font-bold hover:text-amber-200">
                                    <Image
                                        src={cardRender(other, language)}
                                        alt={language === 'en' ? other.name[1] : other.name[0]}
                                        width={256}
                                        height={388}
                                        unoptimized
                                        loading="lazy"
                                        className="aspect-256/388 h-auto w-full"
                                    />
                                    {language === 'en' ? other.name[1] : other.name[0]}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            <Section title={L.build}>
                <p>{L.buildText}</p>
                <Link href="/hearthstone/decks" className="self-start rounded-full bg-amber-500 px-5 py-2 font-black text-amber-950 hover:bg-amber-400">
                    {L.build}
                </Link>
            </Section>
        </article>
    )
}
