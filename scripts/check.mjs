/* Script verifikasi runtime: membuka situs dengan Edge headless,
   mencatat error console/JS, dan menyimpan screenshot. */
import { chromium } from 'playwright-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const URL = process.env.PORTFOLIO_URL || 'http://localhost:5173/'

const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
})
const page = await context.newPage()

const errors = []
const warnings = []
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`[console] ${msg.text()}`)
  if (msg.type() === 'warning') warnings.push(`[warn] ${msg.text()}`)
})
page.on('pageerror', (err) => errors.push(`[pageerror] ${err.message}`))
page.on('requestfailed', (req) => {
  const url = req.url()
  // Font & spotify diblokir/di luar jaringan bukan masalah fatal
  if (!/fonts\.|spotify|gstatic/.test(url)) errors.push(`[requestfailed] ${url} — ${req.failure()?.errorText}`)
})

console.log('Membuka', URL)
await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 })

// Beri waktu bagi code-split 3D + inisialisasi WASM rapier
await page.waitForTimeout(9000)

const report = await page.evaluate(() => {
  const canvas = document.querySelector('canvas')
  const gl = canvas?.getContext?.('webgl2') || canvas?.getContext?.('webgl')
  return {
    title: document.title,
    hasCanvas: !!canvas,
    canvasSize: canvas ? `${canvas.width}x${canvas.height}` : null,
    webglAlive: !!gl,
    sections: ['home', 'about', 'skills', 'portfolio', 'contact'].map((id) => `${id}:${!!document.getElementById(id)}`),
    h1: document.querySelector('h1')?.textContent?.trim() ?? null,
    navLinks: [...document.querySelectorAll('nav a[href^="#"]')].map((a) => a.textContent.trim()).slice(0, 8),
    iframeSpotify: !!document.querySelector('iframe[src*="spotify"]'),
    rootChildren: document.getElementById('root')?.children.length ?? 0,
  }
})

// Uji interaksi: gerakkan mouse (untuk lanyard) & klik toggle tema
await page.mouse.move(1200, 400)
await page.waitForTimeout(1200)
await page.screenshot({ path: 'scripts/shot-hero.png' })

// Scroll ke tiap section
for (const id of ['about', 'portfolio', 'contact']) {
  await page.evaluate((target) => {
    document.getElementById(target)?.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, id)
  await page.waitForTimeout(1200)
}
await page.screenshot({ path: 'scripts/shot-contact.png' })

// Toggle tema terang (tombol tema kini hanya ada di mobile — diuji di bawah)

// Mobile viewport
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } })
mobile.on('pageerror', (err) => errors.push(`[mobile pageerror] ${err.message}`))
await mobile.goto(URL, { waitUntil: 'networkidle', timeout: 90000 })
await mobile.waitForTimeout(6000)
await mobile.screenshot({ path: 'scripts/shot-mobile.png' })

// Toggle tema terang lewat tombol di navbar mobile
await mobile.getByRole('button', { name: 'Ganti tema' }).click()
await mobile.waitForTimeout(1200)
await mobile.screenshot({ path: 'scripts/shot-light.png' })

console.log('\n=== LAPORAN ===')
console.log(JSON.stringify(report, null, 2))
console.log('\nERROR:', errors.length)
errors.slice(0, 20).forEach((e) => console.log('  ', e))
console.log('WARNING:', warnings.length)
warnings.slice(0, 5).forEach((w) => console.log('  ', w))

await browser.close()
process.exit(errors.length ? 1 : 0)
