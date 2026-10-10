'use client'

import Link from "next/link";
import type { ReactNode } from "react";
import { useLanguage } from "../../context/languageContext";
import type { Guide, GuideContent, GuideWorld } from "../../lib/guides";
import type { Language } from "../../i18n/translations";

const LABELS = {
    pt: {
        guides: 'Guias', updated: 'Atualizado em {date}', title: 'Guias da Taverna',
        intro: 'Artigos escritos por nós para ajudar você a jogar melhor e aproveitar as ferramentas do site.',
        pokemon: 'Pokémon', hearthstone: 'Hearthstone', read: 'Ler guia',
    },
    en: {
        guides: 'Guides', updated: 'Updated on {date}', title: 'Tavern guides',
        intro: 'Articles we wrote to help you play better and get the most out of the site’s tools.',
        pokemon: 'Pokémon', hearthstone: 'Hearthstone', read: 'Read guide',
    },
} satisfies Record<Language, Record<string, string>>

export function GuideIndex({ guides }: { guides: Guide[] }) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const worlds: GuideWorld[] = ['pokemon', 'hearthstone']

    return (
        <article className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10">
            <header className="flex flex-col gap-3">
                <h1 className="text-4xl font-black tracking-tight">{L.title}</h1>
                <p className="text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">{L.intro}</p>
            </header>
            {worlds.map((world) => (
                <section key={world} className="flex flex-col gap-3">
                    <h2 className="text-2xl font-black">{L[world]}</h2>
                    <ul className="grid gap-3 sm:grid-cols-2">
                        {guides.filter((guide) => guide.world === world).map((guide) => (
                            <li key={guide.slug}>
                                <Link
                                    href={`/guias/${guide.slug}`}
                                    className={`flex h-full flex-col gap-2 rounded-2xl p-5 shadow transition hover:-translate-y-0.5 hover:shadow-lg ${world === 'pokemon' ? 'bg-red-50 dark:bg-red-950/40' : 'bg-amber-50 dark:bg-amber-950/40'}`}
                                >
                                    <span className="text-lg font-black">{guide.content[language].title}</span>
                                    <span className="text-sm text-zinc-600 dark:text-zinc-400">{guide.content[language].description}</span>
                                    <span className="mt-auto text-sm font-bold">{L.read} →</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            ))}
        </article>
    )
}

interface GuideArticleProps {
    content: Record<Language, GuideContent>
    updated?: string
    breadcrumb?: boolean
    children?: ReactNode
}

export default function GuideArticle({ content, updated, breadcrumb = true, children }: GuideArticleProps) {
    const { language } = useLanguage()
    const L = LABELS[language]
    const { title, intro, sections } = content[language]
    const date = updated
        ? new Date(`${updated}T12:00:00`).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', { dateStyle: 'long' })
        : null

    return (
        <article className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-10">
            {breadcrumb && (
                <nav aria-label="breadcrumb" className="text-sm text-zinc-500 dark:text-zinc-400">
                    <Link href="/guias" className="hover:underline">{L.guides}</Link>
                </nav>
            )}
            <header className="flex flex-col gap-3">
                <h1 className="text-4xl font-black tracking-tight">{title}</h1>
                {date && <p className="text-sm text-zinc-500 dark:text-zinc-400">{L.updated.replace('{date}', date)}</p>}
                <p className="text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">{intro}</p>
            </header>
            {sections.map((section) => (
                <section key={section.title} className="flex flex-col gap-2">
                    <h2 className="text-2xl font-black">{section.title}</h2>
                    {section.paragraphs.map((paragraph) => (
                        <p key={paragraph} className="leading-relaxed text-zinc-700 dark:text-zinc-300">{paragraph}</p>
                    ))}
                </section>
            ))}
            {children}
        </article>
    )
}
