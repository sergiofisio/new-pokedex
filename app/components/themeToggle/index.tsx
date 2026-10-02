'use client'

import { useState } from "react";
import { motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";

export default function ThemeToggle() {
  const { t } = useLanguage()
  const [turns, setTurns] = useState(0)

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    setTurns((value) => value + 1)
  }

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      aria-label={t('toggleTheme')}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.85 }}
      className="rounded-lg p-2 text-xl hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
    >
      <motion.span aria-hidden="true" animate={{ rotate: turns * 360 }} className="block">
        <span className="dark:hidden">🌙</span>
        <span className="hidden dark:inline">☀️</span>
      </motion.span>
    </motion.button>
  )
}
