'use client'

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import Avatar from "../avatar";
import { getAvatarUrl, useAuth } from "../../context/authContext";
import { useLanguage } from "../../context/languageContext";

const MENU_ITEM = 'block w-full rounded-lg px-3 py-2 text-left text-sm font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800'

export default function UserMenu() {
  const { user, profile, loading, signOut } = useAuth()
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  if (loading) return <span aria-hidden="true" className="size-8 animate-pulse rounded-full bg-white/30" />

  if (!user) {
    return (
      <Link href="/entrar" className="rounded-lg bg-white px-3 py-1 text-sm font-bold text-red-700 shadow-sm transition-transform hover:scale-105">
        {t('signIn')}
      </Link>
    )
  }

  const name = profile?.display_name || profile?.username || user.email || ''
  const closeMenu = () => setOpen(false)

  return (
    <div ref={containerRef} className="relative">
      <motion.button
        type="button"
        aria-label={t('accountMenu')}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        whileTap={{ scale: 0.9 }}
        className="rounded-full border-2 border-white cursor-pointer"
      >
        <Avatar url={getAvatarUrl(profile, user)} name={name} />
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95, transition: { duration: 0.12 } }}
            className="absolute right-0 top-full z-50 mt-2 w-60 origin-top-right rounded-2xl bg-white p-2 text-zinc-900 shadow-2xl ring-1 ring-zinc-200 dark:bg-zinc-900 dark:text-white dark:ring-zinc-700"
          >
            <p className="truncate px-3 py-2 text-sm">
              {t('signedInAs', { name: profile?.username ? `@${profile.username}` : name })}
            </p>
            {profile?.username ? (
              <>
                <Link href="/perfil" onClick={closeMenu} className={MENU_ITEM}>{t('editProfile')}</Link>
                <Link href={`/u/${profile.username}`} onClick={closeMenu} className={MENU_ITEM}>{t('viewPublicProfile')}</Link>
              </>
            ) : (
              <Link href="/completar-perfil" onClick={closeMenu} className={MENU_ITEM}>{t('chooseUsername')}</Link>
            )}
            <Link href="/apoiar" onClick={closeMenu} className={MENU_ITEM}>♥ {t('supportProject')}</Link>
            <button type="button" onClick={() => { closeMenu(); signOut() }} className={`${MENU_ITEM} text-red-600 dark:text-red-400`}>
              {t('signOut')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
