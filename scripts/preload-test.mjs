/* Verifikasi: preloader saat dibuka, pill navbar dipangkas, klik navbar */
import { chromium } from 'playwright-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const browser = await chromium.launch({ executablePath: EDGE, headless: true })

// --- 1. Preloader: tangkap layar sesaat setelah halaman dibuka ---
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`))
page.on('console', (m) => m.type() === 'error' && errors.push(`[console] ${m.text()}`))

await page.goto('http://localhost:5173/', { waitUntil: 'domcontentloaded', timeout: 90000 })
await page.waitForTimeout(700)
const pre = await page.evaluate(() => {
  const el = document.querySelector('[role="status"]')
  if (!el) return null
  const text = el.textContent?.trim() ?? ''
  // Angka persen harus bilangan bulat saja (tanpa desimal)
  const num = text.match(/^(-?\d+(?:\.\d+)?)%/)?.[1] ?? null
  return {
    text,
    percent: num,
    isInteger: num !== null && Number.isInteger(Number(num)),
    visible: el.getBoundingClientRect().height > 0,
  }
})
console.log('preloader:', JSON.stringify(pre))

// Tangkap beberapa frame selama persen berjalan (SEBELUM screenshot,
// karena screenshot bisa memakan waktu dan membuat preloader selesai)
const samples = []
const t0 = Date.now()
while (Date.now() - t0 < 5000) {
  const t = await page.evaluate(() => {
    const el = document.querySelector('[role="status"]')
    return el ? el.textContent?.trim() : null
  })
  if (!t) break
  samples.push(t)
  await page.waitForTimeout(60)
}
await page.screenshot({ path: 'scripts/shot-preloader.png' })
const allIntegers = samples.length > 0 && samples.every((t) => /^\d+%Memuat assets\.\.\.$/.test(t))
console.log('sampel persen:', JSON.stringify(samples))
console.log(`semua bilangan bulat: ${allIntegers} (${samples.length} sampel, harus true & > 0)`)

// Tunggu preloader selesai (maks 6 dtk + fade)
await page.waitForFunction(() => !document.querySelector('[role="status"]'), { timeout: 15000 })
console.log('preloader hilang: true')

// --- 2. Lebar pill navbar: harus mengikuti isi (bukan max-w-3xl = 768px) ---
await page.waitForTimeout(2500)
const navBox = await page.locator('header nav').first().boundingBox()
console.log('pill navbar:', JSON.stringify({ x: Math.round(navBox.x), w: Math.round(navBox.width) }))
await page.screenshot({ path: 'scripts/shot-navbar-trim.png', clip: { x: 0, y: 0, width: 1440, height: 130 } })

// --- 3. Klik tiap link navbar: sound effect dipanggil tanpa error ---
for (const id of ['about', 'portfolio', 'contact', 'home']) {
  await page.click(`header nav a[href="#${id}"]`)
  await page.waitForTimeout(600)
}
const scrollY = await page.evaluate(() => Math.round(window.scrollY))
console.log('setelah klik home (harus ~0):', scrollY)

// Pastikan body tidak terkunci gulirnya setelah preloader
const overflow = await page.evaluate(() => document.body.style.overflow || '(kosong)')
console.log('body overflow:', overflow)

console.log('ERRORS:', errors.length, JSON.stringify(errors.slice(0, 5)))
const ok =
  errors.length === 0 &&
  pre?.isInteger === true &&
  allIntegers &&
  samples.length > 0 &&
  samples.some((t) => !t.startsWith('0%')) // persen benar-benar berjalan naik
console.log(ok ? 'PASS' : 'FAIL')
await browser.close()
process.exit(ok ? 0 : 1)
