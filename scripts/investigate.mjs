/* Selidiki: apa yang benar-benar dimuat kartu Lanyard sekarang */
import { chromium } from 'playwright-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const bodies = {}
page.on('response', async (r) => {
  const p = new URL(r.url()).pathname
  if (['/card-front.png', '/card-back.png', '/band.png'].includes(p)) {
    try {
      const buf = await r.body()
      bodies[p] = { status: r.status(), bytes: buf.length, type: r.headers()['content-type'] }
    } catch (e) {
      bodies[p] = { status: r.status(), bytes: 'gagal-baca: ' + e.message }
    }
  }
})

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 90000 })
await page.waitForTimeout(12000)

// Resource timing: berapa byte benar-benar diterima browser
const timing = await page.evaluate(() =>
  performance
    .getEntriesByType('resource')
    .filter((e) => /card-front|card-back|band\.png/.test(e.name))
    .map((e) => ({ name: new URL(e.name).pathname, size: e.encodedBodySize, transfer: e.transferSize })),
)

// Warna tengah kartu (bukti visual: ada gambar atau hanya warna kartu)
const shot = await page.screenshot({ path: 'scripts/investigate-card.png', clip: { x: 950, y: 250, width: 260, height: 320 } })

console.log('response body:', JSON.stringify(bodies, null, 1))
console.log('resource timing:', JSON.stringify(timing, null, 1))
await browser.close()
