'use client'

import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import type { User } from "@supabase/supabase-js";
import Avatar from "../avatar";
import { getAvatarUrl, useAuth } from "../../context/authContext";
import { useLanguage } from "../../context/languageContext";
import { removeAvatar, updateProfile, uploadAvatar, type Profile } from "../../lib/profile";
import { Field, FormMessage, SubmitButton, UsernameField, useUsernameStatus } from "../auth/shared";
import PokemonPicker from "./pokemonPicker";
import TeamEditor from "./teamEditor";

const MAX_BIO = 280
const MAX_DISPLAY_NAME = 50
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
const UNIQUE_VIOLATION = '23505'
const CARD = 'rounded-3xl bg-white/95 p-6 shadow-xl backdrop-blur-sm dark:bg-zinc-900/95'

type Message = { tone: 'error' | 'success'; text: string } | null

export default function ProfileEditor() {
    const { t } = useLanguage()
    const { user, profile, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (loading) return
        if (!user) router.replace('/entrar')
        else if (!profile?.username) router.replace('/completar-perfil')
    }, [loading, user, profile, router])

    return (
        <section className="flex flex-1 justify-center bg-[url('/regions/hoenn.webp')] bg-cover bg-center px-4 py-10">
            {user && profile?.username ? (
                <ProfileForm key={profile.id} user={user} profile={profile} />
            ) : (
                <p role="status" className={`${CARD} h-fit`}>{t('challengeLoading')}</p>
            )}
        </section>
    )
}

function ProfileForm({ user, profile }: { user: User; profile: Profile }) {
    const { t } = useLanguage()
    const { refreshProfile } = useAuth()
    const [username, setUsername] = useState(profile.username ?? '')
    const [displayName, setDisplayName] = useState(profile.display_name ?? '')
    const [bio, setBio] = useState(profile.bio ?? '')
    const [favorite, setFavorite] = useState(profile.favorite_pokemon)
    const [team, setTeam] = useState(profile.team ?? [])
    const [isPublic, setIsPublic] = useState(profile.is_public)
    const [busy, setBusy] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [message, setMessage] = useState<Message>(null)
    const fileInput = useRef<HTMLInputElement>(null)
    const bioId = useId()
    const checkedStatus = useUsernameStatus(username === profile.username ? '' : username)
    const usernameStatus = username === profile.username ? 'available' : checkedStatus
    const avatarUrl = getAvatarUrl(profile, user)

    const onAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        event.target.value = ''
        if (!file) return
        if (!file.type.startsWith('image/') || file.size > MAX_UPLOAD_BYTES) {
            setMessage({ tone: 'error', text: t('avatarInvalid') })
            return
        }
        setUploading(true)
        setMessage(null)
        try {
            const url = await uploadAvatar(user.id, file)
            await updateProfile(user.id, { avatar_url: url })
            await refreshProfile()
        } catch (error) {
            setMessage({ tone: 'error', text: t('authGenericError', { message: (error as Error).message }) })
        }
        setUploading(false)
    }

    const onRemoveAvatar = async () => {
        setUploading(true)
        setMessage(null)
        try {
            await removeAvatar(user.id)
            await updateProfile(user.id, { avatar_url: null })
            await refreshProfile()
        } catch (error) {
            setMessage({ tone: 'error', text: t('authGenericError', { message: (error as Error).message }) })
        }
        setUploading(false)
    }

    const submit = async (event: FormEvent) => {
        event.preventDefault()
        if (usernameStatus !== 'available') return
        setBusy(true)
        setMessage(null)
        try {
            await updateProfile(user.id, {
                username,
                display_name: displayName.trim() || null,
                bio: bio.trim() || null,
                favorite_pokemon: favorite,
                team,
                is_public: isPublic,
            })
            await refreshProfile()
            setMessage({ tone: 'success', text: t('profileSaved') })
        } catch (error) {
            const { code, message: text } = error as { code?: string; message: string }
            setMessage({ tone: 'error', text: code === UNIQUE_VIOLATION ? t('usernameTaken') : t('authGenericError', { message: text }) })
        }
        setBusy(false)
    }

    return (
        <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${CARD} flex h-fit w-full max-w-2xl flex-col gap-5`}
        >
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-3xl font-black tracking-tight">{t('editProfile')}</h2>
                <Link href={`/u/${profile.username}`} className="text-sm font-bold text-red-600 underline-offset-2 hover:underline dark:text-red-400">
                    {t('viewPublicProfile')} →
                </Link>
            </div>

            <div className="flex flex-wrap items-center gap-5">
                <motion.div animate={{ opacity: uploading ? 0.5 : 1 }} className="rounded-full ring-4 ring-red-600">
                    <Avatar url={avatarUrl} name={displayName || username} className="size-24 text-4xl" />
                </motion.div>
                <div className="flex flex-col gap-2">
                    <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" onChange={onAvatarChange} className="hidden" />
                    <button
                        type="button"
                        disabled={uploading}
                        onClick={() => fileInput.current?.click()}
                        className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-60 dark:bg-white dark:text-zinc-900"
                    >
                        {uploading ? t('sending') : t('uploadPhoto')}
                    </button>
                    {profile.avatar_url && (
                        <button type="button" disabled={uploading} onClick={onRemoveAvatar} className="text-sm font-bold text-red-600 dark:text-red-400">
                            {t('removePhoto')}
                        </button>
                    )}
                    <p className="text-xs text-zinc-500">{t('photoHint')}</p>
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <UsernameField value={username} onChange={setUsername} status={usernameStatus} />
                <Field
                    label={t('displayName')}
                    value={displayName}
                    maxLength={MAX_DISPLAY_NAME}
                    onChange={(event) => setDisplayName(event.target.value)}
                />
            </div>

            <div className="flex flex-col gap-1">
                <label htmlFor={bioId} className="text-sm font-bold">{t('bio')}</label>
                <textarea
                    id={bioId}
                    value={bio}
                    maxLength={MAX_BIO}
                    rows={3}
                    onChange={(event) => setBio(event.target.value)}
                    className="resize-none rounded-xl border-2 border-zinc-300 bg-white px-3 py-2 outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
                />
                <p className="text-right text-xs text-zinc-500">{bio.length}/{MAX_BIO}</p>
            </div>

            <PokemonPicker value={favorite} onChange={setFavorite} />

            <TeamEditor team={team} onChange={setTeam} />

            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-zinc-100 p-4 dark:bg-zinc-800">
                <span>
                    <span className="block font-bold">{t('publicProfile')}</span>
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">{t(isPublic ? 'publicProfileOn' : 'publicProfileOff')}</span>
                </span>
                <input type="checkbox" role="switch" checked={isPublic} onChange={(event) => setIsPublic(event.target.checked)} className="peer sr-only" />
                <span className="relative h-7 w-12 shrink-0 rounded-full bg-zinc-400 transition-colors peer-checked:bg-green-600 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-red-600">
                    <motion.span layout className={`absolute top-1 size-5 rounded-full bg-white shadow ${isPublic ? 'right-1' : 'left-1'}`} />
                </span>
            </label>

            {message && <FormMessage tone={message.tone}>{message.text}</FormMessage>}
            <SubmitButton busy={busy}>{t('save')}</SubmitButton>
        </motion.form>
    )
}
