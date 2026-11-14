/* QA menyeluruh versi baru: semua section, console bersih, navigasi,
   tab, route detail, komentar localStorage, dan layout mobile. */
import { chromium } from 'playwright-core'
import fs from 'node:fs'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const URL = process.env.PORTFOLIO_URL || 'http://localhost:5273/'
const OUT = 'scripts/qa-shots'

fs.mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const errors = []
const warnings = []

function hook(page, tag) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`[${tag}][console] ${msg.text()}`)
    else if (msg.type() === 'warning') warnings.push(`[${tag}][warn] ${msg.text()}`)
  })
  page.on('pageerror', (err) => errors.push(`[${tag}][pageerror] ${err.message}`))
  page.on('requestfailed', (req) => {
    const url = req.url()
    if (!/fonts\.|spotify|gstatic/.test(url)) {
      errors.push(`[${tag}][requestfailed] ${url} — ${req.failure()?.errorText}`)
    }
  })
}

/* ============ DESKTOP ============ */
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()
hook(page, 'desktop')

console.log('1. Membuka', URL)
await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 })

// Tunggu loader selesai
const loaderGone = await page
  .waitForSelector('.welcome-screen-root', { state: 'detached', timeout: 30000 })
  .then(() => true)
  .catch(() => false)
console.log('   loader hilang:', loaderGone)
await page.waitForTimeout(3500)

const base = await page.evaluate(() => {
  const ids = ['Home', 'About', 'Portofolio', 'Contact']
  const imgs = [...document.images].map((i) => ({
    src: i.currentSrc || i.src,
    ok: i.complete && i.naturalWidth > 0,
  }))
  return {
    title: document.title,
    ids: ids.map((id) => `${id}:${!!document.getElementById(id)}`),
    h1s: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim()),
    nav: [...document.querySelectorAll('.navbar-links a')].map((a) => a.textContent.trim()),
    canvases: document.querySelectorAll('canvas').length,
    lanyardImgs: [...document.querySelectorAll('.lanyard img')].map((i) => i.src.split('/').pop()),
    brokenImgs: imgs.filter((i) => !i.ok),
    pageHeight: document.documentElement.scrollHeight,
    hasOverflowX: document.documentElement.scrollWidth > window.innerWidth,
  }
})
console.log('   ', JSON.stringify(base, null, 2))
await page.screenshot({ path: `${OUT}/01-hero.png` })

/* Screenshot tiap section */
const sections = ['About', 'experience-section', 'spotify-section', 'Portofolio', 'Contact']
let n = 2
for (const sel of ['About', '.experience-section', '.spotify-section', 'Portofolio', 'Contact']) {
  await page.evaluate((s) => {
    const el = s.startsWith('.') ? document.querySelector(s) : document.getElementById(s)
    el?.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, sel)
  await page.waitForTimeout(1100)
  await page.screenshot({ path: `${OUT}/${String(n).padStart(2, '0')}-${sel.replace(/[^\w]/g, '')}.png` })
  n += 1
}

/* Scrollspy: klik nav About */
await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
await page.waitForTimeout(400)
await page.click('.navbar-links a[href="#About"]')
await page.waitForTimeout(1500)
const activeAfterClick = await page.evaluate(
  () => document.querySelector('.navbar-link-item.is-active')?.textContent.trim() ?? null,
)
console.log('   nav aktif setelah klik About:', activeAfterClick)

/* Tab Portfolio */
await page.evaluate(() => document.getElementById('Portofolio')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(800)
const tabCounts = {}
for (const label of ['Certificates', 'Tech Stack', 'Projects']) {
  await page.click(`.portfolio-tab-btn:has-text("${label}")`)
  await page.waitForTimeout(700)
  tabCounts[label] = await page.evaluate(() => ({
    projects: document.querySelectorAll('.portfolio-project-card').length,
    certs: document.querySelectorAll('.portfolio-cert-card').length,
    skills: document.querySelectorAll('.portfolio-skill-card').length,
  }))
}
console.log('   tab:', JSON.stringify(tabCounts))
await page.screenshot({ path: `${OUT}/07-portfolio-tab.png` })

/* Route detail proyek */
await page.evaluate(() => document.getElementById('Portofolio')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(500)
await page.click('.portfolio-details-btn')
await page.waitForTimeout(1200)
const detail = await page.evaluate(() => ({
  path: location.pathname,
  crumb: document.querySelector('.project-detail-crumb-current')?.textContent.trim(),
  title: document.querySelector('.project-detail-title')?.textContent.trim(),
  chips: [...document.querySelectorAll('.project-detail-tech-chip')].map((c) => c.textContent.trim()),
  navbarVisible: !!document.querySelector('.navbar-root'),
  footerVisible: !!document.querySelector('.footer-root'),
}))
console.log('   detail:', JSON.stringify(detail, null, 2))
await page.screenshot({ path: `${OUT}/08-detail.png` })

await page.click('.project-detail-back')
await page.waitForTimeout(1200)
const afterBack = await page.evaluate(() => ({
  path: location.pathname,
  navbar: !!document.querySelector('.navbar-root'),
  contact: !!document.getElementById('Contact'),
}))
console.log('   setelah Back:', JSON.stringify(afterBack))

/* Komentar localStorage */
await page.evaluate(() => document.getElementById('Contact')?.scrollIntoView({ behavior: 'instant' }))
await page.waitForTimeout(700)
await page.fill('#comment-name', 'QA Tester')
await page.fill('#comment-message', 'Komentar uji otomatis dari Playwright.')
await page.click('.contact-comment-form .contact-submit-btn')
await page.waitForTimeout(1500)
const commentState = await page.evaluate(() => ({
  items: [...document.querySelectorAll('.contact-comment-item strong')].map((s) => s.textContent),
  count: document.querySelector('.contact-comments-header h2')?.textContent.trim(),
  btn: document.querySelector('.contact-comment-form .contact-submit-btn span')?.textContent.trim(),
  disabled: document.querySelector('.contact-comment-form .contact-submit-btn')?.disabled,
  cooldown: !!document.querySelector('.contact-comment-cooldown'),
  cooldownLabel: document.querySelector('.contact-comment-cooldown-label')?.textContent.trim(),
  stored: JSON.parse(localStorage.getItem('portfolio-comments') || '[]').length,
}))
console.log('   komentar:', JSON.stringify(commentState, null, 2))
await page.screenshot({ path: `${OUT}/09-komentar.png` })

/* Form pesan: validasi + mailto (jangan benar-benar navigasi) */
await page.fill('#user-name', 'QA')
await page.fill('#user-email', 'qa@example.com')
await page.fill('#user-msg', 'Halo, ini pesan uji.')
const mailtoHref = await page.evaluate(() => {
  const f = document.querySelector('.contact-actual-form')
  return !!f && !!f.querySelector('#user-name') && !!f.querySelector('#user-msg')
})
console.log('   form pesan siap:', mailtoHref)

/* Footer */
await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }))
await page.waitForTimeout(800)
await page.screenshot({ path: `${OUT}/10-footer.png` })

