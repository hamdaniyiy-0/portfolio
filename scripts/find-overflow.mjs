/* Cari elemen yang melebihi lebar viewport (penyebab scrollWidth membesar) */
import { chromium } from 'playwright-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const URL = 'http://localhost:5173/'

const browser = await chromium.launch({ executablePath: EDGE, headless: true })

for (const vp of [{ w: 390, h: 844 }, { w: 834, h: 1112 }, { w: 360, h: 780 }]) {
  const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } })
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 })
  await page.waitForTimeout(13000)

  const out = await page.evaluate(() => {
    const cw = document.documentElement.clientWidth
    const bad = []
    document.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect()
      if (r.width === 0 && r.height === 0) return
      if (r.right > cw + 1 || r.left < -1) {
        bad.push({
          tag: el.tagName.toLowerCase(),
          cls: (typeof el.className === 'string' ? el.className : '').slice(0, 70),
          left: Math.round(r.left),
          right: Math.round(r.right),
          w: Math.round(r.width),
        })
      }
    })
    // ambil yang paling menonjol
    return { cw, bad: bad.sort((a, b) => b.right - a.right).slice(0, 12) }
  })
  console.log(`\n== ${vp.w}x${vp.h} clientWidth=${out.cw} ==`)
  console.log(JSON.stringify(out.bad, null, 1))
  await page.close()
}
await browser.close()
