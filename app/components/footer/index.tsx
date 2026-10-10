'use client'

import Link from "next/link";
import { motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";
import { SITE_NAME } from "../../lib/site";
import ConsentButton from "../ads/consentButton";
import { ADSENSE_CLIENT } from "../../lib/ads";

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="w-full bg-zinc-50 dark:bg-zinc-950">
      <div className="container mx-auto flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex max-w-3xl flex-col gap-1 text-sm text-zinc-500 dark:text-zinc-400">
          <p>
            © 2026 {SITE_NAME} · {t('footerFanProject')} ·{' '}
            <Link href="/sobre" className="underline-offset-2 hover:underline">{t('aboutTitle')}</Link> ·{' '}
            <Link href="/guias" className="underline-offset-2 hover:underline">{t('guidesTitle')}</Link> ·{' '}
            <Link href="/privacidade" className="underline-offset-2 hover:underline">{t('privacyTitle')}</Link> ·{' '}
            <Link href="/termos" className="underline-offset-2 hover:underline">{t('termsTitle')}</Link>
            {ADSENSE_CLIENT && <> · <ConsentButton /></>}
          </p>
          <p className="text-xs">{t('footerTrademarks')}</p>
        </div>
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
