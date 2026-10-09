import { ADSENSE_CLIENT } from "../lib/ads";

export function GET() {
  const publisher = ADSENSE_CLIENT.replace(/^ca-/, '')
  if (!publisher) return new Response('', { status: 404 })
  return new Response(`google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
