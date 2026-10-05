'use client'

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../context/languageContext";
import { useAuth } from "../../context/authContext";
import { useIsClient } from "../../hooks/useIsClient";
import { AuthShell, FormMessage } from "./shared";

const getUrlError = () => {
    const params = new URLSearchParams(window.location.search)
    const hash = new URLSearchParams(window.location.hash.slice(1))
    return params.get('error_description') ?? hash.get('error_description')
}

export default function AuthCallback() {
    const { t } = useLanguage()
    const { user, profile, loading } = useAuth()
    const router = useRouter()
    const isClient = useIsClient()
    const urlError = isClient ? getUrlError() : null

    useEffect(() => {
        if (loading || !user) return
        router.replace(profile?.username ? '/desafios' : '/completar-perfil')
    }, [loading, user, profile, router])

    const failed = urlError || (!loading && !user)

    return (
        <AuthShell title={failed ? t('authTitle') : t('authCallbackLoading')}>
            {failed ? (
                <div className="flex flex-col gap-4">
                    <FormMessage tone="error">{t('authCallbackError', { message: urlError ?? '-' })}</FormMessage>
                    <Link href="/entrar" className="text-center font-bold text-red-600 underline-offset-2 hover:underline dark:text-red-400">
                        {t('backToSignIn')}
                    </Link>
                </div>
            ) : (
                <div className="mx-auto size-12 animate-spin rounded-full border-4 border-zinc-200 border-t-red-600" role="status" aria-label={t('authCallbackLoading')} />
            )}
        </AuthShell>
    )
}
