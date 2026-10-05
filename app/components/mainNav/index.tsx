'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";
import type { MessageKey } from "../../i18n/translations";

const LINKS: { href: string; label: MessageKey }[] = [
  { href: '/', label: 'navPokedex' },
  { href: '/desafios', label: 'navChallenges' },
]

const isActive = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname.startsWith(href)

export default function MainNav() {
  const pathname = usePathname()
  const { t } = useLanguage()

  return (
    <nav aria-label={t('mainNav')} className="flex rounded-lg border border-white/40 p-0.5">
      {LINKS.map(({ href, label }) => {
        const active = isActive(pathname, href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`relative rounded-md px-3 py-1 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current ${
              active ? 'text-red-700' : 'hover:bg-white/20'
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
