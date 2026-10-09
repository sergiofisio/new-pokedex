import { getSupabase } from "./supabase";
import type { HsFormat } from "./hearthstone";

export interface SavedDeck {
    id: string
    name: string
    class: string
    format: HsFormat
    code: string
    updated_at: string
}

const STORAGE_KEY = 'hs-decks'
const TABLE = 'hs_decks'
const COLUMNS = 'id, name, class, format, code, updated_at'

function readLocal(): SavedDeck[] {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

const writeLocal = (decks: SavedDeck[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(decks))

export async function listDecks(userId: string | null): Promise<SavedDeck[]> {
    if (!userId) return readLocal().sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    const supabase = getSupabase()
    const local = readLocal()
    if (local.length) {
        const { error } = await supabase.from(TABLE).insert(local.map(({ name, class: cls, format, code }) => ({ name, class: cls, format, code })))
        if (error) throw error
        writeLocal([])
    }
    const { data, error } = await supabase.from(TABLE).select(COLUMNS).order('updated_at', { ascending: false })
    if (error) throw error
    return data as SavedDeck[]
}

export async function saveDeck(userId: string | null, deck: Omit<SavedDeck, 'id' | 'updated_at'> & { id?: string }): Promise<SavedDeck> {
    const updated_at = new Date().toISOString()
    if (!userId) {
        const saved: SavedDeck = { ...deck, id: deck.id ?? crypto.randomUUID(), updated_at }
        writeLocal([saved, ...readLocal().filter((item) => item.id !== saved.id)])
        return saved
    }
    const supabase = getSupabase()
    const row = { name: deck.name, class: deck.class, format: deck.format, code: deck.code, updated_at }
    const query = deck.id
        ? supabase.from(TABLE).update(row).eq('id', deck.id)
        : supabase.from(TABLE).insert(row)
    const { data, error } = await query.select(COLUMNS).single()
    if (error) throw error
    return data as SavedDeck
}

export async function deleteDeck(userId: string | null, id: string) {
    if (!userId) {
        writeLocal(readLocal().filter((deck) => deck.id !== id))
        return
    }
    const { error } = await getSupabase().from(TABLE).delete().eq('id', id)
    if (error) throw error
}
