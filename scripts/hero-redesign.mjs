/* Verifikasi visual redesign hero: desktop / tablet / mobile.
   - screenshot tiap viewport
   - cek scroll horizontal
   - cek console error
   - cek urutan mobile: kartu ID setelah deskripsi
   - cek tombol & anchor nav berfungsi */
import { chromium } from 'playwright-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const URL = 'http://localhost:5173/'

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 834, height: 1112 },
  { name: 'mobile', width: 390, height: 844 },
]

const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const allErrors = []

for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } })
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

  await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 })
  await page.waitForTimeout(14000) // tunggu preloader selesai + animasi tenang

  const info = await page.evaluate(() => {
    const h1 = document.querySelector('h1')
    const hero = document.querySelector('#home')
    const card = document.querySelector('#home canvas') || document.querySelector('#home .fb-card')
    const bio = [...document.querySelectorAll('#home p')].find((p) => p.textContent.includes('Saya seorang junior'))
    const r = (el) => (el ? Math.round(el.getBoundingClientRect().top) : null)
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      h1Size: h1 ? getComputedStyle(h1).fontSize : null,
      h1Text: h1 ? h1.innerText.replace(/\n/g, ' | ') : null,
      cardTop: r(card),
      bioTop: r(bio),
      heroHeight: hero ? Math.round(hero.getBoundingClientRect().height) : null,
    }
  })

  const hScroll = info.scrollWidth > info.clientWidth
  const cardBelowBio = vp.name !== 'mobile' || (info.cardTop != null && info.bioTop != null && info.cardTop > info.bioTop)

  console.log(`\n=== ${vp.name} (${vp.width}x${vp.height}) ===`)
  console.log(JSON.stringify(info, null, 2))
  console.log('horizontal overflow:', hScroll)
  console.log('kartu di bawah deskripsi (mobile):', cardBelowBio)
  console.log('ERRORS:', errors.length, errors.slice(0, 5))
  allErrors.push(...errors)

  await page.screenshot({ path: `scripts/hero-${vp.name}.png` })

  // Uji anchor nav + tombol hero (khusus desktop sekali saja)
  if (vp.name === 'desktop') {
    await page.click('#home a[href="#portfolio"]')
    await page.waitForTimeout(2500)
    const y1 = await page.evaluate(() => Math.round(window.scrollY))
    await page.click('nav a[href="#home"]')
    await page.waitForTimeout(2500)
    const y2 = await page.evaluate(() => Math.round(window.scrollY))
    const anchorsOk = y1 > 500 && y2 < 200
    console.log('anchor Lihat Projek (scrollY):', y1, '| kembali Home:', y2, '=>', anchorsOk ? 'OK' : 'GAGAL')
    await page.click('#home a[href="#contact"]')
    await page.waitForTimeout(2500)
    const y3 = await page.evaluate(() => Math.round(window.scrollY))
    console.log('anchor Hubungi Saya (scrollY):', y3, '=>', y3 > 500 ? 'OK' : 'GAGAL')
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(800)
    await page.screenshot({ path: 'scripts/hero-desktop-top.png' })
  }

  await page.close()
}

// --- Tema terang: pastikan hero tetap terbaca ---
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.addInitScript(() => localStorage.setItem('portfolio-theme', 'light'))
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 })
  await page.waitForTimeout(14000)
  await page.screenshot({ path: 'scripts/hero-light.png' })
  console.log('\n=== tema terang ===')
  console.log('ERRORS:', errors.length, errors.slice(0, 5))
  allErrors.push(...errors)
  await page.close()
}

console.log('\nTOTAL ERRORS:', allErrors.length)
await browser.close()
