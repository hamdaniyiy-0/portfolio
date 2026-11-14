/* Screenshot fitur: bento grid, command menu, ikon command navbar,
   pratinjau hover kartu project, dan tilt kartu ID.
   Catatan: kursor neon sudah dihapus — kursor bawaan dipakai. */
import { chromium } from 'playwright-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 90000 })
await page.waitForTimeout(13000)

// 1) Hero + hover CTA (kursor bawaan, tanpa kursor neon)
await page.mouse.move(400, 470)
await page.locator('#home a[href="#portfolio"]').hover()
await page.waitForTimeout(700)
await page.screenshot({ path: 'scripts/new-hero-cursor.png' })

// 2) Bento grid
await page.evaluate(() => document.getElementById('stack')?.scrollIntoView({ block: 'center' }))
await page.waitForTimeout(1000)
await page.screenshot({ path: 'scripts/new-bento.png' })

// 3) Kartu project dengan pratinjau hover
await page.evaluate(() => document.getElementById('portfolio')?.scrollIntoView({ block: 'start' }))
await page.waitForTimeout(1000)
await page.locator('#portfolio article').nth(1).hover()
await page.waitForTimeout(800)
await page.screenshot({ path: 'scripts/new-project-hover.png' })

// 4) Command menu (Ctrl+K + ketik "re")
await page.evaluate(() => window.scrollTo(0, 0))
await page.waitForTimeout(400)
await page.keyboard.press('Control+k')
await page.waitForTimeout(500)
await page.keyboard.type('re')
await page.waitForTimeout(500)
await page.screenshot({ path: 'scripts/new-command-menu.png' })
await page.keyboard.press('Escape')

// 5) Zoom navbar (ikon command + ikon suara)
await page.waitForTimeout(500)
const navBox = await page.locator('header nav').boundingBox()
await page.screenshot({
  path: 'scripts/new-navbar.png',
  clip: { x: navBox.x - 10, y: navBox.y - 10, width: navBox.width + 20, height: navBox.height + 20 },
})

// 6) Mobile: bento + command menu
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
const m = await ctx.newPage()
await m.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 90000 })
await m.waitForTimeout(13000)
await m.evaluate(() => document.getElementById('stack')?.scrollIntoView({ block: 'center' }))
await m.waitForTimeout(900)
await m.screenshot({ path: 'scripts/new-bento-mobile.png' })
await m.locator('header button[aria-label="Buka command menu"]').tap()
await m.waitForTimeout(700)
await m.screenshot({ path: 'scripts/new-command-mobile.png' })

console.log('shots ok')
await browser.close()
