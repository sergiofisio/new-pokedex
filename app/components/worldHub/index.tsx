'use client'

import Link from "next/link";
import { motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";
import { useIsClient } from "../../hooks/useIsClient";
import { getLevelInfo, readLocalStatsMap, totalXp } from "../../lib/progression";
import { SITE_NAME } from "../../lib/site";
import { XpBar } from "../progression";
import Pokeball from "../pokeball";
import HsEmblem from "../hsEmblem";
import AdSlot from "../ads/adSlot";
import type { MessageKey } from "../../i18n/translations";

interface Portal {
    href: string
    title: MessageKey
    text: MessageKey
    className: string
    icon: React.ReactNode
    from: number
}

const PORTALS: Portal[] = [
    {
        href: '/pokemon',
        title: 'hubPokemonTitle',
        text: 'hubPokemonText',
        className: 'bg-linear-to-br from-red-500 via-red-600 to-red-800 border-red-300/40',
        icon: <Pokeball />,
        from: -40,
    },
    {
        href: '/hearthstone',
        title: 'hubHearthstoneTitle',
        text: 'hubHearthstoneText',
        className: 'bg-linear-to-br from-amber-700 via-amber-900 to-stone-950 border-amber-300/40',
        icon: <HsEmblem className="size-9" />,
        from: 40,
    },
]

function PlayerLevel() {
    const isClient = useIsClient()
    if (!isClient) return <div className="h-14" />
    return <XpBar info={getLevelInfo(totalXp(readLocalStatsMap()))} compact />
}

export default function WorldHub({ children }: { children?: React.ReactNode }) {
    const { t } = useLanguage()

    return (
        <div className="relative isolate flex w-full flex-1 flex-col overflow-hidden bg-zinc-950 text-white">
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,rgba(239,68,68,0.35),transparent_45%),radial-gradient(circle_at_85%_80%,rgba(217,119,6,0.35),transparent_45%)]" />
            <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-12">
                <motion.header initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                    <p className="text-sm font-black tracking-[0.3em] text-amber-300 uppercase">{SITE_NAME}</p>
                    <h2 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">{t('hubTitle')}</h2>
                    <p className="mx-auto mt-3 max-w-2xl text-zinc-300">{t('hubSubtitle')}</p>
                </motion.header>

                <ul className="grid gap-6 md:grid-cols-2">
                    {PORTALS.map((portal, index) => (
                        <motion.li
                            key={portal.href}
                            initial={{ opacity: 0, x: portal.from }}
                            animate={{ opacity: 1, x: 0, transition: { delay: 0.1 + index * 0.1 } }}
                        >
                            <Link href={portal.href} className="block rounded-3xl focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-amber-300">
                                <motion.div
                                    whileHover={{ y: -8, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`relative flex min-h-64 flex-col justify-between overflow-hidden rounded-3xl border-4 p-7 shadow-2xl ${portal.className}`}
                                >
                                    <span aria-hidden="true" className="absolute -top-16 -right-16 size-56 rounded-full border-24 border-white/10" />
                                    <span className="flex size-16 items-center justify-center rounded-2xl bg-black/25">{portal.icon}</span>
                                    <div className="relative">
                                        <h3 className="text-3xl font-black">{t(portal.title)}</h3>
                                        <p className="mt-2 text-white/85">{t(portal.text)}</p>
                                        <span className="mt-4 inline-flex rounded-full bg-white px-4 py-1.5 text-sm font-black text-zinc-900">
                                            {t('hubEnter')} →
                                        </span>
                                    </div>
                                </motion.div>
                            </Link>
                        </motion.li>
                    ))}
                </ul>

                <AdSlot />

                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
                    className="grid gap-4 md:grid-cols-[2fr_1fr_1fr]"
                >
                    <div className="rounded-3xl bg-white/10 p-5 backdrop-blur-sm">
                        <PlayerLevel />
                    </div>
                    <Link href="/desafios" className="rounded-3xl bg-white/10 p-5 transition-colors hover:bg-white/20">
                        <h3 className="font-black">{t('hubDaily')}</h3>
                        <p className="mt-1 text-sm text-zinc-300">{t('hubDailyText')}</p>
                    </Link>
                    <Link href="/duelo" className="rounded-3xl bg-white/10 p-5 transition-colors hover:bg-white/20">
                        <h3 className="font-black">{t('hubDuel')}</h3>
                        <p className="mt-1 text-sm text-zinc-300">{t('hubDuelText')}</p>
                    </Link>
                </motion.section>
                {children}
            </div>
        </div>
    )
}
