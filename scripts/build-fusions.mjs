import { writeFileSync } from 'node:fs'

const DEX_URL = 'https://raw.githubusercontent.com/infinitefusion/infinitefusion-e18/main/Data/dex.json'
const MAX_ID = 251

const entries = await (await fetch(DEX_URL)).json()
const authors = new Map()

for (const { sprite, author } of entries) {
    const match = sprite.match(/^(\d+)\.(\d+)\.png$/)
    if (!match) continue
    const head = Number(match[1])
    const body = Number(match[2])
    if (head === body || head > MAX_ID || body > MAX_ID) continue
    const key = `${head}.${body}`
    if (!authors.has(key)) authors.set(key, (author ?? '').trim())
}

const fusions = [...authors]
    .map(([key, author]) => [...key.split('.').map(Number), author])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1])

writeFileSync(new URL('../app/data/fusions.json', import.meta.url), JSON.stringify(fusions))
console.log(`${fusions.length} fusões gravadas em app/data/fusions.json`)
