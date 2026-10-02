'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import {
    ITEM_NAMES_PT,
    MESSAGES,
    STAT_NAMES,
    TYPE_NAMES,
    prettify,
    type Language,
    type MessageKey,
} from "../i18n/translations";

const STORAGE_KEY = 'language'
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
    listeners.add(listener)
    window.addEventListener('storage', listener)
    return () => {
        listeners.delete(listener)
        window.removeEventListener('storage', listener)
    }
}

const getSnapshot = (): Language => localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'pt'
const getServerSnapshot = (): Language => 'pt'

interface LanguageContextValue {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: MessageKey, params?: Record<string, string | number>) => string;
    typeName: (type: string) => string;
    statName: (stat: string) => string;
    itemName: (item: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
    const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

    useEffect(() => {
        document.documentElement.lang = language === 'pt' ? 'pt-BR' : 'en'
    }, [language])

    const setLanguage = useCallback((next: Language) => {
        localStorage.setItem(STORAGE_KEY, next)
        listeners.forEach((listener) => listener())
    }, [])

    const value = useMemo<LanguageContextValue>(() => ({
        language,
        setLanguage,
        t: (key, params = {}) =>
            MESSAGES[language][key].replace(/\{(\w+)\}/g, (match, name) => String(params[name] ?? match)),
        typeName: (type) => TYPE_NAMES[language][type] ?? prettify(type),
        statName: (stat) => STAT_NAMES[language][stat] ?? prettify(stat),
        itemName: (item) => (language === 'pt' ? ITEM_NAMES_PT[item] : undefined) ?? prettify(item),
    }), [language, setLanguage])

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (!context) throw new Error('useLanguage precisa estar dentro de <LanguageProvider>')
    return context
}
