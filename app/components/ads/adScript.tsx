import { ADSENSE_CLIENT } from "../../lib/ads";

export default function AdScript() {
    if (!ADSENSE_CLIENT) return null
    return (
        <script
            async
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
        />
    )
}
