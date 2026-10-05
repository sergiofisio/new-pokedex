import type { ChallengeMode } from "../../lib/challenge";
import type { MessageKey } from "../../i18n/translations";

export const MODE_META: Record<ChallengeMode, { title: MessageKey; description: MessageKey; generation: number; accent: string }> = {
    silhueta: { title: 'modeSilhueta', description: 'modeSilhuetaDesc', generation: 4, accent: 'bg-zinc-800' },
    descricao: { title: 'modeDescricao', description: 'modeDescricaoDesc', generation: 2, accent: 'bg-sky-600' },
    zoom: { title: 'modeZoom', description: 'modeZoomDesc', generation: 7, accent: 'bg-amber-500' },
    som: { title: 'modeSom', description: 'modeSomDesc', generation: 3, accent: 'bg-rose-600' },
    fusao: { title: 'modeFusao', description: 'modeFusaoDesc', generation: 5, accent: 'bg-fuchsia-600' },
    ginasio: { title: 'modeGinasio', description: 'modeGinasioDesc', generation: 1, accent: 'bg-emerald-600' },
    infinito: { title: 'modeInfinito', description: 'modeInfinitoDesc', generation: 8, accent: 'bg-violet-600' },
}

export function ModeIcon({ mode, className = 'size-10' }: { mode: ChallengeMode; className?: string }) {
    const common = { viewBox: '0 0 24 24', 'aria-hidden': true, className, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
    switch (mode) {
        case 'silhueta':
            return (
                <svg {...common}>
                    <circle cx="12" cy="12" r="9" fill="currentColor" stroke="none" opacity="0.25" />
                    <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14" />
                    <circle cx="12" cy="17" r="0.6" fill="currentColor" />
                </svg>
            )
        case 'descricao':
            return (
                <svg {...common}>
                    <rect x="5" y="3" width="14" height="18" rx="2" />
                    <path d="M9 8h6M9 12h6M9 16h4" />
                </svg>
            )
        case 'zoom':
            return (
                <svg {...common}>
                    <circle cx="10.5" cy="10.5" r="6.5" />
                    <path d="m20 20-4.5-4.5M10.5 8v5M8 10.5h5" />
                </svg>
            )
        case 'som':
            return (
                <svg {...common}>
                    <path d="M4 10v4h4l5 4V6L8 10H4Z" fill="currentColor" fillOpacity="0.25" />
                    <path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11" />
                </svg>
            )
        case 'fusao':
            return (
                <svg {...common}>
                    <circle cx="9" cy="12" r="5.5" fill="currentColor" fillOpacity="0.25" />
                    <circle cx="15" cy="12" r="5.5" />
                    <path d="M12 8.5v7" />
                </svg>
            )
        case 'ginasio':
            return (
                <svg {...common}>
                    <path d="M3 10 12 4l9 6" />
                    <path d="M5 10v9h14v-9" />
                    <path d="M9 19v-5h6v5" fill="currentColor" fillOpacity="0.25" />
                </svg>
            )
        case 'infinito':
            return (
                <svg {...common}>
                    <path d="M12 12c-2-2.7-3.6-4-5.5-4a4 4 0 0 0 0 8c1.9 0 3.5-1.3 5.5-4Zm0 0c2 2.7 3.6 4 5.5 4a4 4 0 0 0 0-8c-1.9 0-3.5 1.3-5.5 4Z" />
                </svg>
            )
    }
}
