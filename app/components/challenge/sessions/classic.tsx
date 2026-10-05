'use client'

import { useState } from "react";
import { useChallenge } from "../../../hooks/useChallenge";
import { prettify } from "../../../i18n/translations";
import GuessInput, { NO_FILTERS, type GuessFilters } from "../guessInput";
import ChallengeHints from "../hints";
import GuessList from "../guessList";
import AttributeGrid from "../attributeGrid";
import { CryClue, DescriptionClue, SilhouetteClue, ZoomClue } from "../clues";
import { useChallengeData } from "../shared";
import { PlayBar, SessionEnd, SessionError, SessionLayout, SessionLoading, type SessionProps } from "./common";

export default function ClassicSession(session: SessionProps) {
    const { mode, variant, dateKey, series, onNextRound } = session
    const { target, guesses, wrongCount, attempts, status, stats, reward, guess, giveUp } = useChallenge(mode, variant, dateKey, series)
    const result = useChallengeData(target)
    const [filters, setFilters] = useState<GuessFilters>(NO_FILTERS)

    if (!result) return <SessionLoading />
    if (result.status === 'error') return <SessionError canRetry={variant === 'random' && !series} onRetry={onNextRound} />

    const data = result.data
    const revealed = status !== 'playing'
    const clueProps = { data, revealed, wrongCount, seed: `${dateKey}:${variant}:${target}` }
    const clue = {
        silhueta: <SilhouetteClue {...clueProps} />,
        zoom: <ZoomClue {...clueProps} />,
        descricao: <DescriptionClue {...clueProps} />,
        som: <CryClue {...clueProps} />,
    }[mode as string]

    return (
        <SessionLayout
            clue={clue}
            sticky={!revealed}
            aside={status === 'playing' ? (
                <>
                    <GuessInput guessed={guesses} onGuess={guess} filters={filters} onFiltersChange={setFilters} />
                    <PlayBar count={guesses.length} canGiveUp={variant === 'random' || Boolean(series)} onGiveUp={giveUp} />
                </>
            ) : (
                <SessionEnd
                    session={session}
                    status={status}
                    answer={{ ids: [data.id], label: prettify(data.name) }}
                    attempts={attempts}
                    stats={stats}
                    reward={reward}
                />
            )}
        >
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
        </SessionLayout>
    )
}
