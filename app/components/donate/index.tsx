'use client'

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { QRCodeSVG } from "qrcode.react";
import { useLanguage } from "../../context/languageContext";
import { KOFI_URL, PIX_CONFIG, buildPixPayload } from "../../lib/pix";

const AMOUNTS = [5, 10, 25, 50]
const COPIED_FEEDBACK_MS = 2000
const CARD = 'rounded-3xl bg-white/95 p-6 shadow-xl backdrop-blur-sm dark:bg-zinc-900/95'

export default function DonatePage() {
  const { t } = useLanguage()
  const [amount, setAmount] = useState<number | undefined>(10)
  const [copied, setCopied] = useState(false)
  const pixEnabled = Boolean(PIX_CONFIG.key && PIX_CONFIG.name && PIX_CONFIG.city)
  const payload = pixEnabled ? buildPixPayload({ ...PIX_CONFIG, amount, description: 'Pokedex' }) : ''

  const copy = async () => {
    await navigator.clipboard.writeText(payload)
    setCopied(true)
    setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS)
  }

  return (
    <section className="flex flex-1 justify-center bg-[url('/regions/alola.webp')] bg-cover bg-center px-4 py-10">
      <div className="flex w-full max-w-4xl flex-col gap-6">
        <motion.header initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className={`${CARD} text-center`}>
          <motion.span
            aria-hidden="true"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1 }}
            className="inline-block text-5xl text-red-600"
          >
            ♥
          </motion.span>
          <h2 className="mt-2 text-4xl font-black tracking-tight">{t('donateTitle')}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-zinc-600 dark:text-zinc-300">{t('donateSubtitle')}</p>
        </motion.header>

        <div className="grid gap-6 md:grid-cols-2">
          <motion.article initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }} className={CARD}>
            <h3 className="text-2xl font-black">Pix</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{t('pixDescription')}</p>

            {pixEnabled ? (
              <>
                <div role="group" aria-label={t('donationAmount')} className="mt-4 flex flex-wrap gap-2">
                  {[...AMOUNTS, undefined].map((value) => {
                    const active = amount === value
                    return (
                      <motion.button
                        key={value ?? 'free'}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setAmount(value)}
                        whileTap={{ scale: 0.92 }}
                        className={`relative rounded-full px-3 py-1 text-sm font-bold ${active ? 'text-white' : 'bg-zinc-100 dark:bg-zinc-800'}`}
                      >
                        {active && <motion.span layoutId="pix-amount" className="absolute inset-0 rounded-full bg-green-600" />}
                        <span className="relative">{value ? `R$ ${value}` : t('anyAmount')}</span>
                      </motion.button>
                    )
                  })}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={payload}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="mx-auto mt-5 w-fit rounded-2xl bg-white p-3 shadow-inner"
                  >
                    <QRCodeSVG value={payload} size={200} level="M" title={t('pixQrTitle')} />
                  </motion.div>
                </AnimatePresence>

                <motion.button
                  type="button"
                  onClick={copy}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="mt-5 w-full rounded-xl bg-green-600 py-2.5 font-black text-white shadow-md"
                >
                  {copied ? `✓ ${t('copied')}` : t('copyPixCode')}
                </motion.button>
                <p className="mt-3 text-center text-xs text-zinc-500">
                  {t('pixKeyLabel')}: <span className="font-mono font-bold">{PIX_CONFIG.key}</span>
                </p>
              </>
            ) : (
              <p className="mt-4 rounded-xl bg-zinc-100 p-4 text-sm dark:bg-zinc-800">{t('donationComingSoon')}</p>
            )}
          </motion.article>

          <motion.article initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }} className={`${CARD} flex flex-col`}>
            <h3 className="text-2xl font-black">Ko-fi</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{t('kofiDescription')}</p>
            <div className="flex flex-1 items-center justify-center py-8">
              <motion.span
                aria-hidden="true"
                animate={{ rotate: [0, -8, 8, 0], y: [0, -4, 0] }}
                transition={{ duration: 2.4, repeat: Infinity }}
                className="text-7xl"
              >
                ☕
              </motion.span>
            </div>
            {KOFI_URL ? (
              <motion.a
                href={KOFI_URL}
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="w-full rounded-xl bg-sky-500 py-2.5 text-center font-black text-white shadow-md"
              >
                {t('donateOnKofi')}
              </motion.a>
            ) : (
              <p className="rounded-xl bg-zinc-100 p-4 text-sm dark:bg-zinc-800">{t('donationComingSoon')}</p>
            )}
          </motion.article>
        </div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.4 } }} className={`${CARD} text-center text-sm`}>
          {t('donateThanks')}
        </motion.p>
      </div>
    </section>
  )
}
