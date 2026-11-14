/* Uji suara klik menyeluruh: setiap link/tombol harus memanggil playClick
   TEPAT SEKALI (2 oscillator per klik = 1x playClick), elemen non-interactive
   tidak berbunyi, dan tidak ada suara dobel dari listener lama. */
import { chromium } from 'playwright-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const URL = 'http://localhost:5173/'

const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 })
await page.waitForTimeout(13000) // tunggu preloader selesai

// Spy: hitung oscillator yang dibuat (playClick = 2 oscillator)
await page.evaluate(() => {
  window.__osc = 0
  const orig = AudioContext.prototype.createOscillator
  AudioContext.prototype.createOscillator = function (...args) {
    window.__osc += 1
    return orig.apply(this, args)
  }
})
const osc = () => page.evaluate(() => window.__osc)

const results = []
const click = async (selector, label, expect) => {
  const before = await osc()
  await page.click(selector)
  await page.waitForTimeout(500)
  const created = (await osc()) - before
  const ok = expect === 'exact' ? created === 2 : created >= 2
  results.push({ label, created, expect, ok: ok ? 'OK' : 'GAGAL' })
}

// Desktop
await click('header nav a[href="#about"]', 'link navbar (desktop)', 'exact')
await click('#home a[href="#portfolio"]', 'tombol hero "Lihat Projek"', 'exact')
await click('#home a[href="#contact"]', 'tombol hero "Hubungi Saya"', 'exact')
await click('footer nav a[href="#contact"]', 'link footer', 'exact')
await click('#contact button[type="submit"]', 'tombol submit form kontak', 'exact')

// Ikon suara: klik pertama menyalakan musik (node musik ikut terhitung, abaikan),
// klik KEDUA mematikan musik -> yang tersisa harus murni 1x playClick (2 osc).
{
  await page.click('header button[aria-label="Nyalakan musik"]')
  await page.waitForTimeout(500)
  const before = await osc()
  await page.click('header button[aria-label="Matikan musik"]')
  await page.waitForTimeout(500)
  const created = (await osc()) - before
  results.push({ label: 'ikon suara navbar (toggle mati -> sfx murni)', created, expect: 'exact', ok: created === 2 ? 'OK' : 'GAGAL' })
}

// Elemen non-interactive TIDAK boleh berbunyi
{
  const before = await osc()
  await page.click('#home h1', { force: true })
  await page.waitForTimeout(400)
  const created = (await osc()) - before
  results.push({ label: 'klik judul (bukan tombol)', created, expect: 0, ok: created === 0 ? 'OK' : 'GAGAL' })
}

// Mobile: tombol hamburger + menu (diukur per klik)
{
  const m = await browser.newPage({ viewport: { width: 390, height: 844 } })
  m.on('pageerror', (e) => errors.push(e.message))
  m.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()))
  await m.goto(URL, { waitUntil: 'networkidle', timeout: 90000 })
  await m.waitForTimeout(13000)
  await m.evaluate(() => {
    window.__osc = 0
    const orig = AudioContext.prototype.createOscillator
    AudioContext.prototype.createOscillator = function (...args) {
      window.__osc += 1
      return orig.apply(this, args)
    }
  })
  const step = async (fn, label, expect) => {
    const before = await m.evaluate(() => window.__osc)
    await fn()
    await m.waitForTimeout(500)
    const created = (await m.evaluate(() => window.__osc)) - before
    results.push({ label, created, expect, ok: created === expect ? 'OK' : 'GAGAL' })
  }
  await step(() => m.click('header button[aria-label="Buka menu"]'), 'mobile: hamburger (ikon bertukar)', 2)
  await step(() => m.locator('header ul a[href="#portfolio"]:visible').click(), 'mobile: link menu', 2)
  await step(() => m.click('header button[aria-label="Ganti tema"]'), 'mobile: tombol tema (ikon bertukar)', 2)
  await m.close()
}

console.log(JSON.stringify(results, null, 1))
const allOk = results.every((r) => r.ok === 'OK')
console.log('ERRORS:', errors.length, errors.slice(0, 5))
console.log(allOk && errors.length === 0 ? 'PASS' : 'FAIL')
await browser.close()
process.exit(allOk && errors.length === 0 ? 0 : 1)
