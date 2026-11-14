/* Cari elemen yang melebihi lebar viewport (penyebab scroll horizontal) */
import { chromium } from 'playwright-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const URL = 'http://localhost:5173/'

const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 })
await page.waitForTimeout(8000)

const offenders = await page.evaluate(() => {
  const vw = document.documentElement.clientWidth
  const out = []
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) continue
    if (r.right > vw + 0.5 || r.left < -0.5) {
      out.push({
        tag: el.tagName.toLowerCase(),
        cls: (typeof el.className === 'string' ? el.className : '').slice(0, 90),
        left: Math.round(r.left),
        right: Math.round(r.right),
        w: Math.round(r.width),
      })
    }
  }
  return { vw, offenders: out.slice(0, 40), total: out.length }
})
console.log(JSON.stringify(offenders, null, 2))
await browser.close()
