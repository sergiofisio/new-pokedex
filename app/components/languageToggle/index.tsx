'use client'

import { motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";
import type { Language } from "../../i18n/translations";

const OPTIONS: { value: Language; label: string; name: string }[] = [
  { value: 'pt', label: 'PT', name: 'Português' },
  { value: 'en', label: 'EN', name: 'English' },
]

export default function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <div role="group" aria-label={t('language')} className="flex rounded-lg border border-white/40 p-0.5">
      {OPTIONS.map((option) => {
        const isActive = language === option.value
        return (
          <motion.button
            key={option.value}
            type="button"
            lang={option.value === 'pt' ? 'pt-BR' : 'en'}
            aria-label={option.name}
            aria-pressed={isActive}
            onClick={() => setLanguage(option.value)}
            whileTap={{ scale: 0.9 }}
            className={`relative cursor-pointer rounded-md px-2 py-1 text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${
              isActive ? 'text-red-700' : 'hover:bg-white/20'
            }`}
          >
            {isActive && (
              <motion.span layoutId="language-indicator" className="absolute inset-0 rounded-md bg-white" />
            )}
            <span className="relative">{option.label}</span>
          </motion.button>
        )
      })}
    </div>
  )
}
