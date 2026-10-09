'use client'

import PokedexModal from "../pokedexModal";
import HsCardModal from "../hearthstone/cardModal";
import { useHsData } from "../hearthstone/data";
import type { GameWorld } from "../../lib/challenge";

const NO_NAVIGATION: number[] = []

interface DetailModalProps {
    world: GameWorld
    id: number | null
    onClose: () => void
    onNavigate: (id: number) => void
}

export default function DetailModal({ world, id, onClose, onNavigate }: DetailModalProps) {
    if (world === 'hearthstone') return <CardDetailModal id={id} onClose={onClose} />
    return <PokedexModal speciesId={id} navigationIds={NO_NAVIGATION} onClose={onClose} onNavigate={onNavigate} />
}

function CardDetailModal({ id, onClose }: { id: number | null; onClose: () => void }) {
    const state = useHsData()
    return <HsCardModal data={state?.status === 'success' ? state.data : null} dbfId={id} onClose={onClose} />
}
