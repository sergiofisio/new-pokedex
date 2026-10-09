import { getSupabase } from "./supabase";
import { getRandomTarget, isChallengeMode, type ChallengeMode } from "./challenge";

export const DUEL_ROUNDS = 5
export const DUEL_MODES: ChallengeMode[] = ['silhueta', 'descricao', 'zoom', 'som', 'fusao', 'ginasio', 'hs-atributos', 'hs-arte', 'hs-texto']
export const LIVE_ROUND_SECONDS = 60
export const LIVE_COUNTDOWN_SECONDS = 3

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const CODE_LENGTH = 6
const TIME_BONUS = 50
const TIME_BONUS_WINDOW_MS = 90_000
const UNIQUE_VIOLATION = '23505'

export type DuelKind = 'async' | 'live'

export interface DuelRoundResult {
    solved: boolean;
    attempts: number;
    ms: number;
    score: number;
}

export interface DuelResult {
    user_id: string;
    player_name: string;
    rounds: DuelRoundResult[];
    score: number;
    finished_at: string;
}

export interface Duel {
    id: string;
    code: string;
    mode: ChallengeMode;
    kind: DuelKind;
    rounds: number[];
    created_by: string;
    creator_name: string;
    created_at: string;
    expires_at: string;
    duel_results: DuelResult[];
}

export const normalizeCode = (code: string) => code.trim().toUpperCase()

export const isDuelCode = (code: string) => new RegExp(`^[${CODE_ALPHABET}]{${CODE_LENGTH}}$`).test(code)

function generateCode() {
    const bytes = crypto.getRandomValues(new Uint8Array(CODE_LENGTH))
    return Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join('')
}

function pickRounds(mode: ChallengeMode) {
    const rounds: number[] = []
    while (rounds.length < DUEL_ROUNDS) {
        const target = getRandomTarget(mode, rounds.at(-1))
        if (!rounds.includes(target)) rounds.push(target)
    }
    return rounds
}

export function scoreRound(solved: boolean, attempts: number, ms: number) {
    if (!solved) return 0
    const base = Math.max(0, 100 - 15 * (attempts - 1))
    const bonus = Math.round(TIME_BONUS * Math.max(0, 1 - ms / TIME_BONUS_WINDOW_MS))
    return base + bonus
}

const DUEL_COLUMNS = 'id, code, mode, kind, rounds, created_by, creator_name, created_at, expires_at, duel_results (user_id, player_name, rounds, score, finished_at)'

export async function createDuel(mode: ChallengeMode, kind: DuelKind, creatorName: string) {
    const rounds = pickRounds(mode)
    for (let attempt = 0; attempt < 5; attempt++) {
        const code = generateCode()
        const { error } = await getSupabase().from('duels').insert({ code, mode, kind, rounds, creator_name: creatorName })
        if (!error) return code
        if (error.code !== UNIQUE_VIOLATION) throw error
    }
    throw new Error('Could not generate a duel code')
}

export async function fetchDuel(code: string) {
    const { data, error } = await getSupabase().from('duels').select(DUEL_COLUMNS).eq('code', code).maybeSingle()
    if (error) throw error
    const duel = data as Duel | null
    return duel && isChallengeMode(duel.mode) ? duel : null
}

export async function fetchRecentDuels(userId: string) {
    const supabase = getSupabase()
    const { data: played, error: playedError } = await supabase
        .from('duel_results')
        .select('duel_id')
        .eq('user_id', userId)
        .order('finished_at', { ascending: false })
        .limit(20)
    if (playedError) throw playedError

    const playedIds = (played as { duel_id: string }[]).map(({ duel_id }) => duel_id)
    const filter = playedIds.length ? `created_by.eq.${userId},id.in.(${playedIds.join(',')})` : `created_by.eq.${userId}`
    const { data, error } = await supabase
        .from('duels')
        .select(DUEL_COLUMNS)
        .or(filter)
        .order('created_at', { ascending: false })
        .limit(20)
    if (error) throw error
    return (data as Duel[]).filter(({ mode }) => isChallengeMode(mode))
}

export async function saveDuelResult(duelId: string, playerName: string, rounds: DuelRoundResult[]) {
    const score = rounds.reduce((total, round) => total + round.score, 0)
    const { error } = await getSupabase()
        .from('duel_results')
        .insert({ duel_id: duelId, player_name: playerName, rounds, score })
    if (error && error.code !== UNIQUE_VIOLATION) throw error
    return score
}

export const getDuelUrl = (code: string) => `${window.location.origin}/duelo/${code}`

export async function shareDuel(code: string, text: string) {
    const url = getDuelUrl(code)
    if (navigator.share) {
        try {
            await navigator.share({ title: 'Pokédex', text, url })
            return 'shared'
        } catch (error) {
            if ((error as Error).name === 'AbortError') return 'cancelled'
        }
    }
    await navigator.clipboard.writeText(url)
    return 'copied'
}
