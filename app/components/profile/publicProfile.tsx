'use client'

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import Avatar from "../avatar";
import PokedexModal from "../pokedexModal";
import PokemonCard from "../pokemonCard";
import type { Species } from "../../lib/pokeapi";
import { useAuth } from "../../context/authContext";
import { useLanguage } from "../../context/languageContext";
import { useAsyncData } from "../../hooks/useAsyncData";
import { fetchProfileByUsername } from "../../lib/profile";
import { getOfficialArtwork } from "../../lib/sprites";
import { useSpeciesName } from "../challenge/shared";
import ProfileProgress from "./profileProgress";

const CARD = 'rounded-3xl bg-white/95 p-6 shadow-xl backdrop-blur-sm dark:bg-zinc-900/95'
const NO_NAVIGATION: number[] = []
const SPECIES_URL = `${process.env.NEXT_PUBLIC_POKEMON_API_URL}pokemon-species/`

const toSpecies = (id: number): Species => ({ name: String(id), url: `${SPECIES_URL}${id}/` })
const sortedTeam = (team: number[]) => [...team].sort((a, b) => a - b)

const loadProfile = (key: string) => fetchProfileByUsername(key.split('\n')[0])

export default function PublicProfile({ username }: { username: string }) {
    const { t } = useLanguage()
    const { user, loading, progressVersion } = useAuth()
    const profileResult = useAsyncData(`${username}\n${user?.id ?? ''}`, loadProfile)
    const result = loading ? null : profileResult
    const getName = useSpeciesName()
    const [navigation, setNavigation] = useState<{ id: number; ids: number[] } | null>(null)

    const profile = result?.status === 'success' ? result.data : null
    const isOwner = Boolean(user && profile && user.id === profile.id)

    return (
        <section className="flex flex-1 justify-center bg-[url('/regions/kalos.webp')] bg-cover bg-center px-4 py-10">
            {!result ? (
                <p role="status" className={`${CARD} h-fit`}>{t('challengeLoading')}</p>
            ) : !profile ? (
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={`${CARD} h-fit max-w-md text-center`}>
                    <p className="text-5xl" aria-hidden="true">🔒</p>
                    <h2 className="mt-3 text-2xl font-black">{t('profileUnavailable')}</h2>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{t('profileUnavailableHint', { name: username })}</p>
                </motion.div>
            ) : (
                <div className="flex h-fit w-full max-w-2xl flex-col gap-5">
                    <motion.header initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className={`${CARD} flex flex-col items-center text-center`}>
                        <motion.div
                            initial={{ scale: 0, rotate: -20 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
                            className="rounded-full ring-4 ring-red-600 ring-offset-4 ring-offset-white dark:ring-offset-zinc-900"
                        >
                            <Avatar url={profile.avatar_url} name={profile.display_name || profile.username || ''} className="size-28 text-5xl" />
                        </motion.div>
                        <h2 className="mt-4 text-3xl font-black tracking-tight">{profile.display_name || `@${profile.username}`}</h2>
                        {profile.display_name && <p className="font-semibold text-zinc-500">@{profile.username}</p>}
                        {profile.bio && <p className="mt-3 max-w-lg whitespace-pre-line">{profile.bio}</p>}
                        {isOwner && (
                            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                                {!profile.is_public && (
                                    <span className="rounded-full bg-zinc-200 px-3 py-1 text-xs font-bold dark:bg-zinc-800">🔒 {t('onlyYouSee')}</span>
                                )}
                                <Link href="/perfil" className="rounded-full bg-red-600 px-4 py-1.5 text-sm font-bold text-white">{t('editProfile')}</Link>
                            </div>
                        )}
                    </motion.header>

                    {profile.favorite_pokemon && (
                        <motion.button
                            type="button"
                            onClick={() => profile.favorite_pokemon && setNavigation({ id: profile.favorite_pokemon, ids: NO_NAVIGATION })}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
                            whileHover={{ y: -4 }}
                            className={`${CARD} flex items-center gap-5 text-left`}
                        >
                            <motion.span
                                animate={{ y: [0, -6, 0] }}
                                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                                className="relative size-24 shrink-0"
                            >
                                <Image src={getOfficialArtwork(profile.favorite_pokemon)} alt="" fill sizes="6rem" className="object-contain drop-shadow-lg" />
                            </motion.span>
                            <span>
                                <span className="block text-xs font-black uppercase tracking-widest text-red-600 dark:text-red-400">{t('favoritePokemon')}</span>
                                <span className="block text-2xl font-black">{getName(profile.favorite_pokemon)}</span>
                                <span className="text-sm text-zinc-500">{t('viewInPokedex')} →</span>
                            </span>
                        </motion.button>
                    )}

                    {profile.team.length > 0 && (
                        <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15 } }} className={CARD}>
                            <h3 className="mb-3 text-xl font-black">{t('myTeam')}</h3>
                            <ol className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                                {profile.team.map((id, index) => (
                                    <motion.li
                                        key={id}
                                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: 0.2 + index * 0.07 } }}
                                        className="flex"
                                    >
                                        <PokemonCard pokemon={toSpecies(id)} onSelect={(speciesId) => setNavigation({ id: speciesId, ids: sortedTeam(profile.team) })} />
                                    </motion.li>
                                ))}
                            </ol>
                        </motion.section>
                    )}

                    <ProfileProgress key={progressVersion} userId={profile.id} card={CARD} />
                </div>
            )}

            <PokedexModal
                speciesId={navigation?.id ?? null}
                navigationIds={navigation?.ids ?? NO_NAVIGATION}
                onClose={() => setNavigation(null)}
                onNavigate={(id) => setNavigation((current) => current && { ...current, id })}
            />
        </section>
    )
}
