'use client'

import Link from "next/link";
import type { ReactNode } from "react";
import { useLanguage } from "../../context/languageContext";
import { describeSet, type SetCard } from "../../lib/cardText";
import { HS_CLASSES, HS_RARITIES, RARITY_COLORS, hsLabel, setName, type HsRarity, type HsSet } from "../../lib/hearthstone";
import type { CardLink, SetSummary } from "../../lib/hsServer";
import type { Language } from "../../i18n/translations";

const LABELS = {
    pt: {
        title: 'Coleções de Hearthstone',
        intro: 'Todas as expansões, aventuras e conjuntos de Hearthstone, da mais recente à mais antiga. Abra uma coleção para ver as cartas dela, quantas são de cada raridade e quanto Pó Arcano custa completá-la.',
        cards: '{n} cartas', standard: 'Padrão', wild: 'Livre', standardSets: 'No formato Padrão', wildSets: 'Somente no Livre',
        library: 'Cartas', sets: 'Coleções', complete: 'Custo para completar', byRarity: 'Cartas por raridade', byClass: 'Cartas por classe',
        dust: '{n} de pó',
    },
    en: {
        title: 'Hearthstone sets',
        intro: 'Every Hearthstone expansion, adventure and set, from newest to oldest. Open a set to see its cards, how many there are of each rarity and how much Arcane Dust it costs to complete.',
        cards: '{n} cards', standard: 'Standard', wild: 'Wild', standardSets: 'In Standard', wildSets: 'Wild only',
        library: 'Cards', sets: 'Sets', complete: 'Cost to complete', byRarity: 'Cards by rarity', byClass: 'Cards by class',
        dust: '{n} dust',
    },
} satisfies Record<Language, Record<string, string>>

const panel = 'flex flex-col gap-3 rounded-3xl border-2 border-amber-500/30 bg-[#2b1a10]/90 p-6 text-amber-50 shadow-xl'

export function SetsLink() {
    const { language } = useLanguage()
    return (
        <Link href="/hearthstone/colecoes" className="self-start rounded-full bg-amber-500 px-5 py-2 text-sm font-black text-amber-950 hover:bg-amber-400">
            {language === 'en' ? 'Browse cards by set' : 'Ver cartas por coleção'} →
        </Link>
    )
}

function Breadcrumb({ children }: { children: ReactNode }) {
    return <nav aria-label="breadcrumb" className="text-sm text-amber-200/80">{children}</nav>
}

export function SetIndex({ sets }: { sets: SetSummary[] }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const ordered = [...sets].reverse()
    const groups = [
        { title: L.standardSets, items: ordered.filter(({ set }) => set.standard) },
        { title: L.wildSets, items: ordered.filter(({ set }) => !set.standard) },
    ]

    return (
        <article className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
            <Breadcrumb>
                <Link href="/hearthstone" className="hover:underline">Hearthstone</Link>
                {' / '}
                <Link href="/hearthstone/cartas" className="hover:underline">{L.library}</Link>
            </Breadcrumb>
            <header className={panel}>
                <h1 className="text-3xl font-black text-amber-200">{L.title}</h1>
                <p>{L.intro}</p>
            </header>
            {groups.map((group) => (
                <section key={group.title} className={panel}>
                    <h2 className="text-xl font-black text-amber-200">{group.title}</h2>
                    <ul className="grid gap-2 sm:grid-cols-2">
                        {group.items.map(({ set, slug, total }) => (
                            <li key={slug}>
                                <Link href={`/hearthstone/colecoes/${slug}`} className="flex items-baseline justify-between gap-3 rounded-xl bg-black/30 px-4 py-2 hover:bg-black/50">
                                    <span className="font-bold">{setName(set, language)}</span>
                                    <span className="shrink-0 text-xs text-amber-200/70">{set.year} · {L.cards.replace('{n}', String(total))}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </article>
    )
}

export function SetDetail({ set, cards }: { set: HsSet; cards: SetCard[] }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const name = (card: CardLink) => language === 'en' ? card.name[1] : card.name[0]
    const paragraphs = describeSet(set, cards, language)
    const byClass = HS_CLASSES
        .map((cls) => ({ cls, cards: cards.filter((card) => card.classes.includes(cls)) }))
        .filter((group) => group.cards.length)

    return (
        <article className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8">
            <Breadcrumb>
                <Link href="/hearthstone" className="hover:underline">Hearthstone</Link>
                {' / '}
                <Link href="/hearthstone/colecoes" className="hover:underline">{L.sets}</Link>
            </Breadcrumb>
            <header className={panel}>
                <h1 className="text-3xl font-black text-amber-200">{setName(set, language)}</h1>
                <p className="text-sm font-bold text-amber-200/70">{set.year} · {set.standard ? L.standard : L.wild} · {L.cards.replace('{n}', String(cards.length))}</p>
                {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </header>

            <section className={panel}>
                <h2 className="text-xl font-black text-amber-200">{L.byRarity}</h2>
                <ul className="flex flex-wrap gap-2">
                    {HS_RARITIES.map((rarity: HsRarity) => {
                        const count = cards.filter((card) => card.rarity === rarity).length
                        return count ? (
                            <li key={rarity} className="rounded-full px-3 py-1 text-xs font-black text-zinc-900" style={{ backgroundColor: RARITY_COLORS[rarity] }}>
                                {hsLabel(rarity, language)}: {count}
                            </li>
                        ) : null
                    })}
                </ul>
            </section>

            <section className={panel}>
                <h2 className="text-xl font-black text-amber-200">{L.byClass}</h2>
                {byClass.map((group) => (
                    <div key={group.cls} className="flex flex-col gap-1">
                        <h3 className="font-black">{hsLabel(group.cls, language)} ({group.cards.length})</h3>
                        <ul className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-x-4 gap-y-1 text-sm">
                            {group.cards.map((card) => (
                                <li key={card.dbfId}>
                                    <Link href={`/hearthstone/cartas/${card.slug}`} prefetch={false} className="hover:text-amber-200 hover:underline">
                                        <span className="mr-1 inline-block w-5 text-center font-black text-sky-300">{card.cost}</span>
                                        <span style={{ color: card.rarity === 'COMMON' || card.rarity === 'FREE' ? undefined : RARITY_COLORS[card.rarity] }}>{name(card)}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </section>
        </article>
    )
}
