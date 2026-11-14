/* Screenshot footer (desktop) dan menu mobile terbuka */
import { chromium } from 'playwright-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const URL = 'http://localhost:5173/'

const browser = await chromium.launch({ executablePath: EDGE, headless: true })

// Footer desktop
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 })
await page.waitForTimeout(6000)
await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }))
await page.waitForTimeout(2500)
await page.screenshot({ path: 'scripts/shot-footer.png' })

// Menu mobile terbuka
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } })
await mobile.goto(URL, { waitUntil: 'networkidle', timeout: 90000 })
await mobile.waitForTimeout(5000)
await mobile.getByRole('button', { name: 'Buka menu' }).click()
await mobile.waitForTimeout(800)
await mobile.screenshot({ path: 'scripts/shot-mobile-menu.png' })

console.log('ok')
await browser.close()
