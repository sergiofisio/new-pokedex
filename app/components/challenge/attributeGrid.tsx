'use client'

import Image from "next/image";
import { motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";
import { COLOR_NAMES, prettify, type MessageKey } from "../../i18n/translations";
import { getOfficialArtwork } from "../../lib/sprites";
import type { ChallengeData } from "../../lib/pokeapi";
import { GENERATIONS } from "../generationMenu";
import { CARD, useChallengeData } from "./shared";

type Verdict = 'correct' | 'partial' | 'wrong' | 'higher' | 'lower'

const COLUMNS: MessageKey[] = ['attrType1', 'attrType2', 'generation', 'height', 'weight', 'attrColor', 'attrStage']
const GRID = 'grid grid-cols-[4.5rem_repeat(7,minmax(5.5rem,1fr))] gap-1.5'
const FLIP_DELAY = 0.12

const VERDICT_STYLES: Record<Verdict, string> = {
    correct: 'bg-green-600 text-white',
    partial: 'bg-amber-400 text-zinc-900',
    wrong: 'bg-red-600 text-white',
    higher: 'bg-red-600 text-white',
    lower: 'bg-red-600 text-white',
}

function compareType(slot: number, guess: ChallengeData, target: ChallengeData): Verdict {
    const guessType = guess.types[slot] ?? null
    if (guessType === (target.types[slot] ?? null)) return 'correct'
    return guessType && target.types.includes(guessType) ? 'partial' : 'wrong'
}

const compareNumber = (guess: number, target: number): Verdict =>
    guess === target ? 'correct' : target > guess ? 'higher' : 'lower'

const compareExact = <T,>(guess: T, target: T): Verdict => guess === target ? 'correct' : 'wrong'

export default function AttributeGrid({ guesses, target }: { guesses: number[]; target: ChallengeData }) {
    const { t } = useLanguage()

    if (guesses.length === 0) {
        return <p className={`${CARD} p-5 text-center text-sm font-semibold`}>{t('infiniteIntro')}</p>
    }

    return (
        <div className={`${CARD} p-3`}>
            <div className="overflow-x-auto pb-1">
                <div role="table" className="flex min-w-184 flex-col gap-1.5">
                    <div role="row" className={`${GRID} text-center text-[11px] font-black uppercase tracking-wide text-zinc-500`}>
                        <span role="columnheader">Pokémon</span>
                        {COLUMNS.map((column) => <span key={column} role="columnheader">{t(column)}</span>)}
                    </div>
                    {[...guesses].reverse().map((id) => <AttributeRow key={id} id={id} target={target} />)}
                </div>
            </div>
            <ul className="mt-3 flex flex-wrap justify-center gap-3 text-xs font-semibold">
                {(['correct', 'partial', 'wrong'] as const).map((verdict) => (
                    <li key={verdict} className="flex items-center gap-1.5">
                        <span className={`size-3 rounded ${VERDICT_STYLES[verdict]}`} />
                        {t(verdict === 'correct' ? 'legendCorrect' : verdict === 'partial' ? 'legendPartial' : 'legendWrong')}
                    </li>
                ))}
                <li>↑ ↓ {t('higher')} / {t('lower')}</li>
            </ul>
        </div>
    )
}

function AttributeRow({ id, target }: { id: number; target: ChallengeData }) {
    const { t, typeName, language } = useLanguage()
    const result = useChallengeData(id)

    if (result?.status !== 'success') {
        return (
            <div role="row" className={GRID}>
                {Array.from({ length: COLUMNS.length + 1 }, (_, index) => (
                    <span key={index} className="h-16 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
                ))}
            </div>
        )
    }

    const guess = result.data
    const generationLabel = (value: number) => GENERATIONS.find((generation) => generation.id === value)?.label ?? String(value)

    const cells: { verdict: Verdict; value: string }[] = [
        { verdict: compareType(0, guess, target), value: typeName(guess.types[0]) },
        { verdict: compareType(1, guess, target), value: guess.types[1] ? typeName(guess.types[1]) : t('noType') },
        { verdict: compareNumber(guess.generation, target.generation), value: generationLabel(guess.generation) },
        { verdict: compareNumber(guess.height, target.height), value: `${(guess.height / 10).toFixed(1)} m` },
        { verdict: compareNumber(guess.weight, target.weight), value: `${(guess.weight / 10).toFixed(1)} kg` },
        { verdict: compareExact(guess.color, target.color), value: COLOR_NAMES[language][guess.color] ?? prettify(guess.color) },
        { verdict: compareExact(guess.stage, target.stage), value: String(guess.stage) },
    ]
    const solved = guess.id === target.id

    return (
        <div role="row" className={GRID}>
            <motion.span
                role="cell"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`relative flex h-16 items-center justify-center rounded-xl ${solved ? 'bg-green-600' : 'bg-zinc-200 dark:bg-zinc-800'}`}
                title={prettify(guess.name)}
            >
                <Image src={getOfficialArtwork(guess.id)} alt={prettify(guess.name)} width={56} height={56} className="size-14 object-contain" />
            </motion.span>
            {cells.map(({ verdict, value }, index) => (
                <motion.span
                    key={COLUMNS[index]}
                    role="cell"
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    transition={{ delay: (index + 1) * FLIP_DELAY, duration: 0.35 }}
                    className={`flex h-16 flex-col items-center justify-center rounded-xl px-1 text-center text-sm font-bold leading-tight shadow ${VERDICT_STYLES[verdict]}`}
                >
                    {value}
                    {(verdict === 'higher' || verdict === 'lower') && (
                        <span className="text-lg leading-none">
                            <span aria-hidden="true">{verdict === 'higher' ? '↑' : '↓'}</span>
                            <span className="sr-only">{t(verdict)}</span>
                        </span>
                    )}
                </motion.span>
            ))}
        </div>
    )
}
