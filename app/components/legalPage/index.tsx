'use client'

import { motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";
import { LEGAL, LEGAL_UPDATED, type LegalDoc } from "../../lib/legal";
import ConsentButton from "../ads/consentButton";

export default function LegalPage({ doc }: { doc: LegalDoc }) {
    const { t, language } = useLanguage()
    const updated = new Date(`${LEGAL_UPDATED}T12:00:00`).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', { dateStyle: 'long' })

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
            <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-4xl font-black tracking-tight">{t(doc === 'privacy' ? 'privacyTitle' : 'termsTitle')}</h2>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{t('legalUpdated', { date: updated })}</p>
            </motion.header>
            {LEGAL[doc][language].map((section, index) => (
                <motion.section
                    key={section.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.05 * index } }}
                    className="flex flex-col gap-2"
                >
                    <h3 className="text-xl font-black">{section.title}</h3>
                    {section.paragraphs.map((paragraph) => (
                        <p key={paragraph} className="leading-relaxed text-zinc-700 dark:text-zinc-300">{paragraph}</p>
                    ))}
                </motion.section>
            ))}
            {doc === 'privacy' && <ConsentButton className="w-fit font-bold text-red-600 dark:text-red-400" />}
        </div>
    )
}