/* ============ MOBILE ============ */
const mctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2,
})
const mpage = await mctx.newPage()
hook(mpage, 'mobile')
await mpage.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 })
await mpage
  .waitForSelector('.welcome-screen-root', { state: 'detached', timeout: 30000 })
  .catch(() => console.log('   [mobile] loader tidak hilang'))
await mpage.waitForTimeout(3500)

const mob = await mpage.evaluate(() => ({
  overflowX: document.documentElement.scrollWidth - window.innerWidth,
  lanyardBox: (() => {
    const el = document.querySelector('.lanyard-card-container')
    if (!el) return null
    const r = el.getBoundingClientRect()
    return `${Math.round(r.width)}x${Math.round(r.height)}`
  })(),
  tabCols: getComputedStyle(document.querySelector('.portfolio-tab-bar')).gridTemplateColumns,
  brand: document.querySelector('.navbar-mobile-brand')?.textContent.trim(),
}))
console.log('   mobile:', JSON.stringify(mob, null, 2))
await mpage.screenshot({ path: `${OUT}/m1-hero.png` })

/* Menu hamburger */
await mpage.click('.navbar-mobile-toggle')
await mpage.waitForTimeout(700)
const menuOpen = await mpage.evaluate(() => ({
  open: !!document.querySelector('.navbar-mobile-menu.is-open'),
  links: [...document.querySelectorAll('.navbar-mobile-link')].map((a) => a.textContent.trim()),
}))
console.log('   menu mobile:', JSON.stringify(menuOpen))
await mpage.screenshot({ path: `${OUT}/m2-menu.png` })
await mpage.click('.navbar-mobile-link:has-text("Portfolio")')
await mpage.waitForTimeout(1600)
await mpage.screenshot({ path: `${OUT}/m3-portfolio.png` })

await mpage.evaluate(() => document.getElementById('Contact')?.scrollIntoView({ behavior: 'instant' }))
await mpage.waitForTimeout(900)
await mpage.screenshot({ path: `${OUT}/m4-contact.png` })
await mpage.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }))
await mpage.waitForTimeout(700)
await mpage.screenshot({ path: `${OUT}/m5-footer.png` })

const mobOverflow = await mpage.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
console.log('   mobile overflow-x:', mobOverflow)

/* ============ RINGKASAN ============ */
console.log('\n=== ERROR (' + errors.length + ') ===')
errors.forEach((e) => console.log(' -', e))
console.log('=== WARNING (' + warnings.length + ') ===')
warnings.slice(0, 15).forEach((w) => console.log(' -', w))

await browser.close()
process.exit(errors.length ? 1 : 0)
