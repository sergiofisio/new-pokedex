import Script from "next/script";
import { ADSENSE_CLIENT } from "../../lib/ads";

export default function AdScript() {
    if (!ADSENSE_CLIENT) return null
    return (
        <Script
            id="adsense"
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
        />
    )
}
