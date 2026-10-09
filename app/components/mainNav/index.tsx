'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";
import type { MessageKey } from "../../i18n/translations";

const LINKS: { href: string; label: MessageKey }[] = [
  { href: '/pokemon', label: 'navPokemon' },
  { href: '/hearthstone', label: 'navHearthstone' },
  { href: '/desafios', label: 'navChallenges' },
  { href: '/duelo', label: 'navDuel' },
]

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`)

export default function MainNav() {
  const pathname = usePathname()
  const { t } = useLanguage()

  return (
    <nav aria-label={t('mainNav')} className="flex max-w-[46vw] overflow-x-auto rounded-lg border border-white/40 p-0.5 [scrollbar-width:none]">
      {LINKS.map(({ href, label }) => {
        const active = isActive(pathname, href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`relative shrink-0 rounded-md px-2.5 py-1 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${
              active ? 'text-zinc-900' : 'hover:bg-white/20'
            }`}
          >
            {active && <motion.span layoutId="nav-indicator" className="absolute inset-0 rounded-md bg-white" />}
            <span className="relative">{t(label)}</span>
          </Link>
        )
      })}
    </nav>
  )
}
