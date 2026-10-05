'use client'

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useLanguage } from "../../../context/languageContext";
import { useChallenge } from "../../../hooks/useChallenge";
import { FUSION_MAX_ID, getFusion } from "../../../lib/fusion";
import { getOfficialArtwork } from "../../../lib/sprites";
import { TYPE_COLORS } from "../../../lib/typeColors";
import type { ChallengeData } from "../../../lib/pokeapi";
import { GENERATIONS } from "../../generationMenu";
import GuessInput, { NO_FILTERS, type GuessFilters } from "../guessInput";
import { HintBoard, type Hint } from "../hints";
import { CARD, useChallengeData, useSpeciesName } from "../shared";
import { PlayBar, SessionEnd, SessionError, SessionLayout, SessionLoading, type SessionProps } from "./common";

type Part = 'head' | 'body'
type Verdict = 'exact' | 'family' | 'wrong'

const VERDICT_STYLES: Record<Verdict, string> = {
    exact: 'bg-green-600 text-white',
    family: 'bg-amber-400 text-zinc-900',
    wrong: 'bg-red-600/90 text-white',
}
const VERDICT_ICON: Record<Verdict, string> = { exact: '✓', family: '≈', wrong: '✗' }

function TypeChips({ types }: { types: string[] }) {
    const { typeName } = useLanguage()
    return (
        <span className="flex flex-wrap justify-center gap-1">
            {types.map((type) => (
                <span key={type} className={`rounded-full px-2 py-0.5 text-xs font-black ${TYPE_COLORS[type]?.card ?? 'bg-zinc-300'} ${TYPE_COLORS[type]?.text ?? ''}`}>
                    {typeName(type)}
                </span>
            ))}
        </span>
    )
}

interface FusionClueProps {
    sprite: string;
    author: string;
    head: ChallengeData;
    body: ChallengeData;
    found: Record<Part, boolean>;
}

function FusionClue({ sprite, author, head, body, found }: FusionClueProps) {
    const { t } = useLanguage()
    const getName = useSpeciesName()
    const parts: [Part, ChallengeData][] = [['head', head], ['body', body]]

    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={`${CARD} p-6`}>
            <p className="mb-4 text-center text-sm font-black uppercase tracking-[0.2em] text-red-600 dark:text-red-400">{t('fusionQuestion')}</p>
            <div className="relative mx-auto aspect-square w-full max-w-72 rounded-2xl bg-[radial-gradient(circle,rgba(255,255,255,0.9),rgba(228,228,231,0.6))] dark:bg-[radial-gradient(circle,rgba(63,63,70,0.9),rgba(24,24,27,0.6))]">
                <Image
                    src={sprite}
                    alt={t('fusionAlt')}
                    fill
                    unoptimized
                    priority
                    draggable={false}
                    className="select-none object-contain [image-rendering:pixelated]"
                />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
                {parts.map(([part, data]) => (
                    <div key={part} className={`flex flex-col items-center gap-2 rounded-2xl p-3 ${found[part] ? 'bg-green-600/15 ring-2 ring-green-600' : 'bg-zinc-100 dark:bg-zinc-800'}`}>
                        <span className="text-[11px] font-black uppercase tracking-wide text-zinc-500">{t(part === 'head' ? 'fusionHead' : 'fusionBody')}</span>
                        <div className="relative size-16">
                            <AnimatePresence mode="wait" initial={false}>
                                {found[part] ? (
                                    <motion.div key="found" initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} className="absolute inset-0">
                                        <Image src={getOfficialArtwork(data.id)} alt={getName(data.id)} fill sizes="4rem" className="object-contain" />
                                    </motion.div>
                                ) : (
                                    <motion.span key="hidden" exit={{ scale: 0 }} className="absolute inset-0 flex items-center justify-center text-4xl font-black text-zinc-400">?</motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                        <span className="min-h-5 text-sm font-black">{found[part] ? getName(data.id) : ''}</span>
                        <TypeChips types={data.types} />
                    </div>
                ))}
            </div>
            <p className="mt-4 text-center text-[11px] text-zinc-500">
                {t('fusionCredits')}{author ? ` · ${t('fusionArtist', { name: author })}` : ''}
            </p>
        </motion.div>
    )
}

function judge(guess: ChallengeData | undefined, target: ChallengeData): Verdict {
    if (!guess) return 'wrong'
    if (guess.id === target.id) return 'exact'
    return guess.chainUrl === target.chainUrl ? 'family' : 'wrong'
}

