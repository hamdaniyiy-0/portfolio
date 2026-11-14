/* Buktikan apakah halaman benar-benar bisa digulir horizontal */
import { chromium } from 'playwright-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const browser = await chromium.launch({ executablePath: EDGE, headless: true })

for (const [w, h] of [[390, 844], [360, 780], [768, 1024], [1440, 900]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } })
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 90000 })
  await page.waitForTimeout(5000)
  const res = await page.evaluate(() => {
    window.scrollTo(500, 0)
    const x = window.scrollX
    window.scrollTo(0, 0)
    return { scrollXAfter: x, scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }
  })
  console.log(`${w}x${h}`, JSON.stringify(res))
  await page.close()
}
await browser.close()
