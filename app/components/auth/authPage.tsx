'use client'

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import type { Provider } from "@supabase/supabase-js";
import { useLanguage } from "../../context/languageContext";
import { useAuth } from "../../context/authContext";
import { useAsyncData } from "../../hooks/useAsyncData";
import { fetchEnabledProviders, getSupabase } from "../../lib/supabase";
import type { MessageKey } from "../../i18n/translations";
import { AuthShell, Field, FormMessage, SubmitButton, UsernameField, describeAuthError, useUsernameStatus } from "./shared";

type Tab = 'signIn' | 'signUp'
type Message = { tone: 'error' | 'success'; text: string } | null

const AFTER_SIGN_IN = '/desafios'
const callbackUrl = () => `${window.location.origin}/auth/callback`
const PROVIDERS_KEY = 'providers'
const loadProviders = () => fetchEnabledProviders()

const PROVIDERS: { id: Provider; label: MessageKey; icon: ReactNode; className: string }[] = [
    {
        id: 'google',
        label: 'continueWithGoogle',
        className: 'bg-white text-zinc-900 ring-1 ring-zinc-300 dark:ring-zinc-600',
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5">
                <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12Z" />
            </svg>
        ),
    },
    {
        id: 'github',
        label: 'continueWithGithub',
        className: 'bg-zinc-900 text-white dark:bg-zinc-800',
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="currentColor">
                <path d="M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.9 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5Z" />
            </svg>
        ),
    },
]

export default function AuthPage() {
    const { t } = useLanguage()
    const { user, profile, loading } = useAuth()
    const router = useRouter()
    const [tab, setTab] = useState<Tab>('signIn')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [busy, setBusy] = useState(false)
    const [message, setMessage] = useState<Message>(null)
    const usernameStatus = useUsernameStatus(username)
    const providersResult = useAsyncData(PROVIDERS_KEY, loadProviders)
    const enabled = providersResult?.status === 'success' ? providersResult.data : []
    const providers = PROVIDERS.filter((provider) => enabled.includes(provider.id))

    useEffect(() => {
        if (loading || !user) return
        router.replace(profile?.username ? AFTER_SIGN_IN : '/completar-perfil')
    }, [loading, user, profile, router])

    const switchTab = (next: Tab) => {
        setTab(next)
        setMessage(null)
    }

    const signInWithProvider = async (provider: Provider) => {
        setMessage(null)
        const { error } = await getSupabase().auth.signInWithOAuth({ provider, options: { redirectTo: callbackUrl() } })
        if (error) setMessage({ tone: 'error', text: describeAuthError(error, t) })
    }

    const submit = async (event: FormEvent) => {
        event.preventDefault()
        if (tab === 'signUp' && usernameStatus !== 'available') return
        setBusy(true)
        setMessage(null)
        const auth = getSupabase().auth

        if (tab === 'signIn') {
            const { error } = await auth.signInWithPassword({ email, password })
            if (error) setMessage({ tone: 'error', text: describeAuthError(error, t) })
        } else {
            const { data, error } = await auth.signUp({
                email,
                password,
                options: { data: { username }, emailRedirectTo: callbackUrl() },
            })
            if (error) setMessage({ tone: 'error', text: describeAuthError(error, t) })
            else if (!data.session) setMessage({ tone: 'success', text: t('checkEmail', { email }) })
        }
        setBusy(false)
    }

    return (
        <AuthShell title={t('authTitle')} subtitle={t('authSubtitle')}>
            {providers.length > 0 && (
                <>
                    <div className="flex flex-col gap-2">
                        {providers.map((provider) => (
                            <motion.button
                                key={provider.id}
                                type="button"
                                onClick={() => signInWithProvider(provider.id)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                className={`flex items-center justify-center gap-3 rounded-xl py-2.5 font-bold shadow-sm ${provider.className}`}
                            >
                                {provider.icon}
                                {t(provider.label)}
                            </motion.button>
                        ))}
                    </div>

                    <p className="my-5 flex items-center gap-3 text-xs font-bold uppercase tracking-wide text-zinc-500 before:h-px before:flex-1 before:bg-zinc-300 after:h-px after:flex-1 after:bg-zinc-300 dark:before:bg-zinc-700 dark:after:bg-zinc-700">
                        {t('orWithEmail')}
                    </p>
                </>
            )}

            <div role="tablist" className="mb-4 grid grid-cols-2 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
                {(['signIn', 'signUp'] as const).map((option) => (
                    <button
                        key={option}
                        type="button"
                        role="tab"
                        aria-selected={tab === option}
                        onClick={() => switchTab(option)}
                        className={`relative rounded-lg py-1.5 text-sm font-bold ${tab === option ? 'text-white' : 'text-zinc-600 dark:text-zinc-300'}`}
                    >
                        {tab === option && <motion.span layoutId="auth-tab" className="absolute inset-0 rounded-lg bg-red-600" />}
                        <span className="relative">{t(option)}</span>
                    </button>
                ))}
            </div>

            <form onSubmit={submit} className="flex flex-col gap-3">
                {tab === 'signUp' && <UsernameField value={username} onChange={setUsername} status={usernameStatus} />}
                <Field label={t('email')} type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
                <Field
                    label={t('password')}
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete={tab === 'signIn' ? 'current-password' : 'new-password'}
                    minLength={6}
                    required
                    hint={tab === 'signUp' ? <span className="text-zinc-500">{t('passwordHint')}</span> : undefined}
                />
                {message && <FormMessage tone={message.tone}>{message.text}</FormMessage>}
                <SubmitButton busy={busy}>{t(tab)}</SubmitButton>
            </form>
        </AuthShell>
    )
}
