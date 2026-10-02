'use client'

import { motion } from "motion/react";

export default function Pokeball() {
  return (
    <motion.span
      aria-hidden="true"
      initial={{ rotate: -180, scale: 0 }}
      animate={{ rotate: 0, scale: 1 }}
      whileHover={{ rotate: [0, -20, 20, -10, 10, 0], transition: { duration: 0.6 } }}
      className="relative block size-8 overflow-hidden rounded-full border-[3px] border-zinc-900 bg-white"
    >
      <span className="absolute inset-x-0 top-0 h-1/2 border-b-[3px] border-zinc-900 bg-red-500" />
      <span className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-zinc-900 bg-white" />
    </motion.span>
  )
}
