'use client'

import { motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";
import type { ChallengeVariant } from "../../lib/challenge";
import type { MessageKey } from "../../i18n/translations";

const OPTIONS: { value: ChallengeVariant; label: MessageKey }[] = [
    { value: 'daily', label: 'variantDaily' },
    { value: 'random', label: 'variantRandom' },
]

export default function VariantToggle({ value, onChange }: { value: ChallengeVariant; onChange: (variant: ChallengeVariant) => void }) {
    const { t } = useLanguage()

    return (
        <div role="group" aria-label={t('variantLabel')} className="flex w-fit rounded-xl bg-white/90 p-1 shadow-md dark:bg-zinc-900/90">
            {OPTIONS.map((option) => {
                const active = value === option.value
                return (
                    <motion.button
                        key={option.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => onChange(option.value)}
                        whileTap={{ scale: 0.94 }}
                        className={`relative rounded-lg px-4 py-1.5 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 ${
                            active ? 'text-white' : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white'
                        }`}
                    >
                        {active && <motion.span layoutId="variant-indicator" className="absolute inset-0 rounded-lg bg-red-600" />}
                        <span className="relative">{t(option.label)}</span>
                    </motion.button>
                )
            })}
        </div>
    )
}
