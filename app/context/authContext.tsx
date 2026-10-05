'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabase } from "../lib/supabase";
import { onProgressWrite } from "../lib/challenge";
import { clearLocalProgress, queueUpload, setSyncUser, syncProgress } from "../lib/progressSync";
import { fetchProfileById, type Profile } from "../lib/profile";

export const getAvatarUrl = (profile: Profile | null, user: User | null) =>
    profile?.avatar_url ?? (user?.user_metadata?.avatar_url as string | undefined) ?? null

interface AuthContextValue {
    user: User | null;
    profile: Profile | null;
    loading: boolean;
    progressVersion: number;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [progressVersion, setProgressVersion] = useState(0)
    const syncedUserId = useRef<string | null>(null)

    const loadProfile = useCallback(async (userId: string) => {
        try {
            setProfile(await fetchProfileById(userId))
        } catch (error) {
            console.error(error)
            setProfile(null)
        }
    }, [])

    useEffect(() => onProgressWrite(queueUpload), [])

    useEffect(() => {
        const handleSession = (session: Session | null) => {
            const nextUser = session?.user ?? null
            setUser(nextUser)
            setSyncUser(nextUser?.id ?? null)

            if (!nextUser) {
                syncedUserId.current = null
                setProfile(null)
                setLoading(false)
                return
            }
            if (syncedUserId.current === nextUser.id) return
            syncedUserId.current = nextUser.id

            const sync = syncProgress(nextUser.id)
                .then(() => setProgressVersion((version) => version + 1))
                .catch((error) => console.error(error))
            Promise.all([loadProfile(nextUser.id), sync]).finally(() => setLoading(false))
        }

        const { data: { subscription } } = getSupabase().auth.onAuthStateChange((_event, session) => {
            setTimeout(() => handleSession(session), 0)
        })
        return () => subscription.unsubscribe()
    }, [loadProfile])

    const signOut = useCallback(async () => {
        await getSupabase().auth.signOut()
        clearLocalProgress()
        setProgressVersion((version) => version + 1)
    }, [])

    const refreshProfile = useCallback(async () => {
        if (user) await loadProfile(user.id)
    }, [user, loadProfile])

    return (
        <AuthContext.Provider value={{ user, profile, loading, progressVersion, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth precisa estar dentro de <AuthProvider>')
    return context
}
