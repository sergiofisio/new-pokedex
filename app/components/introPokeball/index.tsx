'use client'

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useLanguage } from "../../context/languageContext";

type Stage = 'closed' | 'opening' | 'done'

const SPLIT_DELAY = 0.45
const SPLIT_EASE = [0.65, 0, 0.35, 1] as const
const FALLBACK_DONE_DELAY = 2000

export default function IntroPokeball() {
  const { t } = useLanguage()
  const [stage, setStage] = useState<Stage>('closed')
  const isOpening = stage === 'opening'

  useEffect(() => {
    if (stage !== 'opening') return
    const timer = setTimeout(() => setStage('done'), FALLBACK_DONE_DELAY)
    return () => clearTimeout(timer)
  }, [stage])

  if (stage === 'done') return null

  return (
    <div data-intro className={`fixed inset-0 z-[100] overflow-hidden ${isOpening ? 'pointer-events-none' : ''}`}>
      <motion.div
        aria-hidden="true"
        animate={isOpening ? { y: '-100%' } : { y: 0 }}
        transition={{ delay: SPLIT_DELAY, duration: 0.9, ease: SPLIT_EASE }}
        className="absolute inset-x-0 top-0 h-1/2 border-b-[14px] border-zinc-900 bg-red-600 bg-[radial-gradient(ellipse_at_30%_20%,rgb(255_255_255/0.35),transparent_55%)] shadow-[inset_0_-30px_60px_rgba(0,0,0,0.25)]"
      />
      <motion.div
        aria-hidden="true"
        animate={isOpening ? { y: '100%' } : { y: 0 }}
        transition={{ delay: SPLIT_DELAY, duration: 0.9, ease: SPLIT_EASE }}
        onAnimationComplete={() => { if (isOpening) setStage('done') }}
        className="absolute inset-x-0 bottom-0 h-1/2 border-t-[14px] border-zinc-900 bg-zinc-100 bg-[radial-gradient(ellipse_at_70%_80%,rgb(0_0_0/0.12),transparent_60%)]"
      >
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={isOpening ? { opacity: 0 } : { opacity: 1, y: 0 }}
          transition={{ delay: isOpening ? 0 : 0.8 }}
          className="absolute inset-x-0 top-[22vmin] text-center font-mono text-sm font-bold uppercase tracking-[0.3em] text-zinc-500"
        >
          {t('introHint')}
        </motion.p>
      </motion.div>

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <motion.button
          type="button"
          autoFocus
          onClick={() => setStage('opening')}
          aria-label={t('introOpen')}
          initial={{ scale: 0, rotate: -180 }}
          animate={isOpening
            ? { scale: [1, 1.25, 0], rotate: 0, transition: { duration: SPLIT_DELAY + 0.2, ease: 'easeIn' } }
            : { scale: 1, rotate: [0, 0, -14, 14, -10, 10, 0] }}
          transition={{
            scale: { type: 'spring', stiffness: 200, damping: 14 },
            rotate: { duration: 1.2, delay: 0.6, repeat: Infinity, repeatDelay: 0.6 },
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="pointer-events-auto flex size-[clamp(7rem,24vmin,13rem)] items-center justify-center rounded-full border-[14px] border-zinc-900 bg-zinc-100 shadow-2xl focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-sky-400"
        >
          <motion.span
            aria-hidden="true"
            animate={isOpening
              ? { backgroundColor: '#ffffff', boxShadow: '0 0 80px 30px rgba(255,255,255,0.9)' }
              : { backgroundColor: ['#e4e4e7', '#ffffff', '#e4e4e7'], boxShadow: '0 0 0 0 rgba(255,255,255,0)' }}
            transition={isOpening ? { duration: 0.3 } : { duration: 1.6, repeat: Infinity }}
            className="size-1/2 rounded-full border-[6px] border-zinc-900"
          />
        </motion.button>
      </div>
    </div>
  )
}
