'use client'

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";

export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ type: 'spring', stiffness: 260, damping: 26 }}>
      {children}
    </MotionConfig>
  )
}
