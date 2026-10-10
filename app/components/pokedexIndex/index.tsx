'use client'

import Link from "next/link";
import { useLanguage } from "../../context/languageContext";
import { getGenerationOfId } from "../../lib/pokeapi";
import type { PokemonListItem } from "../../lib/pokemonServer";
import { REGIONS } from "../../lib/pokemonText";
import { prettify } from "../../i18n/translations";

const LABELS = {
    pt: { title: 'Todos os Pokémon', text: 'Abra a página de cada Pokémon para ver tipos, fraquezas, atributos, evoluções e dicas de batalha.', count: '{n} Pokémon' },
    en: { title: 'Every Pokémon', text: 'Open each Pokémon’s page to see its types, weaknesses, stats, evolutions and battle tips.', count: '{n} Pokémon' },
}

export default function PokedexIndex({ list }: { list: PokemonListItem[] }) {
    const { language, t } = useLanguage()
    const L = LABELS[language]
    const generations = REGIONS.map((region, index) => ({
        id: index + 1,
        region,
        pokemon: list.filter(({ id }) => getGenerationOfId(id) === index + 1),
    }))

    return (
        <section aria-labelledby="pokedex-index-title" className="flex flex-col gap-3 rounded-3xl bg-white/90 p-6 shadow-lg dark:bg-zinc-900/90">
            <h2 id="pokedex-index-title" className="text-xl font-black">{L.title}</h2>
            <p className="text-zinc-700 dark:text-zinc-300">{L.text}</p>
            {generations.map((generation) => (
                <details key={generation.id} className="group rounded-2xl bg-zinc-100 dark:bg-zinc-800">
                    <summary className="cursor-pointer list-none px-4 py-3 font-black marker:hidden">
                        <span className="mr-2 inline-block transition-transform group-open:rotate-90">›</span>
                        {t('generation')} {generation.id} · {generation.region}
                        <span className="ml-2 text-sm font-normal text-zinc-500 dark:text-zinc-400">{L.count.replace('{n}', String(generation.pokemon.length))}</span>
                    </summary>
                    <ul className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-1 px-4 pb-4 text-sm">
                        {generation.pokemon.map(({ id, slug }) => (
                            <li key={id}>
                                <Link href={`/pokemon/${slug}`} prefetch={false} className="underline-offset-2 hover:text-red-600 hover:underline dark:hover:text-red-400">
                                    <span className="font-mono text-zinc-500">#{String(id).padStart(4, '0')}</span> {prettify(slug)}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </details>
            ))}
        </section>
    )
}
