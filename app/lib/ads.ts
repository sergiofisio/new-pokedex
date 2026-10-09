export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? ''

export const AD_SLOTS = {
    banner: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER ?? '',
    sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR ?? '',
} as const

export type AdSlotName = keyof typeof AD_SLOTS

export const adsEnabled = () => Boolean(ADSENSE_CLIENT)
