'use client'

import { useMemo } from "react";
import { useChallenge } from "../../../hooks/useChallenge";
import { useLanguage } from "../../../context/languageContext";
import { HS_POOL, cardClassLabel, cardName, hsLabel, setName, type HsCard, type HsData } from "../../../lib/hearthstone";
import { HsCardImage } from "../../hearthstone/cardImage";
import { useCardText, useHsData } from "../../hearthstone/data";
import CardGuessInput from "../cardGuessInput";
import CardAttributeGrid, { CardGuessList } from "../cardAttributeGrid";
import { CardArtClue, CardTextClue } from "../cardClues";
import { HintBoard, type Hint } from "../hints";
import { PlayBar, SessionEnd, SessionError, SessionLayout, SessionLoading, type SessionProps } from "./common";

const namePattern = (name: string) =>
    [...name].map((char, index) => index === 0 || !/[\p{L}\p{N}]/u.test(char) ? char : '_').join(' ')

export default function CardSession(session: SessionProps) {
    const state = useHsData()
    if (!state) return <SessionLoading />
    if (state.status === 'error') return <SessionError canRetry={false} onRetry={session.onNextRound} />
    return <CardRound session={session} data={state.data} />
}

function CardRound({ session, data }: { session: SessionProps; data: HsData }) {
    const { mode, variant, dateKey, series } = session
    const { language } = useLanguage()
    const { solution, guesses, wrongCount, attempts, status, stats, reward, guess, giveUp } = useChallenge(mode, variant, dateKey, series)
    const pool = useMemo(() => HS_POOL.flatMap((dbfId) => data.byDbf.get(dbfId) ?? []), [data])
    const card = data.byDbf.get(solution[0])

    if (!card) return <SessionError canRetry={variant === 'random' && !series} onRetry={session.onNextRound} />

    const revealed = status !== 'playing'
    const guessedCards = guesses.flatMap((dbfId) => data.byDbf.get(dbfId) ?? [])
    const clue = mode === 'hs-arte'
        ? <CardArtClue card={card} revealed={revealed} wrongCount={wrongCount} />
        : mode === 'hs-texto'
            ? <CardTextClue card={card} revealed={revealed} wrongCount={wrongCount} />
            : undefined

    return (
        <SessionLayout
            clue={clue}
            sticky={!revealed}
            aside={status === 'playing' ? (
                <>
                    <CardGuessInput cards={pool} guessed={guesses} onGuess={guess} />
                    <PlayBar count={guesses.length} canGiveUp={variant === 'random' || Boolean(series)} onGiveUp={giveUp} />
                </>
            ) : (
                <SessionEnd
                    session={session}
                    status={status}
                    answer={{
                        ids: [card.dbfId],
                        label: cardName(card, language),
                        artwork: <span className="mx-auto block w-[106px]"><HsCardImage card={card} eager /></span>,
                    }}
                    attempts={attempts}
                    stats={stats}
                    reward={reward}
                />
            )}
        >
            {mode === 'hs-atributos' ? (
                <CardAttributeGrid data={data} guesses={guessedCards} target={card} />
            ) : (
                <>
                    <CardHints data={data} card={card} mode={mode} wrongCount={wrongCount} revealed={revealed} />
                    <CardGuessList data={data} guesses={guessedCards} target={card} />
                </>
            )}
        </SessionLayout>
    )
}

interface CardHintsProps {
    data: HsData
    card: HsCard
    mode: SessionProps['mode']
    wrongCount: number
    revealed: boolean
}

function CardHints({ data, card, mode, wrongCount, revealed }: CardHintsProps) {
    const { t, language } = useLanguage()
    const text = useCardText(card)
    const name = cardName(card, language)
    const set = data.sets[card.set]

    const classHint = { label: t('hsFilterClass'), value: cardClassLabel(card, language) }
    const typeHint = { label: t('hsFilterType'), value: hsLabel(card.type, language) }
    const costHint = { label: t('hsFilterCost'), value: String(card.cost) }
    const setHint = { label: t('hsFilterSet'), value: `${setName(set, language)} (${set.year})` }
    const rarityHint = { label: t('hsFilterRarity'), value: hsLabel(card.rarity, language) }
    const flavorHint = { label: t('hsFlavor'), value: text?.text && text.flavor ? text.flavor : setHint.value }

    const ordered = mode === 'hs-texto'
        ? [typeHint, costHint, classHint, rarityHint, text?.text && text.flavor ? flavorHint : setHint]
        : [classHint, typeHint, costHint, setHint, rarityHint]

    const hints: Hint[] = [
        ...ordered.map((hint, index) => ({ ...hint, at: (index + 1) * 2 })),
        { at: 12, label: t('hintFirstLetter'), value: name[0] },
        { at: 15, label: t('hintNamePattern'), value: namePattern(name) },
    ]
    return <HintBoard hints={hints} wrongCount={wrongCount} revealed={revealed} />
}
