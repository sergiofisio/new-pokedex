'use client'

import { useEffect, useRef } from "react";
import { useLanguage } from "../../context/languageContext";
import { ADSENSE_CLIENT, AD_SLOTS, type AdSlotName } from "../../lib/ads";

declare global {
    interface Window {
        adsbygoogle?: unknown[]
    }
}

const HEIGHTS: Record<AdSlotName, string> = {
    banner: 'min-h-[100px]',
    sidebar: 'min-h-[280px]',
}

export default function AdSlot({ slot = 'banner', className = '' }: { slot?: AdSlotName; className?: string }) {
    const { t } = useLanguage()
    const ref = useRef<HTMLModElement>(null)
    const id = AD_SLOTS[slot]

    useEffect(() => {
        const element = ref.current
        if (!element || element.dataset.adsbygoogleStatus) return
        try {
            (window.adsbygoogle = window.adsbygoogle ?? []).push({})
        } catch {}
    }, [])

    if (!ADSENSE_CLIENT || !id) return null

    return (
        <aside aria-label={t('adLabel')} className={`flex w-full flex-col items-center gap-1 ${className}`}>
            <span className="text-[10px] font-bold tracking-widest text-current/50 uppercase">{t('adLabel')}</span>
            <ins
                ref={ref}
                className={`adsbygoogle block w-full ${HEIGHTS[slot]}`}
                data-ad-client={ADSENSE_CLIENT}
                data-ad-slot={id}
                data-ad-format="auto"
                data-full-width-responsive="true"
            />
        </aside>
    )
}
