'use client'

import Link from "next/link";
import { motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";
import type { MessageKey } from "../../i18n/translations";

export default function HsPageHeader({ title, text }: { title: MessageKey; text: MessageKey }) {
    const { t } = useLanguage()
    return (
        <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1">
            <Link href="/hearthstone" className="w-fit text-sm font-bold text-amber-300 underline-offset-2 hover:underline">
                ← {t('hsTitle')}
            </Link>
            <h2 className="text-3xl font-black tracking-tight text-amber-100 sm:text-4xl">{t(title)}</h2>
            <p className="text-amber-100/75">{t(text)}</p>
        </motion.header>
    )
}
