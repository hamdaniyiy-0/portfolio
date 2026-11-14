/* Uji 4 task upgrade:
   1) Micro-interactions: tilt kartu (X/Y, aman untuk drag/flip), parallax
      bintang (rAF). Kursor neon sudah DIHAPUS — dipastikan tidak ada.
   2) Bento grid TechStack + pratinjau hover kartu project.
   3) Command menu: Ctrl+K, filter, klik -> scroll, Esc, ikon navbar.
   4) Konten & mobile: chip "Available for work" sudah DIHAPUS dari navbar,
      bintang berkurang, layout hero tetap vertikal tanpa tumpang tindih.
*/
import { chromium } from 'playwright-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const URL = 'http://localhost:5173/'

const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const errors = []
const results = []
const ok = (label, pass, detail = '') =>
  results.push({ label, status: pass ? 'OK' : 'GAGAL', detail })

/* ================= DESKTOP ================= */
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
page.on('console', (m) => m.type() === 'error' && errors.push('console: ' + m.text()))

await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 })
await page.waitForTimeout(13000) // preloader selesai

/* ---- Task 2a: Bento grid TechStack ---- */
{
  const stack = await page.evaluate(() => {
    const section = document.getElementById('stack')
    if (!section) return null
    const names = [...section.querySelectorAll('h3')].map((h) => h.textContent.trim())
    const big = section.querySelector('[class*="md:row-span-2"], [class*="row-span-2"]')
    const svgs = section.querySelectorAll('svg').length
    return { names, hasBig: !!big, svgs, title: section.querySelector('h2')?.textContent.trim() }
  })
  ok(
    'bento: section #stack + 5 teknologi + 5 logo SVG',
    !!stack &&
      stack.names.length === 5 &&
      stack.svgs >= 5 &&
      stack.hasBig &&
      ['React', 'Three.js', 'Tailwind CSS', 'JavaScript', 'Figma'].every((n) => stack.names.includes(n)),
    JSON.stringify(stack),
  )
}

/* ---- Task 2b: pratinjau hover kartu project ---- */
{
  await page.evaluate(() => document.getElementById('portfolio')?.scrollIntoView())
  await page.waitForTimeout(800)
  const card = page.locator('#portfolio article').first()
  await card.hover()
  await page.waitForTimeout(700)
  const preview = await card.evaluate((el) => {
    const overlay = [...el.querySelectorAll('div')].find((d) =>
      d.className.includes('transition-opacity duration-500'),
    )
    if (!overlay) return { found: false }
    return {
      found: true,
      opacity: getComputedStyle(overlay).opacity,
      hasWireframe: overlay.querySelector('[class*="animate-pulse"]') !== null,
    }
  })
  ok(
    'project: pratinjau hover muncul (wireframe bergerak)',
    preview.found && preview.opacity === '1' && preview.hasWireframe,
    JSON.stringify(preview),
  )

  // fade-in-up Reveal tetap ada
  const revealed = await card.evaluate((el) => getComputedStyle(el).opacity !== '0')
  ok('project: kartu tampil (Reveal fade-in-up)', revealed)
}

