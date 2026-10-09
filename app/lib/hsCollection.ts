import { getSupabase } from "./supabase";
import { canonicalId, maxCopies, type HsCard } from "./hearthstone";

export type Collection = Record<number, number>

const STORAGE_KEY = 'hs-collection'
const TABLE = 'hs_collection'
const UPLOAD_DELAY = 1000
const UPSERT_CHUNK = 500

let collection: Collection = {}
let loaded = false
let userId: string | null = null
let uploadTimer: ReturnType<typeof setTimeout> | undefined
const pending = new Map<number, number>()
const listeners = new Set<() => void>()
const EMPTY: Collection = {}

function load() {
    if (loaded || typeof window === 'undefined') return
    loaded = true
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
        if (parsed && typeof parsed === 'object') collection = parsed
    } catch {}
}

function emit() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collection))
    listeners.forEach((listener) => listener())
}

export function subscribeCollection(listener: () => void) {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
}

export function getCollection() {
    load()
    return collection
}

export const getServerCollection = () => EMPTY

export const ownedCopies = (owned: Collection, card: HsCard) =>
    card.rarity === 'FREE' || card.bundled ? maxCopies(card) : Math.min(maxCopies(card), owned[canonicalId(card)] ?? 0)

async function flush() {
    if (!userId || pending.size === 0) return
    const rows = [...pending].map(([dbf_id, count]) => ({ user_id: userId, dbf_id, count, updated_at: new Date().toISOString() }))
    pending.clear()
    const supabase = getSupabase()
    const removed = rows.filter((row) => row.count === 0).map((row) => row.dbf_id)
    const kept = rows.filter((row) => row.count > 0)
    for (let index = 0; index < kept.length; index += UPSERT_CHUNK) {
        const { error } = await supabase.from(TABLE).upsert(kept.slice(index, index + UPSERT_CHUNK))
        if (error) console.error(error)
    }
    if (removed.length) {
        const { error } = await supabase.from(TABLE).delete().in('dbf_id', removed)
        if (error) console.error(error)
    }
}

function queue(changes: Map<number, number>) {
    if (!userId) return
    changes.forEach((count, dbfId) => pending.set(dbfId, count))
    clearTimeout(uploadTimer)
    uploadTimer = setTimeout(flush, UPLOAD_DELAY)
}

export function setCopies(entries: [HsCard, number][]) {
    load()
    const next = { ...collection }
    const changes = new Map<number, number>()
    for (const [card, count] of entries) {
        const id = canonicalId(card)
        const value = Math.max(0, Math.min(maxCopies(card), count))
        if ((next[id] ?? 0) === value) continue
        if (value === 0) delete next[id]
        else next[id] = value
        changes.set(id, value)
    }
    if (changes.size === 0) return
    collection = next
    emit()
    queue(changes)
}

export function clearCollection() {
    load()
    const changes = new Map(Object.keys(collection).map((id) => [Number(id), 0]))
    collection = {}
    emit()
    queue(changes)
}

export async function syncCollection(nextUserId: string | null) {
    userId = nextUserId
    if (!nextUserId) {
        pending.clear()
        return
    }
    load()
    const { data, error } = await getSupabase().from(TABLE).select('dbf_id, count')
    if (error) throw error
    const remote: Collection = Object.fromEntries(data.map(({ dbf_id, count }) => [dbf_id, count]))
    const merged: Collection = { ...remote }
    const changes = new Map<number, number>()
    for (const [id, count] of Object.entries(collection)) {
        const dbfId = Number(id)
        if (count > (remote[dbfId] ?? 0)) {
            merged[dbfId] = count
            changes.set(dbfId, count)
        }
    }
    collection = merged
    emit()
    queue(changes)
}
