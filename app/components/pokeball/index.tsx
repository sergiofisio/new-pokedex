'use client'

import { useId } from "react";
import { motion } from "motion/react";

export default function Pokeball() {
  const id = useId()

  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 64 64"
      initial={{ rotate: -180, scale: 0 }}
      animate={{ rotate: 0, scale: 1 }}
      whileHover={{ rotate: [0, -20, 20, -10, 10, 0], transition: { duration: 0.6 } }}
      className="block size-9 drop-shadow"
    >
      <defs>
        <linearGradient id={`${id}-top`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f87171" />
          <stop offset="1" stopColor="#dc2626" />
        </linearGradient>
        <linearGradient id={`${id}-bottom`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d4d4d8" />
        </linearGradient>
        <radialGradient id={`${id}-lens`} cx="0.38" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#bae6fd" />
          <stop offset="0.45" stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#075985" />
        </radialGradient>
        <clipPath id={`${id}-ball`}>
          <circle cx="32" cy="32" r="28" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-ball)`}>
        <rect width="64" height="32" fill={`url(#${id}-top)`} />
        <rect y="32" width="64" height="32" fill={`url(#${id}-bottom)`} />
        <path d="M12 22a22 22 0 0 1 14-13" fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth="3.5" strokeLinecap="round" />
        <rect y="29" width="64" height="6" fill="#18181b" />
      </g>
      <circle cx="32" cy="32" r="28" fill="none" stroke="#18181b" strokeWidth="4" />
      <circle cx="44" cy="15.5" r="2.4" fill="#facc15" stroke="#18181b" strokeWidth="1.2" />
      <circle cx="50.5" cy="21.5" r="2.4" fill="#4ade80" stroke="#18181b" strokeWidth="1.2" />
      <circle cx="32" cy="32" r="11.5" fill="#f4f4f5" stroke="#18181b" strokeWidth="4" />
      <motion.circle
        cx="32"
        cy="32"
        r="6.5"
        fill={`url(#${id}-lens)`}
        stroke="#18181b"
        strokeWidth="1.5"
        animate={{ opacity: [1, 0.75, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <ellipse cx="29.6" cy="29.6" rx="2.2" ry="1.4" transform="rotate(-35 29.6 29.6)" fill="#fff" fillOpacity=".9" />
    </motion.svg>
  )
}
