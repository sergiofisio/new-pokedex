'use client'

import { AnimatePresence, motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";
import { useTranslatedText } from "../../hooks/useTranslatedText";
import { COLOR_NAMES, prettify, type MessageKey } from "../../i18n/translations";
import type { ChallengeData } from "../../lib/pokeapi";
import { GENERATIONS } from "../generationMenu";
import type { GuessFilters } from "./guessInput";
import { CARD } from "./shared";

interface Hint {
    at: number;
    label: MessageKey;
    value: string;
    filter?: Partial<GuessFilters>;
}

const namePattern = (name: string) =>
    [...name].map((char, index) => index === 0 || !/[a-z0-9]/i.test(char) ? char : '_').join(' ')

interface ChallengeHintsProps {
    data: ChallengeData;
    wrongCount: number;
    revealed: boolean;
    filters: GuessFilters;
    onApplyFilter: (filter: Partial<GuessFilters>) => void;
}

export default function ChallengeHints({ data, wrongCount, revealed, filters, onApplyFilter }: ChallengeHintsProps) {
    const { t, typeName, language } = useLanguage()
    const genus = useTranslatedText(data.genus)
    const generation = GENERATIONS.find(({ id }) => id === data.generation)
    const name = prettify(data.name)

    const hints: Hint[] = [
        {
            at: 2,
            label: 'generation',
            value: generation ? `${generation.label} · ${generation.region}` : String(data.generation),
            filter: { generation: data.generation },
        },
        { at: 4, label: 'hintMainType', value: typeName(data.types[0]), filter: { type: data.types[0] } },
        { at: 6, label: 'hintTypes', value: data.types.map(typeName).join(' / ') },
        { at: 8, label: 'attrColor', value: COLOR_NAMES[language][data.color] ?? prettify(data.color) },
        { at: 10, label: 'attrStage', value: t('hintStageValue', { n: data.stage }) },
        { at: 12, label: 'hintGenus', value: genus.text },
        { at: 15, label: 'hintFirstLetter', value: name[0] },
        { at: 18, label: 'hintNamePattern', value: namePattern(name) },
    ]
    const next = hints.find((hint) => !revealed && wrongCount < hint.at)
    const isApplied = (filter: Partial<GuessFilters>) =>
        Object.entries(filter).every(([key, value]) => filters[key as keyof GuessFilters] === value)

    return (
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={`${CARD} p-5`}>
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-lg font-black">💡 {t('hintsTitle')}</h3>
                {next && <p className="text-xs font-bold text-zinc-500">{t('nextHintIn', { n: next.at - wrongCount })}</p>}
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
                {hints.map((hint) => {
                    const unlocked = revealed || wrongCount >= hint.at
                    return (
                        <li key={hint.label} className="min-h-14 perspective-midrange">
                            <AnimatePresence mode="wait" initial={false}>
                                {unlocked ? (
                                    <motion.div
                                        key="open"
                                        initial={{ rotateX: -90, opacity: 0 }}
                                        animate={{ rotateX: 0, opacity: 1 }}
                                        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                                        className="flex h-full items-center gap-2 rounded-2xl bg-sky-600 px-3 py-2 text-white shadow"
                                    >
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-[10px] font-black uppercase tracking-wide opacity-80">{t(hint.label)}</span>
                                            <span className="block truncate font-black" title={hint.value}>{hint.value}</span>
                                        </span>
                                        {hint.filter && !revealed && (
                                            <button
                                                type="button"
                                                disabled={isApplied(hint.filter)}
                                                onClick={() => hint.filter && onApplyFilter(hint.filter)}
                                                className="shrink-0 rounded-lg bg-white/20 px-2 py-1 text-[11px] font-black transition-colors hover:bg-white/30 disabled:opacity-60"
                                            >
                                                {isApplied(hint.filter) ? `✓ ${t('filterApplied')}` : t('applyFilter')}
                                            </button>
                                        )}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="locked"
                                        exit={{ rotateX: 90, opacity: 0, transition: { duration: 0.15 } }}
                                        className="flex h-full items-center gap-2 rounded-2xl border-2 border-dashed border-zinc-300 px-3 py-2 text-zinc-500 dark:border-zinc-700"
                                    >
                                        <span aria-hidden="true">🔒</span>
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-[10px] font-black uppercase tracking-wide">{t(hint.label)}</span>
                                            <span className="block text-xs">{t('hintUnlocksAt', { n: hint.at })}</span>
                                        </span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </li>
                    )
                })}
            </ul>
        </motion.section>
    )
}
