/* Test seret lanyard ke luar bingkai — kartu harus tetap terlihat di dalam kanvas */
import { chromium } from 'playwright-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 90000 })
await page.waitForTimeout(12000)

// Tunggu kartu benar-benar tenang setelah intro sebelum menguji drag.
// Bila hook debug physics tersedia dipakai untuk mendeteksi kondisi tenang;
// kalau tidak ada, tunggu waktu intro yang cukup (± 10 detik).
const hasDebug = await page.evaluate(() => !!window.__LANYARD_DEBUG__)
if (hasDebug) {
  for (let i = 0; i < 50; i++) {
    const s = await page.evaluate(() => {
      const d = window.__LANYARD_DEBUG__
      if (!d) return null
      const q = d.sim.body.quaternion
      const tilt = (Math.atan2(2 * (q.w * q.z + q.x * q.y), 1 - 2 * (q.y * q.y + q.z * q.z)) * 180) / Math.PI
      return { x: d.sim.body.position.x, y: d.sim.body.position.y, tilt }
    })
    if (s && Math.abs(s.x) < 0.12 && Math.abs(s.tilt) < 6) break
    await page.waitForTimeout(500)
  }
} else {
  await page.waitForTimeout(10000)
}

const rect = await page.evaluate(() => {
  const r = document.querySelector('.lanyard-canvas').getBoundingClientRect()
  return { x: r.x, y: r.y, w: r.width, h: r.height }
})
console.log('canvas:', rect)

// Cari titik yang mengenai kartu (kursor grab kini diatur di <body>)
let grabPoint = null
outer: for (let fy = 0.15; fy <= 0.85; fy += 0.06) {
  for (let fx = 0.55; fx <= 0.92; fx += 0.05) {
    const x = rect.x + rect.w * fx
    const y = rect.y + rect.h * fy
    await page.mouse.move(x, y)
    await page.waitForTimeout(120)
    const cur = await page.evaluate(() => document.body.style.cursor || '')
    if (cur === 'grab') {
      grabPoint = { x, y }
      break outer
    }
  }
}
console.log('grab point:', grabPoint)
if (!grabPoint) {
  console.log('TIDAK MENEMUKAN KARTU')
  await page.screenshot({ path: 'scripts/drag-fail.png' })
  await browser.close()
  process.exit(1)
}

await page.mouse.down()
await page.waitForTimeout(250)

// Seret jauh ke kiri (melewati kolom teks — kartu harus tetap terlihat)
await page.mouse.move(60, rect.h * 0.5, { steps: 30 })
await page.waitForTimeout(600)
await page.screenshot({ path: 'scripts/dragfix-1-left.png' })

// Seret ke atas (dekat navbar)
await page.mouse.move(rect.w * 0.5, 70, { steps: 30 })
await page.waitForTimeout(600)
await page.screenshot({ path: 'scripts/dragfix-2-up.png' })

// Seret ke kanan bawah (pojok viewport)
await page.mouse.move(rect.w - 60, rect.h - 60, { steps: 30 })
await page.waitForTimeout(600)
await page.screenshot({ path: 'scripts/dragfix-3-br.png' })

// Seret balik ke tengah kiri lalu lepaskan
await page.mouse.move(rect.w * 0.35, rect.h * 0.45, { steps: 20 })
await page.waitForTimeout(400)
await page.mouse.up()
await page.waitForTimeout(2500)
await page.screenshot({ path: 'scripts/dragfix-4-release.png' })

// Pastikan tombol di area hero tetap bisa diklik (tidak diblokir kanvas)
const ctaBox = await page.locator('a[href="#portfolio"]').first().boundingBox()
await page.mouse.move(ctaBox.x + ctaBox.width / 2, ctaBox.y + ctaBox.height / 2)
await page.waitForTimeout(150)
const hoverCursor = await page.evaluate(() => document.body.style.cursor || '')
console.log('cursor di atas tombol CTA (harus kosong):', JSON.stringify(hoverCursor))

console.log('ERRORS:', errors.length, errors.slice(0, 5))
await browser.close()
