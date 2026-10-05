import { getSupabase } from "./supabase";
import { CHALLENGE_MODES, isChallengeMode, type ChallengeMode, type ChallengeStats } from "./challenge";
import { emptyStatsMap, type StatsMap } from "./progression";

export interface Profile {
    id: string;
    username: string | null;
    display_name: string | null;
    bio: string | null;
    avatar_url: string | null;
    favorite_pokemon: number | null;
    is_public: boolean;
    team: number[];
}

export const TEAM_SIZE = 6

export type ProfileUpdate = Partial<Omit<Profile, 'id'>>

const PROFILE_COLUMNS = 'id, username, display_name, bio, avatar_url, favorite_pokemon, is_public, team'
const AVATAR_BUCKET = 'avatars'
const AVATAR_SIZE = 256

export async function fetchProfileById(id: string) {
    const { data, error } = await getSupabase().from('profiles').select(PROFILE_COLUMNS).eq('id', id).maybeSingle()
    if (error) throw error
    return data as Profile | null
}

export async function fetchProfileByUsername(username: string) {
    const { data, error } = await getSupabase().from('profiles').select(PROFILE_COLUMNS).eq('username', username).maybeSingle()
    if (error) throw error
    return data as Profile | null
}

export async function updateProfile(id: string, changes: ProfileUpdate) {
    const { error } = await getSupabase()
        .from('profiles')
        .update({ ...changes, updated_at: new Date().toISOString() })
        .eq('id', id)
    if (error) throw error
}

export interface ModeSummary {
    mode: ChallengeMode;
    wins: number;
    bestStreak: number;
}

export async function fetchStatsMap(userId: string): Promise<StatsMap> {
    const { data, error } = await getSupabase()
        .from('challenge_progress')
        .select('key, value')
        .eq('user_id', userId)
        .like('key', 'challenge-stats:%')
    if (error) throw error

    const map = emptyStatsMap()
    for (const { key, value } of data as { key: string; value: unknown }[]) {
        const [, mode, variant] = key.split(':')
        if (isChallengeMode(mode) && (variant === 'daily' || variant === 'random')) map[mode][variant] = value as ChallengeStats
    }
    return map
}

export const summarizeStats = (map: StatsMap): ModeSummary[] =>
    CHALLENGE_MODES.map((mode) => {
        const rows = Object.values(map[mode])
        return {
            mode,
            wins: rows.reduce((total, stats) => total + (stats.wins ?? 0), 0),
            bestStreak: Math.max(0, ...rows.map((stats) => stats.bestStreak ?? 0)),
        }
    })

function resizeToSquare(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const image = new Image()
        const url = URL.createObjectURL(file)
        image.onload = () => {
            const side = Math.min(image.width, image.height)
            const canvas = document.createElement('canvas')
            canvas.width = AVATAR_SIZE
            canvas.height = AVATAR_SIZE
            canvas.getContext('2d')?.drawImage(
                image,
                (image.width - side) / 2, (image.height - side) / 2, side, side,
                0, 0, AVATAR_SIZE, AVATAR_SIZE,
            )
            URL.revokeObjectURL(url)
            canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('resize failed')), 'image/webp', 0.85)
        }
        image.onerror = () => {
            URL.revokeObjectURL(url)
            reject(new Error('invalid image'))
        }
        image.src = url
    })
}

async function removeAvatarFiles(userId: string, keep?: string) {
    const storage = getSupabase().storage.from(AVATAR_BUCKET)
    const { data } = await storage.list(userId)
    const stale = (data ?? []).map(({ name }) => `${userId}/${name}`).filter((path) => path !== keep)
    if (stale.length) await storage.remove(stale)
}

export async function uploadAvatar(userId: string, file: File) {
    const blob = await resizeToSquare(file)
    const path = `${userId}/avatar-${Date.now()}.webp`
    const storage = getSupabase().storage.from(AVATAR_BUCKET)
    const { error } = await storage.upload(path, blob, { contentType: 'image/webp', upsert: true })
    if (error) throw error
    await removeAvatarFiles(userId, path)
    return storage.getPublicUrl(path).data.publicUrl
}

export const removeAvatar = (userId: string) => removeAvatarFiles(userId)
