import { useId } from "react";

export default function SiteEmblem({ className = 'size-10' }: { className?: string }) {
    const id = useId()
    const handle = 'M42 27h5a5 5 0 0 1 5 5v7a5 5 0 0 1-5 5h-5'
    const foam: [number, number, number][] = [[17.5, 20, 5], [26.5, 17, 6.5], [36, 18.5, 5.5], [41, 22, 3]]
    return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
            <defs>
                <radialGradient id={`${id}-wood`} cx="0.5" cy="0.3" r="0.85">
                    <stop offset="0" stopColor="#9a3412" />
                    <stop offset="1" stopColor="#3b1406" />
                </radialGradient>
                <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#fde68a" />
                    <stop offset="0.55" stopColor="#f59e0b" />
                    <stop offset="1" stopColor="#b45309" />
                </linearGradient>
            </defs>
            <rect width="64" height="64" rx="14" fill={`url(#${id}-wood)`} />
            <rect x="2.5" y="2.5" width="59" height="59" rx="11.5" fill="none" stroke="#f59e0b" strokeOpacity=".55" strokeWidth="2" />
            <path d={handle} fill="none" stroke="#1c0a03" strokeWidth="8" strokeLinejoin="round" />
            <path d={handle} fill="none" stroke={`url(#${id}-gold)`} strokeWidth="3.5" strokeLinejoin="round" />
            <rect x="13" y="22" width="30" height="31" rx="5" fill={`url(#${id}-gold)`} stroke="#1c0a03" strokeWidth="3" />
            {foam.map(([cx, cy, r]) => <circle key={cx} cx={cx} cy={cy} r={r + 1.5} fill="#1c0a03" />)}
            {foam.map(([cx, cy, r]) => <circle key={cx} cx={cx} cy={cy} r={r} fill="#fff7ed" />)}
            <rect x="14.5" y="20" width="27" height="4.5" fill="#fff7ed" />
            <circle cx="23.5" cy="14.5" r="1.8" fill="#fff" />
            <rect x="24.5" y="29" width="7" height="19" rx="1.6" fill="#1c0a03" />
            <rect x="18.5" y="35" width="19" height="7" rx="1.6" fill="#1c0a03" />
            <circle cx="28" cy="38.5" r="1.6" fill="#f59e0b" />
        </svg>
    )
}
