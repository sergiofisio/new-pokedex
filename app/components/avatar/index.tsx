interface AvatarProps {
  url: string | null;
  name: string;
  className?: string;
}

export default function Avatar({ url, name, className = 'size-8 text-sm' }: AvatarProps) {
  return (
    <span className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-red-700 font-black uppercase text-white ${className}`}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        name.charAt(0) || '?'
      )}
    </span>
  )
}
