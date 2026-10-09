'use client'

import Image from "next/image";
import { motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";
import type { MessageKey } from "../../i18n/translations";
import { HS_RARITIES, cardName, cardTile, cardTribe, hsLabel, setName, type HsCard, type HsData } from "../../lib/hearthstone";
import { CARD } from "./shared";

type Verdict = 'correct' | 'partial' | 'wrong' | 'higher' | 'lower'

const COLUMNS: MessageKey[] = ['hsFilterClass', 'hsFilterCost', 'hsAttack', 'hsHealth', 'hsFilterType', 'hsFilterRarity', 'hsFilterSet', 'hsColTribe']
const GRID = 'grid grid-cols-[4.5rem_repeat(8,minmax(0,1fr))] gap-1'
const FLIP_DELAY = 0.1

const VERDICT_STYLES: Record<Verdict, string> = {
    correct: 'bg-green-600 text-white',
    partial: 'bg-amber-400 text-zinc-900',
    wrong: 'bg-red-600 text-white',
    higher: 'bg-red-600 text-white',
    lower: 'bg-red-600 text-white',
}

const compareNumber = (guess: number, target: number): Verdict =>
    guess === target ? 'correct' : target > guess ? 'higher' : 'lower'

const compareOptional = (guess: number | undefined, target: number | undefined): Verdict =>
    guess === undefined || target === undefined ? (guess === target ? 'correct' : 'wrong') : compareNumber(guess, target)

function compareSets(guess: string[], target: string[]): Verdict {
    if (guess.length === target.length && guess.every((value) => target.includes(value))) return 'correct'
    return guess.some((value) => target.includes(value)) ? 'partial' : 'wrong'
}

export function compareCards(data: HsData, guess: HsCard, target: HsCard, language: 'pt' | 'en') {
    const tribe = cardTribe(guess)
    return [
        { verdict: compareSets(guess.classes, target.classes), value: guess.classes.map((cls) => hsLabel(cls, language)).join(' / ') },
        { verdict: compareNumber(guess.cost, target.cost), value: String(guess.cost) },
        { verdict: compareOptional(guess.attack, target.attack), value: guess.attack === undefined ? '—' : String(guess.attack) },
        { verdict: compareOptional(guess.health, target.health), value: guess.health === undefined ? '—' : String(guess.health) },
        { verdict: guess.type === target.type ? 'correct' : 'wrong', value: hsLabel(guess.type, language) },
        { verdict: compareNumber(HS_RARITIES.indexOf(guess.rarity), HS_RARITIES.indexOf(target.rarity)), value: hsLabel(guess.rarity, language) },
        { verdict: compareNumber(guess.set, target.set), value: `${setName(data.sets[guess.set], language)} (${data.sets[guess.set].year})` },
        { verdict: compareSets(tribe, cardTribe(target)), value: tribe.length ? tribe.map((value) => hsLabel(value, language)).join(' / ') : '—' },
    ] satisfies { verdict: Verdict; value: string }[]
}

export default function CardAttributeGrid({ data, guesses, target }: { data: HsData; guesses: HsCard[]; target: HsCard }) {
    const { t } = useLanguage()

    if (guesses.length === 0) {
        return <p className={`${CARD} p-5 text-center text-sm font-semibold`}>{t('hsAttributesIntro')}</p>
    }

    return (
        <div className={`${CARD} p-3`}>
            <div className="overflow-x-auto pb-1 lg:overflow-visible">
                <div role="table" className="flex min-w-[42rem] flex-col gap-1.5 lg:min-w-0">
                    <div role="row" className={`${GRID} text-center text-[10px] leading-tight font-black uppercase text-zinc-500`}>
                        <span role="columnheader">{t('hsColCard')}</span>
                        {COLUMNS.map((column) => <span key={column} role="columnheader">{t(column)}</span>)}
                    </div>
                    {[...guesses].reverse().map((guess) => <AttributeRow key={guess.dbfId} data={data} guess={guess} target={target} />)}
                </div>
            </div>
            <ul className="mt-3 flex flex-wrap justify-center gap-3 text-xs font-semibold">
                {(['correct', 'partial', 'wrong'] as const).map((verdict) => (
                    <li key={verdict} className="flex items-center gap-1.5">
                        <span className={`size-3 rounded ${VERDICT_STYLES[verdict]}`} />
                        {t(verdict === 'correct' ? 'legendCorrect' : verdict === 'partial' ? 'hsLegendPartial' : 'legendWrong')}
                    </li>
                ))}
                <li>↑ ↓ {t('higher')} / {t('lower')}</li>
            </ul>
        </div>
    )
}

function AttributeRow({ data, guess, target }: { data: HsData; guess: HsCard; target: HsCard }) {
    const { t, language } = useLanguage()
    const cells = compareCards(data, guess, target, language)
    const solved = guess.dbfId === target.dbfId
    const name = cardName(guess, language)

    return (
        <div role="row" className={GRID}>
            <motion.span
                role="cell"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                title={name}
                className={`relative flex h-14 flex-col items-stretch justify-end overflow-hidden rounded-xl ${solved ? 'ring-4 ring-green-600' : ''}`}
            >
                <Image src={cardTile(guess)} alt="" fill unoptimized sizes="4.5rem" className="object-cover" />
                <span className="relative bg-black/70 px-1 text-[9px] leading-tight font-bold text-white line-clamp-2">{name}</span>
            </motion.span>
            {cells.map(({ verdict, value }, index) => (
                <motion.span
                    key={COLUMNS[index]}
                    role="cell"
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    transition={{ delay: (index + 1) * FLIP_DELAY, duration: 0.35 }}
                    className={`flex h-14 min-w-0 flex-col items-center justify-center rounded-xl px-0.5 text-center text-[11px] font-bold leading-tight break-words shadow ${VERDICT_STYLES[verdict]}`}
                >
                    <span className="line-clamp-3">{value}</span>
                    {(verdict === 'higher' || verdict === 'lower') && (
                        <span className="text-base leading-none">
                            <span aria-hidden="true">{verdict === 'higher' ? '↑' : '↓'}</span>
                            <span className="sr-only">{t(verdict)}</span>
                        </span>
                    )}
                </motion.span>
            ))}
        </div>
    )
}

export function CardGuessList({ data, guesses, target }: { data: HsData; guesses: HsCard[]; target: HsCard }) {
    const { t, language } = useLanguage()
    if (guesses.length === 0) return null

    return (
        <section className={`${CARD} p-4`}>
            <h3 className="mb-3 text-sm font-black uppercase tracking-wide text-zinc-500">{t('guessesTitle')}</h3>
            <ul className="flex flex-col gap-2">
                {[...guesses].reverse().map((guess) => {
                    const [classCell, costCell] = compareCards(data, guess, target, language)
                    return (
                        <motion.li
                            key={guess.dbfId}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="relative flex items-center gap-3 overflow-hidden rounded-2xl bg-zinc-900 px-3 py-2 text-white"
                        >
                            <Image src={cardTile(guess)} alt="" fill unoptimized sizes="20rem" className="object-cover object-right opacity-60" />
                            <span className="relative flex-1 truncate font-black [text-shadow:0_1px_3px_rgb(0_0_0/0.9)]">{cardName(guess, language)}</span>
                            <span className={`relative rounded-lg px-2 py-0.5 text-xs font-black ${VERDICT_STYLES[classCell.verdict]}`}>{classCell.value}</span>
                            <span className={`relative rounded-lg px-2 py-0.5 text-xs font-black ${VERDICT_STYLES[costCell.verdict]}`}>
                                {costCell.value}
                                {costCell.verdict === 'higher' ? ' ↑' : costCell.verdict === 'lower' ? ' ↓' : ''}
                            </span>
                        </motion.li>
                    )
                })}
            </ul>
        </section>
    )
}
