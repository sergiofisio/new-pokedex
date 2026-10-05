'use client'

import { useEffect, useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { motion } from "motion/react";
import type { AuthError } from "@supabase/supabase-js";
import { useLanguage } from "../../context/languageContext";
import { USERNAME_PATTERN, isUsernameAvailable } from "../../lib/supabase";
import type { MessageKey } from "../../i18n/translations";

const USERNAME_CHECK_DELAY = 400

export const AUTH_CARD = 'w-full max-w-md rounded-3xl bg-white/95 p-6 shadow-2xl backdrop-blur-sm dark:bg-zinc-900/95'

export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
    return (
        <section className="flex flex-1 items-start justify-center bg-[url('/regions/kanto.webp')] bg-cover bg-center px-4 py-10">
            <motion.div initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={AUTH_CARD}>
                <h2 className="text-center text-3xl font-black tracking-tight">{title}</h2>
                {subtitle && <p className="mt-1 text-center text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>}
                <div className="mt-6">{children}</div>
            </motion.div>
        </section>
    )
}

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    hint?: ReactNode;
}

export function Field({ label, hint, ...props }: FieldProps) {
    const id = useId()
    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="text-sm font-bold">{label}</label>
            <input
                id={id}
                aria-describedby={hint ? `${id}-hint` : undefined}
                className="rounded-xl border-2 border-zinc-300 bg-white px-3 py-2 outline-none transition-colors focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:border-red-500"
                {...props}
            />
            {hint && <p id={`${id}-hint`} className="text-xs">{hint}</p>}
        </div>
    )
}

export type UsernameStatus = 'empty' | 'invalid' | 'checking' | 'available' | 'taken' | 'error'

export function useUsernameStatus(username: string): UsernameStatus {
    const [result, setResult] = useState<{ name: string; available: boolean | null } | null>(null)
    const valid = USERNAME_PATTERN.test(username)

    useEffect(() => {
        if (!valid) return
        let ignore = false
        const timer = setTimeout(() => {
            isUsernameAvailable(username).then(
                (available) => { if (!ignore) setResult({ name: username, available }) },
                () => { if (!ignore) setResult({ name: username, available: null }) },
            )
        }, USERNAME_CHECK_DELAY)
        return () => {
            ignore = true
            clearTimeout(timer)
        }
    }, [username, valid])

    if (!username) return 'empty'
    if (!valid) return 'invalid'
    if (result?.name !== username) return 'checking'
    if (result.available === null) return 'error'
    return result.available ? 'available' : 'taken'
}

const USERNAME_HINTS: Record<UsernameStatus, { key: MessageKey; className: string }> = {
    empty: { key: 'usernameInvalid', className: 'text-zinc-500' },
    invalid: { key: 'usernameInvalid', className: 'text-red-600 dark:text-red-400' },
    checking: { key: 'usernameChecking', className: 'text-zinc-500' },
    available: { key: 'usernameAvailable', className: 'text-green-600 dark:text-green-400' },
    taken: { key: 'usernameTaken', className: 'text-red-600 dark:text-red-400' },
    error: { key: 'usernameCheckError', className: 'text-amber-600' },
}

export function UsernameField({ value, onChange, status }: { value: string; onChange: (value: string) => void; status: UsernameStatus }) {
    const { t } = useLanguage()
    const hint = USERNAME_HINTS[status]
    return (
        <Field
            label={t('username')}
            value={value}
            onChange={(event) => onChange(event.target.value.trim())}
            autoComplete="username"
            maxLength={20}
            required
            aria-invalid={status === 'invalid' || status === 'taken'}
            hint={<span className={hint.className}>{t(hint.key)}</span>}
        />
    )
}

export function SubmitButton({ busy, children }: { busy: boolean; children: ReactNode }) {
    const { t } = useLanguage()
    return (
        <motion.button
            type="submit"
            disabled={busy}
            whileHover={{ scale: busy ? 1 : 1.02 }}
            whileTap={{ scale: busy ? 1 : 0.97 }}
            className="w-full rounded-xl bg-red-600 py-2.5 font-black text-white shadow-md transition-opacity disabled:opacity-60"
        >
            {busy ? t('sending') : children}
        </motion.button>
    )
}

export function FormMessage({ tone, children }: { tone: 'error' | 'success'; children: ReactNode }) {
    return (
        <motion.p
            role={tone === 'error' ? 'alert' : 'status'}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                tone === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200'
            }`}
        >
            {children}
        </motion.p>
    )
}

export function describeAuthError(error: AuthError | Error, t: (key: MessageKey, params?: Record<string, string>) => string) {
    const code = 'code' in error ? error.code : undefined
    if (code === 'invalid_credentials') return t('authInvalidCredentials')
    if (code === 'user_already_exists' || code === 'email_exists') return t('authEmailTaken')
    if (code === 'email_not_confirmed') return t('authEmailNotConfirmed')
    return t('authGenericError', { message: error.message })
}
