/* Uji navbar: scroll-spy (item aktif berpindah) + menu mobile */
import { chromium } from 'playwright-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const browser = await chromium.launch({ executablePath: EDGE, headless: true })

// --- Desktop: scroll-spy ---
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 90000 })
await page.waitForTimeout(5000)

const activeText = async () => {
  // Item aktif = link dengan border (font-semibold) di menu desktop
  return page.evaluate(() => {
    const links = [...document.querySelectorAll('header nav ul a')]
    const act = links.find((a) => a.className.includes('font-semibold'))
    return act?.textContent ?? null
  })
}

console.log('awal:', await activeText())
for (const id of ['about', 'portfolio', 'contact']) {
  await page.evaluate((t) => document.getElementById(t)?.scrollIntoView({ behavior: 'instant', block: 'start' }), id)
  await page.waitForTimeout(1300)
  console.log(`scroll ke ${id}:`, await activeText())
}

// Klik nav "Portfolio" dari atas (anchor harus smooth-jump ke section)
await page.evaluate(() => window.scrollTo(0, 0))
await page.waitForTimeout(800)
await page.click('header nav a[href="#portfolio"]')
await page.waitForTimeout(1500)
const y = await page.evaluate(() => Math.round(window.scrollY))
console.log('klik link Portfolio → scrollY:', y, '(harus > 0)')

// --- Mobile: buka menu hamburger ---
const m = await browser.newPage({ viewport: { width: 390, height: 844 } })
await m.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 90000 })
await m.waitForTimeout(5000)
await m.click('header button[aria-label="Buka menu"]')
await m.waitForTimeout(800)
const items = await m.evaluate(() =>
  [...document.querySelectorAll('header ul a')].map((a) => a.textContent),
)
console.log('menu mobile:', JSON.stringify(items))
await m.screenshot({ path: 'scripts/nav-mobile-open.png' })
// Klik Contact di menu mobile (pilih link yang terlihat) — menu harus tertutup
await m.locator('header ul a[href="#contact"]:visible').click()
await m.waitForTimeout(1200)
const openNow = await m.evaluate(() => !!document.querySelector('header ul.md\\:hidden, header ul[class*="md:hidden"]'))
console.log('menu terbuka setelah klik link:', openNow, '(harus false)')

await browser.close()