/* ---- Task 3: Command menu ---- */
{
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(400)

  // Buka lewat Ctrl+K
  await page.keyboard.press('Control+k')
  await page.waitForTimeout(500)
  const opened = await page.evaluate(() => {
    const input = document.querySelector('[cmdk-input]')
    return {
      open: !!input,
      focused: document.activeElement === input,
      items: document.querySelectorAll('[cmdk-item]').length,
      status: [...document.querySelectorAll('header span')].some((s) =>
        s.textContent.includes('Available for work'),
      ),
    }
  })
  ok(
    'command: Ctrl+K membuka modal + input fokus + 7 item (4 nav + 3 sosial)',
    opened.open && opened.focused && opened.items === 7,
    JSON.stringify(opened),
  )
  ok('navbar: chip "Available for work" SUDAH dihapus', !opened.status, `status=${opened.status}`)

  // Filter otomatis
  await page.keyboard.type('port')
  await page.waitForTimeout(400)
  const filtered = await page.evaluate(() =>
    [...document.querySelectorAll('[cmdk-item]')].map((i) => i.textContent.trim()),
  )
  ok(
    'command: filter mengetik menyisakan "Portfolio"',
    filtered.length === 1 && filtered[0].includes('Portfolio'),
    JSON.stringify(filtered),
  )

  // Klik item -> modal tutup + scroll ke section
  await page.locator('[cmdk-item]').first().click()
  await page.waitForTimeout(1200)
  const afterSelect = await page.evaluate(() => ({
    closed: !document.querySelector('[cmdk-input]'),
    scrollY: window.scrollY,
    atPortfolio: Math.abs(
      document.getElementById('portfolio').getBoundingClientRect().top,
    ) < 140,
  }))
  ok(
    'command: klik item menutup + scroll halus ke section',
    afterSelect.closed && afterSelect.scrollY > 0 && afterSelect.atPortfolio,
    JSON.stringify(afterSelect),
  )

  // Buka lagi -> Esc menutup
  await page.keyboard.press('Control+k')
  await page.waitForTimeout(400)
  await page.keyboard.press('Escape')
  await page.waitForTimeout(400)
  const escClosed = await page.evaluate(() => !document.querySelector('[cmdk-input]'))
  ok('command: Esc menutup modal', escClosed)

  // Buka lewat ikon navbar -> pilih sosial -> tab baru
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(300)
  const [popup] = await Promise.all([
    page.waitForEvent('popup', { timeout: 8000 }).catch(() => null),
    page.locator('header button[aria-label="Buka command menu"]').click(),
  ])
  await page.waitForTimeout(400)
  await page.keyboard.type('git')
  await page.waitForTimeout(400)
  const socialHit = await page.evaluate(() => {
    const items = [...document.querySelectorAll('[cmdk-item]')]
    return items.length === 1 && items[0].textContent.includes('GitHub')
  })
  ok('command: filter sosial "git" -> GitHub', socialHit)

  const [popup2] = await Promise.all([
    page.waitForEvent('popup', { timeout: 8000 }).catch(() => null),
    page.locator('[cmdk-item]').first().click(),
  ])
  await page.waitForTimeout(500)
  const closedAfterSocial = await page.evaluate(() => !document.querySelector('[cmdk-input]'))
  ok(
    'command: klik sosial membuka tab baru + modal tutup',
    closedAfterSocial && (!!popup || !!popup2),
    `popup1=${!!popup} popup2=${!!popup2}`,
  )
  if (popup) await popup.close().catch(() => {})
  if (popup2) await popup2.close().catch(() => {})
}

/* ---- Kursor neon: SUDAH DIHAPUS — dipastikan benar-benar bersih ---- */
{
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(400)
  await page.mouse.move(400, 400) // masuk area hero (kolom teks)
  await page.waitForTimeout(500)
  const clean = await page.evaluate(() => {
    const hero = document.getElementById('home')
    const h1 = hero.querySelector('h1')
    return {
      attr: hero.getAttribute('data-neon-cursor'),
      h1Cursor: getComputedStyle(h1).cursor,
      glowDot: !!document.querySelector('div[class*="z-[100]"]'),
    }
  })
  ok(
    'kursor: neon dihapus (kursor bawaan normal, tanpa titik glow)',
    clean.attr === null && clean.h1Cursor !== 'none' && !clean.glowDot,
    JSON.stringify(clean),
  )
}

