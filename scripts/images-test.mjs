/* Verifikasi: Lanyard meminta gambar hasil edit dari public/ */
import { chromium } from 'playwright-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`))
page.on('console', (m) => m.type() === 'error' && errors.push(`[console] ${m.text()}`))

const wanted = ['/card-front.png', '/card-back.png', '/band.png']
const seen = {}
page.on('response', (r) => {
  const path = new URL(r.url()).pathname
  if (wanted.includes(path)) seen[path] = r.status()
})

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 90000 })
await page.waitForTimeout(12000)

console.log('request gambar hasil edit:')
for (const p of wanted) console.log(`  ${p}: ${seen[p] ?? 'TIDAK DIMINTA'}`)

// Semua gambar yang dipakai Lanyard harus dari file user (tidak ada gambar lain)
const foreignImages = await page.evaluate(() => {
  const urls = new Set()
  document.querySelectorAll('img').forEach((i) => urls.add(i.getAttribute('src') || ''))
  return [...urls].filter((u) => u && !u.startsWith('/card-front.png'))
})
console.log('img lain di DOM:', JSON.stringify(foreignImages))

await page.screenshot({ path: 'scripts/shot-your-images.png' })
console.log('ERRORS:', errors.length, JSON.stringify(errors.slice(0, 5)))
await browser.close()
process.exit(errors.length ? 1 : 0)
