interface BrowserTranslator {
    translate: (text: string) => Promise<string>;
}

interface TranslatorFactory {
    availability: (options: { sourceLanguage: string; targetLanguage: string }) => Promise<string>;
    create: (options: { sourceLanguage: string; targetLanguage: string }) => Promise<BrowserTranslator>;
}

const OPTIONS = { sourceLanguage: 'en', targetLanguage: 'pt' }

let translatorRequest: Promise<BrowserTranslator | null> | null = null
const translations = new Map<string, Promise<string | null>>()

function getTranslator() {
    translatorRequest ??= (async () => {
        const factory = (globalThis as { Translator?: TranslatorFactory }).Translator
        if (!factory) return null
        if (await factory.availability(OPTIONS) === 'unavailable') return null
        return factory.create(OPTIONS)
    })().catch(() => null)
    return translatorRequest
}

export function translateToPortuguese(text: string) {
    if (!text.trim()) return Promise.resolve(null)

    const cached = translations.get(text)
    if (cached) return cached

    const request = getTranslator()
        .then((translator) => translator?.translate(text) ?? null)
        .catch(() => {
            translations.delete(text)
            return null
        })
    translations.set(text, request)
    return request
}
