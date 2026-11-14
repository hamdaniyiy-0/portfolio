/* Screenshot per-section untuk review visual */
import { chromium } from 'playwright-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const URL = 'http://localhost:5173/'

const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 })
await page.waitForTimeout(8000)

const targets = [
  ['about', 1],
  ['stats', 2],
  ['skills', 3],
  ['projects', 4],
  ['music', 5],
  ['contact', 6],
]

for (const [name, index] of targets) {
  await page.evaluate((i) => {
    const el = document.querySelectorAll('main section')[i]
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: 'instant' })
  }, index)
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `scripts/sec-${name}.png` })
  console.log('ok:', name)
}

// Footer
await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }))
await page.waitForTimeout(1500)
await page.screenshot({ path: 'scripts/sec-footer.png' })
console.log('ok: footer')

await browser.close()
