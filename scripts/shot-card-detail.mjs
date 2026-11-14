/* Screenshot detail: kartu depan, kartu belakang (klik untuk membalik), dan tali. */
import { chromium } from 'playwright-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`))
page.on('console', (m) => m.type() === 'error' && errors.push(`[console] ${m.text()}`))

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 90000 })
await page.waitForTimeout(12000)

// 1) Tampilan penuh + crop kartu (sisi depan)
await page.screenshot({ path: 'scripts/card-front-full.png' })
await page.screenshot({
  path: 'scripts/card-front-crop.png',
  clip: { x: 800, y: 100, width: 640, height: 800 },
})

// 2) Klik kartu untuk membalik ke sisi belakang
const cx = 1048
const cy = 430
await page.mouse.move(cx, cy)
await page.waitForTimeout(300)
await page.mouse.down()
await page.waitForTimeout(80)
await page.mouse.up()
await page.waitForTimeout(2500) // beri waktu animasi flip selesai
await page.screenshot({
  path: 'scripts/card-back-crop.png',
  clip: { x: 800, y: 100, width: 640, height: 800 },
})

console.log('ERRORS:', errors.length, JSON.stringify(errors.slice(0, 5)))
await browser.close()
process.exit(errors.length ? 1 : 0)
