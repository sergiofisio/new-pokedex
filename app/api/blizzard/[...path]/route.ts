import type { NextRequest } from "next/server";

const API = 'https://us.api.blizzard.com/hearthstone'
const TOKEN_URL = 'https://oauth.battle.net/token'
const LOCALES: Record<string, string> = { pt: 'pt_BR', en: 'en_US' }
const DAY = 60 * 60 * 24

const ROUTES: Record<string, { params: string[]; revalidate: number }> = {
  deck: { params: ['code'], revalidate: DAY },
  metadata: { params: [], revalidate: DAY },
  'metadata/sets': { params: [], revalidate: DAY },
  'metadata/setGroups': { params: [], revalidate: DAY },
}

let token: { value: string; expires: number } | null = null

async function getToken(id: string, secret: string) {
  if (token && token.expires > Date.now()) return token.value
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`token ${response.status}`)
  const data = await response.json() as { access_token: string; expires_in: number }
  token = { value: data.access_token, expires: Date.now() + (data.expires_in - 60) * 1000 }
  return token.value
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const id = process.env.BLIZZARD_CLIENT_ID
  const secret = process.env.BLIZZARD_CLIENT_SECRET
  if (!id || !secret) return Response.json({ error: 'not_configured' }, { status: 503 })

  const path = (await params).path.join('/')
  const route = ROUTES[path]
  if (!route) return Response.json({ error: 'not_found' }, { status: 404 })

  const search = request.nextUrl.searchParams
  const query = new URLSearchParams({ locale: LOCALES[search.get('lang') ?? ''] ?? LOCALES.pt })
  for (const name of route.params) {
    const value = search.get(name)?.trim()
    if (!value || value.length > 400) return Response.json({ error: `invalid_${name}` }, { status: 400 })
    query.set(name, value)
  }

  try {
    const response = await fetch(`${API}/${path}?${query}`, {
      headers: { Authorization: `Bearer ${await getToken(id, secret)}` },
      next: { revalidate: route.revalidate },
    })
    if (!response.ok) return Response.json({ error: 'upstream', status: response.status }, { status: response.status === 400 || response.status === 404 ? response.status : 502 })
    return Response.json(await response.json(), {
      headers: { 'Cache-Control': `public, s-maxage=${route.revalidate}, stale-while-revalidate=${route.revalidate}` },
    })
  } catch {
    return Response.json({ error: 'upstream' }, { status: 502 })
  }
}
