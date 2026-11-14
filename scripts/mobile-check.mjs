/* Cek mobile: scroll horizontal + kondisi kartu setelah tenang */
import { chromium } from 'playwright-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const URL = 'http://localhost:5173/'

const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const page = await browser.newPage({ viewport: { width: 390, height: 844 } })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 })
await page.waitForTimeout(15000)

const info = await page.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth,
  bodyScrollWidth: document.body.scrollWidth,
  canvas: (() => {
    const c = document.querySelector('canvas')
    return c ? `${c.width}x${c.height} rect=${Math.round(c.getBoundingClientRect().width)}x${Math.round(c.getBoundingClientRect().height)}` : null
  })(),
}))
console.log(JSON.stringify(info, null, 2))
console.log('horizontal overflow:', info.scrollWidth > info.clientWidth)
console.log('ERRORS:', errors.length, errors.slice(0, 5))
await page.screenshot({ path: 'scripts/mobile-settled.png' })
await browser.close()
