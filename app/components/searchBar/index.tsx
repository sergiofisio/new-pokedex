'use client'

import { useId } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const { t } = useLanguage()
  const inputId = useId()

  return (
    <motion.div
      role="search"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full sm:w-80"
    >
      <label htmlFor={inputId} className="sr-only">{t('searchLabel')}</label>
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="size-4">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </span>
      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => { if (event.key === 'Escape') onChange('') }}
        placeholder={t('searchPlaceholder')}
        autoComplete="off"
        spellCheck={false}
        className="h-11 w-full rounded-full border-2 border-zinc-300 bg-white pl-9 pr-10 text-sm text-black shadow-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white [&::-webkit-search-cancel-button]:hidden"
      />
      <AnimatePresence>
        {value && (
          <motion.button
            type="button"
            onClick={() => onChange('')}
            aria-label={t('clearSearch')}
            initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
            whileTap={{ scale: 0.8 }}
            className="absolute inset-y-0 right-2 my-auto flex size-7 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-200 hover:text-black focus-visible:outline-2 focus-visible:outline-red-500 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            <span aria-hidden="true">✕</span>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
