import { useId } from "react";

export default function HsEmblem({ className = 'size-10' }: { className?: string }) {
    const id = useId()
    return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
            <defs>
                <radialGradient id={`${id}-gem`} cx="40%" cy="35%" r="70%">
                    <stop offset="0%" stopColor="#bfe9ff" />
                    <stop offset="55%" stopColor="#2f8fd8" />
                    <stop offset="100%" stopColor="#123a73" />
                </radialGradient>
                <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffe8a3" />
                    <stop offset="50%" stopColor="#d9a634" />
                    <stop offset="100%" stopColor="#8a5a12" />
                </linearGradient>
            </defs>
            <path d="M32 3 58 18v28L32 61 6 46V18Z" fill={`url(#${id}-gold)`} stroke="#3b2208" strokeWidth="2.5" />
            <path d="M32 11 51 22v20L32 53 13 42V22Z" fill="#3b2208" />
            <circle cx="32" cy="32" r="14" fill={`url(#${id}-gem)`} stroke="#ffe8a3" strokeWidth="2" />
            <path d="M26 27c3-3 9-3 12 0" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />
        </svg>
    )
}
