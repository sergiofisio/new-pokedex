'use client'

import { useSyncExternalStore } from "react";
import { useLanguage } from "../../context/languageContext";
import { useAsyncData } from "../../hooks/useAsyncData";
import { loadHsData, loadHsTexts, type HsCard } from "../../lib/hearthstone";
import { getCollection, getServerCollection, subscribeCollection } from "../../lib/hsCollection";
import type { Language } from "../../i18n/translations";

export const useCollection = () => useSyncExternalStore(subscribeCollection, getCollection, getServerCollection)

const loadTexts = (language: string) => loadHsTexts(language as Language)

export const useHsData = () => useAsyncData('hs-cards', loadHsData)

export function useHsTexts() {
    const { language } = useLanguage()
    return useAsyncData(language, loadTexts)
}

export function useCardText(card: HsCard | undefined) {
    const texts = useHsTexts()
    if (!card || texts?.status !== 'success') return null
    const [text = '', flavor = ''] = texts.data[card.dbfId] ?? []
    return { text, flavor }
}
