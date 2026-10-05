'use client'

import Link from "next/link";
import { motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="w-full bg-zinc-50 dark:bg-zinc-950">
      <div className="container mx-auto flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 py-3">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">© 2026 Pokedex · {t('footerFanProject')}</p>
        <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link
            href="/apoiar"
            className="flex items-center gap-2 rounded-full bg-red-600 px-4 py-1.5 text-sm font-bold text-white shadow-md"
          >
            <motion.span
              aria-hidden="true"
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1.5 }}
            >
              ♥
            </motion.span>
            {t('supportProject')}
          </Link>
        </motion.span>
      </div>
    </footer>
  );
}
