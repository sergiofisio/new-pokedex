'use client'

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import PokedexModal from "../pokedexModal";
import { useLanguage } from "../../context/languageContext";
import { useAuth } from "../../context/authContext";
import { useIsClient } from "../../hooks/useIsClient";
import { getDateKey, getSessionKind, supportsDaily, type ChallengeMode, type ChallengeVariant } from "../../lib/challenge";
import ChallengeBackdrop from "./backdrop";
import VariantToggle from "./variantToggle";
import { MODE_META, ModeIcon } from "./modes";
import { CARD } from "./shared";
import ClassicSession from "./sessions/classic";
import FusionSession from "./sessions/fusion";
import GymSession from "./sessions/gym";
import type { SessionProps } from "./sessions/common";

const NO_NAVIGATION: number[] = []

export function ChallengeSession(props: SessionProps) {
    const kind = getSessionKind(props.mode)
    if (kind === 'fusion') return <FusionSession {...props} />
    if (kind === 'gym') return <GymSession {...props} />
    return <ClassicSession {...props} />
}

export default function ChallengeGame({ mode }: { mode: ChallengeMode }) {
    const { t } = useLanguage()
    const { progressVersion } = useAuth()
    const isClient = useIsClient()
    const daily = supportsDaily(mode)
    const [variant, setVariant] = useState<ChallengeVariant>(daily ? 'daily' : 'random')
    const [round, setRound] = useState(0)
    const [dateKey, setDateKey] = useState(getDateKey)
    const [pokedexId, setPokedexId] = useState<number | null>(null)
    const meta = MODE_META[mode]

    return (
        <ChallengeBackdrop generation={meta.generation}>
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6">
                <Link
                    href="/desafios"
                    className="w-fit rounded-full bg-white/90 px-3 py-1 text-sm font-bold shadow transition-colors hover:bg-white dark:bg-zinc-900/90 dark:hover:bg-zinc-900"
                >
                    ← {t('backToChallenges')}
                </Link>

                <motion.header
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-4 rounded-3xl p-5 text-white shadow-xl ${meta.accent}`}
                >
                    <ModeIcon mode={mode} className="size-12 shrink-0" />
                    <div>
                        <h2 className="text-2xl font-black">{t(meta.title)}</h2>
                        <p className="text-sm opacity-90">{t(meta.description)}</p>
                    </div>
                </motion.header>

                {daily && (
                    <VariantToggle
                        value={variant}
                        onChange={(next) => { setVariant(next); setRound((value) => value + 1) }}
                    />
                )}

                {isClient ? (
                    <ChallengeSession
                        key={`${variant}:${dateKey}:${round}:${progressVersion}`}
                        mode={mode}
                        variant={variant}
                        dateKey={dateKey}
                        onNextRound={() => setRound((value) => value + 1)}
                        onNewDay={() => setDateKey(getDateKey())}
                        onShowPokedex={setPokedexId}
                    />
                ) : (
                    <p className={`${CARD} p-5`}>{t('challengeLoading')}</p>
                )}
            </div>

            <PokedexModal
                speciesId={pokedexId}
                navigationIds={NO_NAVIGATION}
                onClose={() => setPokedexId(null)}
                onNavigate={setPokedexId}
            />
        </ChallengeBackdrop>
    )
}
