'use client'

import { useLanguage } from "../../context/languageContext";
import { ADSENSE_CLIENT } from "../../lib/ads";

declare global {
    interface Window {
        googlefc?: { callbackQueue?: unknown[]; showRevocationMessage?: () => void }
    }
}

export default function ConsentButton({ className = '' }: { className?: string }) {
    const { t } = useLanguage()
    if (!ADSENSE_CLIENT) return null

    const open = () => {
        window.googlefc = window.googlefc ?? {}
        window.googlefc.callbackQueue = window.googlefc.callbackQueue ?? []
        window.googlefc.callbackQueue.push(() => window.googlefc?.showRevocationMessage?.())
    }

    return (
        <button type="button" onClick={open} className={`underline-offset-2 hover:underline ${className}`}>
            {t('consentManage')}
        </button>
    )
}