/* ---- Task 1b: tilt kartu (X/Y) + reset saat pointerdown ---- */
{
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(400)
  const wrapper = 'div[class*="will-change-transform"]'
  // Pastikan elemen wadah tilt ada di dalam hero
  const exists = await page.evaluate(
    () => !!document.querySelector('#home div[class*="will-change-transform"] canvas, #home div[class*="will-change-transform"]'),
  )
  ok('tilt: wadah kartu punya elemen target', exists)

  await page.mouse.move(1100, 420) // zona kanan (kartu)
  await page.waitForTimeout(700)
  const tilted = await page.evaluate(() => {
    const el = document.querySelector('#home div[class*="will-change-transform"]')
    return el ? el.style.transform : ''
  })
  ok(
    'tilt: rotateX/rotateY aktif saat hover zona kartu',
    /rotateX\(-?\d/.test(tilted) && /rotateY\(-?\d/.test(tilted),
    tilted,
  )

  // pointerdown -> transform dikosongkan sinkron (aman untuk drag/flip)
  await page.mouse.down()
  const duringDown = await page.evaluate(
    () => document.querySelector('#home div[class*="will-change-transform"]').style.transform,
  )
  await page.mouse.up()
  ok('tilt: reset datar saat pointerdown (drag/flip aman)', duringDown === '', duringDown)

  // Di luar zona (kolom teks) -> kembali datar
  await page.mouse.move(300, 500)
  await page.waitForTimeout(900)
  const backFlat = await page.evaluate(
    () => document.querySelector('#home div[class*="will-change-transform"]').style.transform,
  )
  ok('tilt: kembali datar di luar zona kartu', backFlat === '', backFlat)
}

/* ---- Task 1c: parallax bintang (rAF) ---- */
{
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.mouse.move(200, 200)
  await page.waitForTimeout(300)
  await page.mouse.move(1200, 700, { steps: 5 })
  await page.waitForTimeout(800)
  const bgT = await page.evaluate(() => {
    const wrappers = [...document.querySelectorAll('.will-change-transform')].filter(
      (el) => !el.closest('#home'),
    )
    return wrappers.map((w) => w.style.transform)
  })
  ok(
    'parallax: wrapper latar bergeser mengikuti mouse (rAF)',
    bgT.length >= 2 && bgT.every((t) => /translate3d/.test(t)),
    JSON.stringify(bgT),
  )
}

await page.close()

/* ================= MOBILE (touch) ================= */
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  })
  const m = await ctx.newPage()
  m.on('pageerror', (e) => errors.push('mobile pageerror: ' + e.message))
  m.on('console', (msg) => msg.type() === 'error' && errors.push('mobile console: ' + msg.text()))
  await m.goto(URL, { waitUntil: 'networkidle', timeout: 90000 })
  await m.waitForTimeout(13000)

  const state = await m.evaluate(() => {
    // Layer starfield paling rapat disembunyikan (hemat FPS ponsel)
    const denseLayer = document.querySelector('.space-dense')
    // Parallax mati (tidak ada transform di wrapper latar)
    const bgWrappers = [...document.querySelectorAll('.will-change-transform')].filter(
      (el) => !el.closest('#home'),
    )
    // Kursor neon sudah dihapus — pastikan tidak ada elemen tersisa
    return {
      denseHidden: denseLayer ? getComputedStyle(denseLayer).display === 'none' : false,
      parallaxOff: bgWrappers.every((w) => w.style.transform === ''),
      noNeon: document.getElementById('home').getAttribute('data-neon-cursor') === null,
    }
  })
  ok(
    'mobile: layer starfield terpadat disembunyikan',
    state.denseHidden,
    JSON.stringify(state),
  )
  ok('mobile: parallax nonaktif & tanpa kursor neon', state.parallaxOff && state.noNeon)

  // Hero vertikal: teks di atas, kartu di bawah, tanpa tumpang tindih
  const layout = await m.evaluate(() => {
    const bio = document.querySelector('#home p[class*="max-w-xl"]')
    const stage = document.querySelector('#home div[class*="h-[380px]"]')
    const overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth
    return {
      bioTop: bio?.getBoundingClientRect().top ?? 0,
      cardTop: stage?.getBoundingClientRect().top ?? 0,
      overflow,
    }
  })
  ok(
    'mobile: kartu di bawah teks + tanpa overflow horizontal',
    layout.cardTop > layout.bioTop && layout.overflow === 0,
    JSON.stringify(layout),
  )

  // Command menu bisa dibuka dengan ikon (tanpa Ctrl+K)
  await m.locator('header button[aria-label="Buka command menu"]').tap()
  await m.waitForTimeout(600)
  const mMenu = await m.evaluate(() => ({
    open: !!document.querySelector('[cmdk-input]'),
    locked: document.body.style.overflow === 'hidden',
  }))
  ok('mobile: ikon navbar membuka command menu + kunci scroll', mMenu.open && mMenu.locked, JSON.stringify(mMenu))
  await m.keyboard.press('Escape')
  await m.waitForTimeout(400)

  await ctx.close()
}

console.log(JSON.stringify(results, null, 1))
const allOk = results.every((r) => r.status === 'OK')
console.log('ERRORS:', errors.length, errors.slice(0, 6))
console.log(allOk && errors.length === 0 ? 'PASS' : 'FAIL')
await browser.close()
process.exit(allOk && errors.length === 0 ? 0 : 1)
