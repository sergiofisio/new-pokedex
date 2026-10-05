import { getSupabase } from "./supabase";
import { isProgressKey, type ChallengeStats } from "./challenge";

const TABLE = 'challenge_progress'
const UPLOAD_DELAY = 800

function mergeValues(key: string, local: unknown, remote: unknown) {
    if (local === undefined) return remote
    if (remote === undefined) return local
    if (key.startsWith('challenge-stats:')) {
        const a = local as ChallengeStats
        const b = remote as ChallengeStats
        if (a.wins !== b.wins) return a.wins > b.wins ? a : b
        return a.bestStreak >= b.bestStreak ? a : b
    }
    if (Array.isArray(local) && Array.isArray(remote)) return [...new Set([...local, ...remote])]
    return local
}

function readLocalProgress() {
    const progress: Record<string, unknown> = {}
    for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index)
        if (!key || !isProgressKey(key)) continue
        try {
            progress[key] = JSON.parse(localStorage.getItem(key) ?? 'null')
        } catch {}
    }
    return progress
}

export function clearLocalProgress() {
    Object.keys(readLocalProgress()).forEach((key) => localStorage.removeItem(key))
}

export async function syncProgress(userId: string) {
    const supabase = getSupabase()
    const { data, error } = await supabase.from(TABLE).select('key, value')
    if (error) throw error

    const remote: Record<string, unknown> = Object.fromEntries(data.map(({ key, value }) => [key, value]))
    const local = readLocalProgress()
    const updatedAt = new Date().toISOString()
    const rows = []

    for (const key of new Set([...Object.keys(local), ...Object.keys(remote)])) {
        if (!isProgressKey(key)) continue
        const merged = mergeValues(key, local[key], remote[key])
        localStorage.setItem(key, JSON.stringify(merged))
        if (JSON.stringify(merged) !== JSON.stringify(remote[key])) {
            rows.push({ user_id: userId, key, value: merged, updated_at: updatedAt })
        }
    }

    if (rows.length) {
        const { error: upsertError } = await supabase.from(TABLE).upsert(rows)
        if (upsertError) throw upsertError
    }
}

let syncUserId: string | null = null
let uploadTimer: ReturnType<typeof setTimeout> | undefined
const pendingUploads = new Map<string, unknown>()

export function setSyncUser(userId: string | null) {
    syncUserId = userId
    if (!userId) pendingUploads.clear()
}

async function flushUploads() {
    const userId = syncUserId
    if (!userId || pendingUploads.size === 0) return
    const updatedAt = new Date().toISOString()
    const rows = [...pendingUploads].map(([key, value]) => ({ user_id: userId, key, value, updated_at: updatedAt }))
    pendingUploads.clear()
    const { error } = await getSupabase().from(TABLE).upsert(rows)
    if (error) console.error(error)
}

export function queueUpload(key: string, value: unknown) {
    if (!syncUserId) return
    pendingUploads.set(key, value)
    clearTimeout(uploadTimer)
    uploadTimer = setTimeout(flushUploads, UPLOAD_DELAY)
}