function FusionGuessRow({ id, head, body }: { id: number; head: ChallengeData; body: ChallengeData }) {
    const { t } = useLanguage()
    const getName = useSpeciesName()
    const result = useChallengeData(id)
    const data = result?.status === 'success' ? result.data : undefined
    const verdicts: [Part, Verdict][] = [['head', judge(data, head)], ['body', judge(data, body)]]
    const solved = verdicts.some(([, verdict]) => verdict === 'exact')

    return (
        <motion.li
            layout
            initial={{ opacity: 0, y: -16, scale: solved ? 0.6 : 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`${CARD} flex items-center gap-3 px-3 py-2 font-bold`}
        >
            <span className="flex size-12 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800">
                <Image src={getOfficialArtwork(id)} alt="" width={48} height={48} className="size-11 object-contain" />
            </span>
            <span className="flex-1 truncate">{getName(id)}</span>
            {verdicts.map(([part, verdict], index) => (
                <motion.span
                    key={part}
                    initial={{ rotateY: 90 }}
                    animate={{ rotateY: 0 }}
                    transition={{ type: 'tween', duration: 0.3, delay: index * 0.12 }}
                    title={t(`fusionVerdict_${verdict}`)}
                    className={`flex w-20 flex-col items-center rounded-xl px-2 py-1 text-xs ${data ? VERDICT_STYLES[verdict] : 'bg-zinc-200 dark:bg-zinc-700'}`}
                >
                    <span className="text-[10px] font-black uppercase opacity-80">{t(part === 'head' ? 'fusionHead' : 'fusionBody')}</span>
                    <span aria-hidden className="text-base leading-none">{data ? VERDICT_ICON[verdict] : '…'}</span>
                </motion.span>
            ))}
        </motion.li>
    )
}

export default function FusionSession(session: SessionProps) {
    const { mode, variant, dateKey, series, onNextRound } = session
    const { t } = useLanguage()
    const getName = useSpeciesName()
    const { target, guesses, wrongCount, attempts, status, stats, reward, guess, giveUp } = useChallenge(mode, variant, dateKey, series)
    const fusion = getFusion(target)
    const headResult = useChallengeData(fusion.head)
    const bodyResult = useChallengeData(fusion.body)
    const [filters, setFilters] = useState<GuessFilters>(NO_FILTERS)

    if (!headResult || !bodyResult) return <SessionLoading />
    if (headResult.status === 'error' || bodyResult.status === 'error') {
        return <SessionError canRetry={variant === 'random' && !series} onRetry={onNextRound} />
    }

    const head = headResult.data
    const body = bodyResult.data
    const revealed = status !== 'playing'
    const found = { head: revealed || guesses.includes(head.id), body: revealed || guesses.includes(body.id) }
    const generationLabel = (id: number) => {
        const generation = GENERATIONS.find((item) => item.id === id)
        return generation ? `${generation.label} · ${generation.region}` : String(id)
    }
    const hints: Hint[] = [
        { at: 3, label: `${t('fusionHead')} · ${t('generation')}`, value: generationLabel(head.generation), filter: { generation: head.generation } },
        { at: 5, label: `${t('fusionBody')} · ${t('generation')}`, value: generationLabel(body.generation), filter: { generation: body.generation } },
        { at: 8, label: `${t('fusionHead')} · ${t('hintFirstLetter')}`, value: getName(head.id)[0] },
        { at: 11, label: `${t('fusionBody')} · ${t('hintFirstLetter')}`, value: getName(body.id)[0] },
    ]

    return (
        <SessionLayout
            clue={<FusionClue sprite={fusion.sprite} author={fusion.author} head={head} body={body} found={found} />}
            sticky={!revealed}
            aside={status === 'playing' ? (
                <>
                    <GuessInput guessed={guesses} onGuess={guess} filters={filters} onFiltersChange={setFilters} maxId={FUSION_MAX_ID} />
                    <PlayBar count={guesses.length} canGiveUp={variant === 'random' || Boolean(series)} onGiveUp={giveUp} />
                </>
            ) : (
                <SessionEnd
                    session={session}
                    status={status}
                    answer={{
                        ids: [head.id, body.id],
                        label: `${getName(head.id)} + ${getName(body.id)}`,
                        artwork: <Image src={fusion.sprite} alt={t('fusionAlt')} fill unoptimized className="object-contain [image-rendering:pixelated]" />,
                    }}
                    attempts={attempts}
                    stats={stats}
                    reward={reward}
                />
            )}
        >
            <HintBoard
                hints={hints}
                wrongCount={wrongCount}
                revealed={revealed}
                filters={filters}
                onApplyFilter={(filter) => setFilters((current) => ({ ...current, ...filter }))}
            />
            <ul className="flex flex-col gap-2">
                <AnimatePresence initial={false}>
                    {[...guesses].reverse().map((id) => <FusionGuessRow key={id} id={id} head={head} body={body} />)}
                </AnimatePresence>
            </ul>
        </SessionLayout>
    )
}
