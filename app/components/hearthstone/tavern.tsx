import type { ReactNode } from "react";

export default function Tavern({ children, className = 'text-amber-50' }: { children: ReactNode; className?: string }) {
    return (
        <div className={`relative isolate flex min-w-0 flex-1 flex-col bg-[#2b1a10] ${className}`}>
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 bg-[repeating-linear-gradient(90deg,rgba(0,0,0,0.18)_0_2px,transparent_2px_120px),radial-gradient(ellipse_at_top,rgba(251,191,36,0.18),transparent_60%),linear-gradient(180deg,#4a2c17,#2b1a10_40%,#1c110a)]"
            />
            {children}
        </div>
    )
}
