'use client'

import { useLanguage } from "../../context/languageContext";
import type { MessageKey } from "../../i18n/translations";

const TONES = {
    light: 'bg-white/90 text-zinc-700 shadow-lg dark:bg-zinc-900/90 dark:text-zinc-300 [&_h2]:text-zinc-900 dark:[&_h2]:text-white [&_dt]:text-zinc-900 dark:[&_dt]:text-white',
    dark: 'bg-black/35 text-white/80 backdrop-blur-sm [&_h2]:text-white [&_dt]:text-white',
    tavern: 'border-2 border-amber-700/40 bg-black/25 text-amber-100/85 backdrop-blur-sm [&_h2]:text-amber-300 [&_dt]:text-amber-200',
} as const

interface PageGuideProps {
    title: MessageKey;
    titleVars?: Record<string, MessageKey>;
    paragraphs?: MessageKey[];
    faq?: [question: MessageKey, answer: MessageKey][];
    tone?: keyof typeof TONES;
    className?: string;
}

export default function PageGuide({ title, titleVars, paragraphs = [], faq = [], tone = 'light', className = '' }: PageGuideProps) {
    const { t } = useLanguage()
    return (
        <section className={`flex flex-col gap-3 rounded-3xl p-6 leading-relaxed ${TONES[tone]} ${className}`}>
            <h2 className="text-xl font-black">{t(title, Object.fromEntries(Object.entries(titleVars ?? {}).map(([name, key]) => [name, t(key)])))}</h2>
            {paragraphs.map((key) => <p key={key}>{t(key)}</p>)}
            {faq.length > 0 && (
                <dl className="grid gap-4 md:grid-cols-2">
                    {faq.map(([question, answer]) => (
                        <div key={question}>
                            <dt className="font-black">{t(question)}</dt>
                            <dd className="mt-1 text-sm">{t(answer)}</dd>
                        </div>
                    ))}
                </dl>
            )}
        </section>
    )
}
