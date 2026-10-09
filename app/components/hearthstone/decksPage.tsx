'use client'

import { useCallback, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";
import { useAuth } from "../../context/authContext";
import { useAsyncData } from "../../hooks/useAsyncData";
import { CLASS_COLORS, hsLabel, type HsData } from "../../lib/hearthstone";
import { decodeDeck, type Deck } from "../../lib/hsDeck";
import { deleteDeck, listDecks, type SavedDeck } from "../../lib/hsSavedDecks";
import type { MessageKey } from "../../i18n/translations";
import DeckBuilder, { type BuilderState } from "./deckBuilder";
import MetaDecks from "./metaDecks";
import { useHsData } from "./data";

type Tab = 'builder' | 'meta' | 'saved'

const TABS: { id: Tab; label: MessageKey }[] = [
    { id: 'builder', label: 'decksTabBuilder' },
    { id: 'meta', label: 'decksTabMeta' },
    { id: 'saved', label: 'decksTabSaved' },
]

export default function DecksPage({ initialCode }: { initialCode?: string }) {
    const { t } = useLanguage()
    const state = useHsData()

    if (!state) return <div className="h-64 animate-pulse rounded-3xl bg-white/10" />
    if (state.status === 'error') return <p role="alert" className="rounded-2xl bg-red-900/50 p-6 text-center font-bold">{t('hsLoadError')}</p>
    return <Decks data={state.data} initialCode={initialCode} />
}

function initialBuilder(data: HsData, code: string | undefined, label: string): BuilderState {
    if (!code) return { deck: null, name: '' }
    const result = decodeDeck(data, code)
    return 'error' in result ? { deck: null, name: '' } : { deck: result.deck, name: label }
}

function Decks({ data, initialCode }: { data: HsData; initialCode?: string }) {
    const { t } = useLanguage()
    const [tab, setTab] = useState<Tab>(initialCode ? 'builder' : 'meta')
    const [builder, setBuilder] = useState<BuilderState>(() => initialBuilder(data, initialCode, t('deckShared')))
    const [savedVersion, setSavedVersion] = useState(0)

    const open = (deck: Deck, name: string, savedId?: string) => {
        setBuilder({ deck, name, savedId })
        setTab('builder')
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div role="tablist" className="flex rounded-2xl border-2 border-amber-700/60 bg-black/25 p-1">
                    {TABS.map(({ id, label }) => (
                        <button
                            key={id}
                            type="button"
                            role="tab"
                            aria-selected={tab === id}
                            onClick={() => setTab(id)}
                            className="relative rounded-xl px-4 py-2 text-sm font-black"
                        >
                            {tab === id && <motion.span layoutId="decks-tab" className="absolute inset-0 rounded-xl bg-amber-400" />}
                            <span className={`relative ${tab === id ? 'text-amber-950' : ''}`}>{t(label)}</span>
                        </button>
                    ))}
                </div>
                <Link href="/hearthstone/colecao" className="rounded-xl bg-black/30 px-4 py-2 text-sm font-black text-amber-200 hover:bg-black/50">
                    📦 {t('collectionTitle')} →
                </Link>
            </div>

            {tab === 'builder' && <DeckBuilder data={data} state={builder} onChange={setBuilder} onSaved={() => setSavedVersion((value) => value + 1)} />}
            {tab === 'meta' && <MetaDecks data={data} onOpen={(deck, name) => open(deck, name)} />}
            {tab === 'saved' && <SavedDecks key={savedVersion} data={data} onOpen={open} />}
        </div>
    )
}

function SavedDecks({ data, onOpen }: { data: HsData; onOpen: (deck: Deck, name: string, savedId?: string) => void }) {
    const { t, language } = useLanguage()
    const { user, loading } = useAuth()
    const [version, setVersion] = useState(0)
    const userId = loading ? null : user?.id ?? null
    const load = useCallback((key: string) => listDecks(key.startsWith('user:') ? key.split(':')[1] : null), [])
    const result = useAsyncData(`${userId ? `user:${userId}` : 'local'}:${version}`, load)

    if (loading || !result) return <div className="h-32 animate-pulse rounded-3xl bg-white/10" />
    if (result.status === 'error') return <p role="alert" className="rounded-2xl bg-red-900/50 p-6 text-center font-bold">{t('deckSaveError')}</p>

    const remove = async (deck: SavedDeck) => {
        if (!confirm(t('deckDeleteConfirm', { name: deck.name }))) return
        await deleteDeck(userId, deck.id)
        setVersion((value) => value + 1)
    }

    if (result.data.length === 0) {
        return <p className="rounded-3xl bg-black/25 p-8 text-center font-bold">{t('decksSavedEmpty')}</p>
    }

    return (
        <ul className="grid gap-3 md:grid-cols-2">
            {result.data.map((saved) => {
                const decoded = decodeDeck(data, saved.code)
                return (
                    <motion.li key={saved.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 rounded-2xl border-2 border-amber-700/40 bg-black/25 p-4">
                        <span className="h-12 w-2 shrink-0 rounded-full" style={{ backgroundColor: CLASS_COLORS[saved.class] }} />
                        <span className="min-w-0 flex-1">
                            <span className="block truncate font-black">{saved.name}</span>
                            <span className="block text-xs font-bold text-amber-200/75">
                                {hsLabel(saved.class, language)} · {t(saved.format === 'standard' ? 'hsFormatStandard' : 'hsFormatWild')} · {new Date(saved.updated_at).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en')}
                            </span>
                        </span>
                        <button
                            type="button"
                            disabled={'error' in decoded}
                            onClick={() => 'deck' in decoded && onOpen(decoded.deck, saved.name, saved.id)}
                            className="rounded-xl bg-amber-400 px-3 py-1.5 text-sm font-black text-amber-950 disabled:opacity-40"
                        >
                            {t('deckOpen')}
                        </button>
                        <button type="button" onClick={() => remove(saved)} aria-label={t('deckDelete')} className="rounded-xl bg-black/35 px-2.5 py-1.5 text-sm hover:bg-red-700">
                            🗑️
                        </button>
                    </motion.li>
                )
            })}
        </ul>
    )
}
