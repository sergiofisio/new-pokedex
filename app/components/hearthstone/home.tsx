'use client'

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";
import { useIsClient } from "../../hooks/useIsClient";
import { getDateKey } from "../../lib/challenge";
import { hash } from "../../lib/seed";
import { CLASS_COLORS, HS_POOL, HS_HERO_CLASSES, hsLabel, setName, type HsData } from "../../lib/hearthstone";
import type { MessageKey } from "../../i18n/translations";
import HsEmblem from "../hsEmblem";
import { HsCardImage } from "./cardImage";
import HsCardModal from "./cardModal";
import { useHsData } from "./data";

const SECTIONS: { href: string; title: MessageKey; text: MessageKey; icon: string; className: string }[] = [
    { href: '/hearthstone/cartas', title: 'hsLibrary', text: 'hsLibraryDesc', icon: '📚', className: 'from-sky-700 to-indigo-900' },
    { href: '/desafios/hs-atributos', title: 'hsHearthdle', text: 'hsHearthdleDesc', icon: '🃏', className: 'from-amber-500 to-orange-800' },
    { href: '/hearthstone/decks', title: 'hsDecks', text: 'hsDecksDesc', icon: '🛠️', className: 'from-emerald-700 to-teal-900' },
]

const BASICS: { title: MessageKey; text: MessageKey }[] = [
    { title: 'hsBasicsMana', text: 'hsBasicsManaText' },
    { title: 'hsBasicsClasses', text: 'hsBasicsClassesText' },
    { title: 'hsBasicsFormats', text: 'hsBasicsFormatsText' },
    { title: 'hsBasicsDust', text: 'hsBasicsDustText' },
]

const PANEL = 'rounded-3xl border-2 border-amber-700/40 bg-black/25 p-5 shadow-xl backdrop-blur-sm'

