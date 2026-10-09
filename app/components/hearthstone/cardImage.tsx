'use client'

import Image from "next/image";
import { useLanguage } from "../../context/languageContext";
import { cardName, cardRender, parseCardText, type HsCard } from "../../lib/hearthstone";

interface HsCardImageProps {
    card: HsCard
    size?: 256 | 512
    className?: string
    eager?: boolean
}

export function HsCardImage({ card, size = 256, className = '', eager = false }: HsCardImageProps) {
    const { language } = useLanguage()
    return (
        <Image
            src={cardRender(card, language, size)}
            alt={cardName(card, language)}
            width={256}
            height={388}
            unoptimized
            loading={eager ? 'eager' : 'lazy'}
            draggable={false}
            className={`aspect-256/388 h-auto w-full select-none ${className}`}
        />
    )
}

export function CardText({ text, className = '' }: { text: string; className?: string }) {
    return (
        <p className={className}>
            {parseCardText(text).map((part, index) => (
                <span key={index} className={`${part.bold ? 'font-black' : ''} ${part.italic ? 'italic' : ''}`}>
                    {part.text}
                </span>
            ))}
        </p>
    )
}

export function ManaGem({ value, className = 'size-8 text-sm' }: { value: number | string; className?: string }) {
    return (
        <span
            className={`inline-flex shrink-0 items-center justify-center rounded-full border-2 border-sky-200 bg-radial from-sky-300 via-sky-600 to-blue-900 font-black text-white shadow-md [text-shadow:0_1px_2px_rgb(0_0_0/0.8)] ${className}`}
        >
            {value}
        </span>
    )
}
