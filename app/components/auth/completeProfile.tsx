'use client'

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../context/languageContext";
import { useAuth } from "../../context/authContext";
import { getSupabase } from "../../lib/supabase";
import { AuthShell, FormMessage, SubmitButton, UsernameField, useUsernameStatus } from "./shared";

const UNIQUE_VIOLATION = '23505'

export default function CompleteProfile() {
    const { t } = useLanguage()
    const { user, profile, loading, refreshProfile } = useAuth()
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const status = useUsernameStatus(username)

    useEffect(() => {
        if (loading) return
        if (!user) router.replace('/entrar')
        else if (profile?.username) router.replace('/desafios')
    }, [loading, user, profile, router])

    const submit = async (event: FormEvent) => {
        event.preventDefault()
        if (!user || status !== 'available') return
        setBusy(true)
        setError(null)
        const metadata = user.user_metadata ?? {}
        const { error: updateError } = await getSupabase()
            .from('profiles')
            .update({
                username,
                display_name: (profile?.display_name ?? metadata.full_name ?? metadata.name ?? null)?.slice(0, 50) ?? null,
                avatar_url: profile?.avatar_url ?? metadata.avatar_url ?? null,
            })
            .eq('id', user.id)
        if (updateError) {
            setError(updateError.code === UNIQUE_VIOLATION ? t('usernameTaken') : t('authGenericError', { message: updateError.message }))
            setBusy(false)
            return
        }
        await refreshProfile()
    }

    return (
        <AuthShell title={t('completeProfileTitle')} subtitle={t('completeProfileSubtitle')}>
            <form onSubmit={submit} className="flex flex-col gap-3">
                <UsernameField value={username} onChange={setUsername} status={status} />
                {error && <FormMessage tone="error">{error}</FormMessage>}
                <SubmitButton busy={busy}>{t('save')}</SubmitButton>
            </form>
        </AuthShell>
    )
}
