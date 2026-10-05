import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null

export function getSupabase() {
    client ??= createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        { auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } },
    )
    return client
}

export async function fetchEnabledProviders(): Promise<string[]> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! },
    })
    if (!response.ok) throw new Error(`auth settings ${response.status}`)
    const { external } = await response.json() as { external: Record<string, boolean> }
    return Object.keys(external).filter((provider) => external[provider])
}

export const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,20}$/

export async function isUsernameAvailable(username: string) {
    const { data, error } = await getSupabase().rpc('is_username_available', { name: username })
    if (error) throw error
    return data as boolean
}
