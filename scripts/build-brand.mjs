import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import sharp from 'sharp'

const ROOT = new URL('../', import.meta.url)
const path = (file) => new URL(file, ROOT)
const FONT = `'Segoe UI Black', 'Arial Black', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif`

const icon = readFileSync(path('app/icon.svg'), 'utf8')
const iconBody = icon.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
const placeIcon = (x, y, size) => `<g transform="translate(${x} ${y}) scale(${size / 64})">${iconBody}</g>`

const THEMES = {
  light: { title: '#3b1406', subtitle: '#b45309', stroke: 'none' },
  dark: { title: '#fef3c7', subtitle: '#fbbf24', stroke: '#1c0a03' },
}

function logo(theme) {
  const { title, subtitle, stroke } = THEMES[theme]
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 80">
  ${placeIcon(4, 4, 72)}
  <text x="90" y="44" font-family="${FONT}" font-size="36" font-weight="900" letter-spacing="-1" fill="${title}" stroke="${stroke}" stroke-width="1.5" paint-order="stroke">Taverna</text>
  <text x="92" y="68" font-family="${FONT}" font-size="16" font-weight="800" letter-spacing="7" fill="${subtitle}">DOS JOGOS</text>
</svg>
`
}

const square = (size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#3b1406"/>
  ${placeIcon(0, 0, size)}
</svg>`

const og = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="bg" cx="0.5" cy="0.35" r="0.9">
      <stop offset="0" stop-color="#7c2d12"/>
      <stop offset="1" stop-color="#1c0a03"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  ${placeIcon(130, 175, 280)}
  <text x="460" y="300" font-family="${FONT}" font-size="104" font-weight="900" letter-spacing="-3" fill="#fef3c7">Taverna</text>
  <text x="466" y="372" font-family="${FONT}" font-size="44" font-weight="800" letter-spacing="18" fill="#fbbf24">DOS JOGOS</text>
  <text x="466" y="452" font-family="'Segoe UI', Arial, sans-serif" font-size="30" font-weight="600" fill="#fde68a" fill-opacity=".85">Pokédex, Hearthstone, desafios diários e duelos</text>
</svg>`

const png = (svg, file, width, height = width) =>
  sharp(Buffer.from(svg), { density: 1200 }).resize(width, height).png().toFile(path(file).pathname.replace(/^\/([A-Z]:)/, '$1'))

mkdirSync(path('public/brand'), { recursive: true })
writeFileSync(path('public/brand/logo.svg'), logo('light'))
writeFileSync(path('public/brand/logo-dark.svg'), logo('dark'))

await Promise.all([
  png(logo('light'), 'public/brand/logo.png', 1024, 320),
  png(logo('dark'), 'public/brand/logo-dark.png', 1024, 320),
  png(icon, 'public/brand/icon-1024.png', 1024),
  png(square(180), 'app/apple-icon.png', 180),
  png(og, 'app/opengraph-image.png', 1200, 630),
])
console.log('brand assets written')
