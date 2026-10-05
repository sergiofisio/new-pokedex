'use client'

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import PokedexModal from "../pokedexModal";
import { useLanguage } from "../../context/languageContext";
import { useAuth } from "../../context/authContext";
import { useIsClient } from "../../hooks/useIsClient";
import { useChallenge } from "../../hooks/useChallenge";
import { getDateKey, supportsDaily, type ChallengeMode, type ChallengeVariant } from "../../lib/challenge";
import ChallengeBackdrop from "./backdrop";
import VariantToggle from "./variantToggle";
import GuessInput, { NO_FILTERS, type GuessFilters } from "./guessInput";
import ChallengeHints from "./hints";
import GuessList from "./guessList";
import ResultPanel from "./resultPanel";
import AttributeGrid from "./attributeGrid";
import { DescriptionClue, SilhouetteClue, ZoomClue } from "./clues";
import { MODE_META, ModeIcon } from "./modes";
import { CARD, useChallengeData } from "./shared";

const NO_NAVIGATION: number[] = []

export default function ChallengeGame({ mode }: { mode: ChallengeMode }) {
    const { t } = useLanguage()
    const { progressVersion } = useAuth()
    const isClient = useIsClient()
    const daily = supportsDaily(mode)
    const [variant, setVariant] = useState<ChallengeVariant>(daily ? 'daily' : 'random')
    const [round, setRound] = useState(0)
    const [dateKey, setDateKey] = useState(getDateKey)
    const [pokedexId, setPokedexId] = useState<number | null>(null)
    const meta = MODE_META[mode]

    return (
        <ChallengeBackdrop generation={meta.generation}>
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6">
                <Link
                    href="/desafios"
                    className="w-fit rounded-full bg-white/90 px-3 py-1 text-sm font-bold shadow transition-colors hover:bg-white dark:bg-zinc-900/90 dark:hover:bg-zinc-900"
                >
                    ← {t('backToChallenges')}
                </Link>

                <motion.header
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-4 rounded-3xl p-5 text-white shadow-xl ${meta.accent}`}
                >
                    <ModeIcon mode={mode} className="size-12 shrink-0" />
                    <div>
                        <h2 className="text-2xl font-black">{t(meta.title)}</h2>
                        <p className="text-sm opacity-90">{t(meta.description)}</p>
                    </div>
                </motion.header>

                {daily && (
                    <VariantToggle
                        value={variant}
                        onChange={(next) => { setVariant(next); setRound((value) => value + 1) }}
                    />
                )}

                {isClient ? (
                    <ChallengeSession
                        key={`${variant}:${dateKey}:${round}:${progressVersion}`}
                        mode={mode}
                        variant={variant}
                        dateKey={dateKey}
                        onNextRound={() => setRound((value) => value + 1)}
                        onNewDay={() => setDateKey(getDateKey())}
                        onShowPokedex={setPokedexId}
                    />
                ) : (
                    <p className={`${CARD} p-5`}>{t('challengeLoading')}</p>
                )}
            </div>

            <PokedexModal
                speciesId={pokedexId}
                navigationIds={NO_NAVIGATION}
                onClose={() => setPokedexId(null)}
                onNavigate={setPokedexId}
            />
        </ChallengeBackdrop>
    )
}

interface ChallengeSessionProps {
    mode: ChallengeMode;
    variant: ChallengeVariant;
    dateKey: string;
    onNextRound: () => void;
    onNewDay: () => void;
    onShowPokedex: (id: number) => void;
}

function ChallengeSession({ mode, variant, dateKey, onNextRound, onNewDay, onShowPokedex }: ChallengeSessionProps) {
    const { t } = useLanguage()
    const { target, guesses, wrongCount, status, stats, reward, guess, giveUp } = useChallenge(mode, variant, dateKey)
    const result = useChallengeData(target)
    const [filters, setFilters] = useState<GuessFilters>(NO_FILTERS)

    if (!result) return <p role="status" className={`${CARD} p-5`}>{t('challengeLoading')}</p>
    if (result.status === 'error') {
        return (
            <div role="alert" className={`${CARD} flex flex-wrap items-center justify-between gap-3 p-5`}>
                {t('challengeError')}
                {variant === 'random' && (
                    <button type="button" onClick={onNextRound} className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white">
                        {t('newPokemon')}
                    </button>
                )}
            </div>
        )
    }

    const data = result.data
    const revealed = status !== 'playing'
    const clueProps = { data, revealed, wrongCount, seed: `${dateKey}:${variant}:${target}` }

    return (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
            {mode !== 'infinito' && (
                <div className="lg:col-start-1">
                    {mode === 'silhueta' && <SilhouetteClue {...clueProps} />}
                    {mode === 'zoom' && <ZoomClue {...clueProps} />}
                    {mode === 'descricao' && <DescriptionClue {...clueProps} />}
                </div>
            )}

            <aside className={`flex flex-col gap-2 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start ${revealed ? '' : 'lg:sticky lg:top-4'}`}>
                {status === 'playing' ? (
                    <>
                        <GuessInput guessed={guesses} onGuess={guess} filters={filters} onFiltersChange={setFilters} />
                        <div className="flex items-center justify-between gap-3 px-1">
                            <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-bold shadow dark:bg-zinc-900/90">
                                {t('attemptsCount', { n: guesses.length })}
                            </span>
                            {variant === 'random' && (
                                <motion.button
                                    type="button"
                                    onClick={giveUp}
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="rounded-full bg-white/90 px-3 py-1 text-sm font-bold text-red-600 shadow dark:bg-zinc-900/90 dark:text-red-400"
                                >
                                    {t('giveUp')}
                                </motion.button>
                            )}
                        </div>
                    </>
                ) : (
                    <ResultPanel
                        mode={mode}
                        status={status}
                        target={data}
                        attempts={guesses.length}
                        stats={stats}
                        reward={reward}
                        variant={variant}
                        onNext={onNextRound}
                        onNewDay={onNewDay}
                        onShowPokedex={onShowPokedex}
                    />
                )}
            </aside>

            <div className="flex min-w-0 flex-col gap-5 lg:col-start-1">
                {mode === 'infinito' ? (
                    <AttributeGrid guesses={guesses} target={data} />
                ) : (
                    <>
                        <ChallengeHints
                            data={data}
                            wrongCount={wrongCount}
                            revealed={revealed}
                            filters={filters}
                            onApplyFilter={(filter) => setFilters((current) => ({ ...current, ...filter }))}
                        />
                        <GuessList guesses={guesses} target={target} />
                    </>
                )}
            </div>
        </div>
    )
}
