'use client'

import { useLanguage } from "../../context/languageContext";
import { POKEMON_TYPES } from "../../lib/pokeapi";
import { joinList, typeLabel } from "../../lib/pokemonText";
import { attackMultiplier, getDefensiveMatchups, getOffensiveTargets } from "../../lib/typeChart";
import { TYPE_COLORS } from "../../lib/typeColors";
import type { Language } from "../../i18n/translations";

const LABELS = {
    pt: {
        table: 'Tabela completa', caption: 'Linhas: tipo do golpe. Colunas: tipo do Pokémon que recebe o golpe.',
        attack: 'Ataque', defense: 'Defesa', perType: 'Resumo de cada tipo',
        strong: 'Super efetivo contra', weak: 'Pouco efetivo contra', none: 'Não afeta', weakTo: 'Fraco contra',
        resists: 'Resiste a', immune: 'Imune a', nothing: 'nenhum',
    },
    en: {
        table: 'Full chart', caption: 'Rows: the move’s type. Columns: the type of the Pokémon taking the hit.',
        attack: 'Attack', defense: 'Defense', perType: 'Each type at a glance',
        strong: 'Super effective against', weak: 'Not very effective against', none: 'Doesn’t affect', weakTo: 'Weak to',
        resists: 'Resists', immune: 'Immune to', nothing: 'none',
    },
} satisfies Record<Language, Record<string, string>>

const CELL: Record<number, { label: string; className: string }> = {
    2: { label: '2', className: 'bg-green-500 text-white font-black' },
    0.5: { label: '½', className: 'bg-red-500/80 text-white font-bold' },
    0: { label: '0', className: 'bg-zinc-900 text-white font-black' },
}

export default function TypeChartTable() {
    const { language } = useLanguage()
    const L = LABELS[language]
    const label = (type: string) => typeLabel(type, language)
    const list = (types: string[]) => types.length ? joinList(types.map(label), language) : L.nothing

    return (
        <>
            <section className="flex flex-col gap-3">
                <h2 className="text-2xl font-black">{L.table}</h2>
                <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <table className="w-full border-collapse text-center text-xs">
                        <caption className="p-2 text-left text-sm text-zinc-500 dark:text-zinc-400">{L.caption}</caption>
                        <thead>
                            <tr>
                                <th scope="col" className="sticky left-0 bg-zinc-100 p-1 dark:bg-zinc-900">{L.attack} ↓ / {L.defense} →</th>
                                {POKEMON_TYPES.map((type) => (
                                    <th key={type} scope="col" className={`p-1 ${TYPE_COLORS[type]?.card ?? ''} ${TYPE_COLORS[type]?.text ?? ''}`}>
                                        <abbr title={label(type)} className="no-underline">{label(type).slice(0, 3)}</abbr>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {POKEMON_TYPES.map((attacker) => (
                                <tr key={attacker}>
                                    <th scope="row" className={`sticky left-0 p-1 text-left ${TYPE_COLORS[attacker]?.card ?? ''} ${TYPE_COLORS[attacker]?.text ?? ''}`}>
                                        {label(attacker)}
                                    </th>
                                    {POKEMON_TYPES.map((defender) => {
                                        const cell = CELL[attackMultiplier(attacker, defender)]
                                        return (
                                            <td key={defender} className={`border border-zinc-200 p-1 dark:border-zinc-800 ${cell?.className ?? ''}`}>
                                                {cell?.label ?? ''}
                                            </td>
                                        )
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="flex flex-col gap-3">
                <h2 className="text-2xl font-black">{L.perType}</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                    {POKEMON_TYPES.map((type) => {
                        const offense = getOffensiveTargets(type)
                        const defense = getDefensiveMatchups([type])
                        return (
                            <section key={type} id={type} className="scroll-mt-24 rounded-2xl bg-white p-4 shadow dark:bg-zinc-900">
                                <h3 className={`mb-2 inline-block rounded-full px-3 py-1 text-sm font-black uppercase ${TYPE_COLORS[type]?.card ?? ''} ${TYPE_COLORS[type]?.text ?? ''}`}>
                                    {label(type)}
                                </h3>
                                <dl className="flex flex-col gap-1 text-sm">
                                    <div><dt className="inline font-bold">{L.strong}: </dt><dd className="inline">{list(offense.strong)}</dd></div>
                                    <div><dt className="inline font-bold">{L.weak}: </dt><dd className="inline">{list(offense.weak)}</dd></div>
                                    {offense.none.length > 0 && <div><dt className="inline font-bold">{L.none}: </dt><dd className="inline">{list(offense.none)}</dd></div>}
                                    <div><dt className="inline font-bold">{L.weakTo}: </dt><dd className="inline">{list(defense.double)}</dd></div>
                                    <div><dt className="inline font-bold">{L.resists}: </dt><dd className="inline">{list(defense.half)}</dd></div>
                                    {defense.immune.length > 0 && <div><dt className="inline font-bold">{L.immune}: </dt><dd className="inline">{list(defense.immune)}</dd></div>}
                                </dl>
                            </section>
                        )
                    })}
                </div>
            </section>
        </>
    )
}
