import { useLanguage } from "../context/languageContext";
import { translateToPortuguese } from "../lib/translate";
import { useAsyncData } from "./useAsyncData";

export function useTranslatedText(text: string) {
    const { language } = useLanguage()
    const translation = useAsyncData(language === 'pt' ? text : '', translateToPortuguese)

    if (language !== 'pt' || translation?.status !== 'success' || !translation.data) {
        return { text, translated: false }
    }
    return { text: translation.data, translated: true }
}