export default function HsHome() {
    const { t } = useLanguage()
    const state = useHsData()
    const data = state?.status === 'success' ? state.data : null

    return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10">
            <motion.header
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-4 text-center"
            >
                <motion.span
                    animate={{ rotate: [0, 6, -6, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <HsEmblem className="size-20 drop-shadow-[0_0_24px_rgba(251,191,36,0.5)]" />
                </motion.span>
                <h2 className="text-4xl font-black tracking-tight text-amber-300 sm:text-5xl">{t('hsTitle')}</h2>
                <p className="max-w-2xl text-amber-100/85">{t('hsSubtitle')}</p>
                {data && (
                    <p className="flex flex-wrap justify-center gap-2 text-sm font-bold">
                        <span className="rounded-full bg-black/30 px-3 py-1">{t('hsStatsCards', { n: data.unique.length.toLocaleString() })}</span>
                        <span className="rounded-full bg-black/30 px-3 py-1">{t('hsStatsSets', { n: data.sets.length })}</span>
                    </p>
                )}
            </motion.header>

            <ul className="grid gap-5 md:grid-cols-3">
                {SECTIONS.map((section, index) => (
                    <motion.li key={section.href} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 + index * 0.08 } }}>
                        <Link href={section.href} className="block h-full rounded-3xl focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-amber-400">
                            <motion.div
                                whileHover={{ y: -6, scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                className={`relative flex h-full min-h-44 flex-col gap-3 overflow-hidden rounded-3xl border-4 border-amber-400/30 bg-linear-to-br p-6 text-white shadow-xl ${section.className}`}
                            >
                                <span aria-hidden="true" className="text-4xl">{section.icon}</span>
                                <h3 className="text-2xl font-black">{t(section.title)}</h3>
                                <p className="text-sm text-white/85">{t(section.text)}</p>
                            </motion.div>
                        </Link>
                    </motion.li>
                ))}
            </ul>

            {data && <FeaturedCard data={data} />}

            <section className={PANEL}>
                <h3 className="text-2xl font-black text-amber-300">{t('hsClassesTitle')}</h3>
                <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {HS_HERO_CLASSES.map((cls) => (
                        <li key={cls}>
                            <ClassLink cls={cls} count={data?.unique.filter((card) => card.classes.includes(cls)).length} />
                        </li>
                    ))}
                </ul>
            </section>

            <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
                <section className={PANEL}>
                    <h3 className="text-2xl font-black text-amber-300">{t('hsBasicsTitle')}</h3>
                    <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                        {BASICS.map((item) => (
                            <div key={item.title} className="rounded-2xl bg-black/20 p-4">
                                <dt className="font-black">{t(item.title)}</dt>
                                <dd className="mt-1 text-sm text-amber-100/80">{t(item.text)}</dd>
                            </div>
                        ))}
                    </dl>
                </section>
                {data && <StandardSets data={data} />}
            </div>
        </div>
    )
}

function ClassLink({ cls, count }: { cls: string; count?: number }) {
    const { t, language } = useLanguage()
    return (
        <Link href={`/hearthstone/cartas?classe=${cls}`} className="block rounded-2xl focus-visible:outline-4 focus-visible:outline-amber-400">
            <motion.span
                whileHover={{ scale: 1.04, y: -3 }}
                whileTap={{ scale: 0.96 }}
                style={{ backgroundColor: CLASS_COLORS[cls] }}
                className="flex items-center justify-between gap-2 rounded-2xl border-2 border-white/20 px-4 py-3 font-black text-white shadow-md [text-shadow:0_1px_2px_rgb(0_0_0/0.7)]"
            >
                {hsLabel(cls, language)}
                {count !== undefined && <span className="text-xs opacity-85">{t('hsClassCards', { n: count })}</span>}
            </motion.span>
        </Link>
    )
}

function StandardSets({ data }: { data: HsData }) {
    const { t, language } = useLanguage()
    const standard = data.sets.filter((set) => set.standard).reverse()
    return (
        <section className={PANEL}>
            <h3 className="text-xl font-black text-amber-300">{t('hsStandardSets')}</h3>
            <ul className="mt-3 flex flex-col gap-1.5 text-sm">
                {standard.map((set) => (
                    <li key={set.id} className="flex justify-between gap-2 rounded-xl bg-black/20 px-3 py-2">
                        <span className="font-bold">{setName(set, language)}</span>
                        <span className="text-amber-200/70">{set.year}</span>
                    </li>
                ))}
            </ul>
        </section>
    )
}

function FeaturedCard({ data }: { data: HsData }) {
    const { t } = useLanguage()
    const isClient = useIsClient()
    const [selected, setSelected] = useState<number | null>(null)
    if (!isClient) return null
    const card = data.byDbf.get(HS_POOL[hash(`featured:${getDateKey()}`) % HS_POOL.length])
    if (!card) return null

    return (
        <section className={`${PANEL} flex flex-col items-center gap-6 sm:flex-row`}>
            <motion.button
                type="button"
                initial={{ rotateY: 180, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 80, damping: 14, delay: 0.3 }}
                whileHover={{ scale: 1.05, rotate: -2 }}
                onClick={() => setSelected(card.dbfId)}
                className="w-44 shrink-0 rounded-2xl"
            >
                <HsCardImage card={card} />
            </motion.button>
            <div className="text-center sm:text-left">
                <p className="text-sm font-black tracking-widest text-amber-300 uppercase">{t('hsFeatured')}</p>
                <p className="mt-2 text-amber-100/85">{t('hsFeaturedText')}</p>
                <Link href="/desafios/hs-atributos" className="mt-4 inline-flex rounded-full bg-amber-400 px-5 py-2 font-black text-amber-950 shadow-md hover:bg-amber-300">
                    {t('hsPlayHearthdle')} →
                </Link>
            </div>
            <HsCardModal data={data} dbfId={selected} onClose={() => setSelected(null)} />
        </section>
    )
}
