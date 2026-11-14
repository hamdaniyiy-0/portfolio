/* Uji riwayat pendidikan + Animated Thin Border Stats Card:
   1) Section Education ada TEPAT DI BAWAH About (urutan DOM).
   2) Dua kartu sekolah dengan nama & tahun persis (SMP 2022–2025, SMK 2025–2027).
   3) Stats Card punya lapisan conic-gradient yang berputar (@keyframes).
   4) Bagian tengah kartu ditutup background (hanya tersisa garis tipis),
      konten teks berada DI ATAS lapisan beam (keterbacaan terjaga).
   5) Reduced-motion mematikan animasi beam.
   6) Ponsel: 1 kolom, tanpa overflow horizontal, tanpa error console.
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

/* 1) Posisi section: Education setelah About */
{
  const pos = await page.evaluate(() => {
    const about = document.getElementById('about')
    const edu = document.getElementById('education')
    if (!about || !edu) return null
    const afterAbout = !!(about.compareDocumentPosition(edu) & Node.DOCUMENT_POSITION_FOLLOWING)
    const beforeStats = !!(
      edu.compareDocumentPosition(document.querySelector('.stats-beam')) &
      Node.DOCUMENT_POSITION_FOLLOWING
    )
    return { afterAbout, beforeStats }
  })
  ok(
    'education: section ada & urutannya setelah About, sebelum Stats',
    pos && pos.afterAbout && pos.beforeStats,
    JSON.stringify(pos),
  )
}

/* 2) Isi kartu pendidikan — nama & tahun persis */
{
  const cards = await page.evaluate(() =>
    [...document.querySelectorAll('#education h3')].map((h) => ({
      school: h.textContent.trim(),
      level: h.parentElement.querySelector('p')?.textContent.trim(),
      years: h.parentElement.querySelector('p.font-mono')?.textContent.trim(),
    })),
  )
  const smp = cards.find((c) => c.school === 'SMP AL-HADIID CILEUNGSI')
  const smk = cards.find((c) => c.school === 'SMK AL-HADIID 1 CILEUNGSI')
  ok(
    'education: SMP AL-HADIID CILEUNGSI (2022 – 2025)',
    !!smp && smp.years.includes('2022 – 2025') && !!smp.level,
    JSON.stringify(smp),
  )
  ok(
    'education: SMK AL-HADIID 1 CILEUNGSI (2025 – 2027)',
    !!smk && smk.years.includes('2025 – 2027') && !!smk.level,
    JSON.stringify(smk),
  )
  ok('education: tepat 2 kartu', cards.length === 2, `jumlah=${cards.length}`)
}

/* 3) Animated thin border: conic-gradient + animasi berputar */
await page.evaluate(() => document.querySelector('.stats-beam')?.closest('section')?.scrollIntoView({ block: 'center' }))
await page.waitForTimeout(900)

{
  const beam = await page.evaluate(() => {
    const el = document.querySelector('.stats-beam')
    if (!el) return null
    const cs = getComputedStyle(el)
    const card = el.closest('div.group')
    const cover = el.nextElementSibling
    const ccs = getComputedStyle(cover)
    const content = card.querySelector(':scope > div.relative.z-10')
    return {
      bg: cs.backgroundImage,
      anim: cs.animationName,
      dur: cs.animationDuration,
      iter: cs.animationIterationCount,
      mask: cs.maskImage || cs.webkitMaskImage || '',
      pad: cs.padding,
      coverInset: ccs.inset,
      coverBg: ccs.backgroundColor,
      coverW: cover.clientWidth,
      cardW: card.clientWidth,
      contentZ: content ? getComputedStyle(content).zIndex : null,
      text: card.textContent,
    }
  })
  ok(
    'beam: background conic-gradient + animasi infinite berputar',
    beam && beam.bg.includes('conic-gradient') && beam.anim === 'stats-beam-spin' && beam.iter.includes('infinite'),
    JSON.stringify({ bg: beam?.bg?.slice(0, 80), anim: beam?.anim, dur: beam?.dur, iter: beam?.iter }),
  )
  ok(
    'beam: dipotong mask jadi cincin tipis (tengah benar-benar bersih)',
    beam && beam.pad === '1.5px' && beam.mask.includes('linear-gradient'),
    JSON.stringify({ pad: beam?.pad, mask: beam?.mask?.slice(0, 60) }),
  )
  ok(
    'beam: tengah kartu ditutup background (sisa garis tipis 1.5px)',
    beam && beam.coverInset === '1.5px' && beam.cardW - beam.coverW === 3,
    JSON.stringify({ inset: beam?.coverInset, delta: beam ? beam.cardW - beam.coverW : null }),
  )
  ok(
    'beam: konten teks DI ATAS lapisan (z-index 10) — keterbacaan aman',
    beam && beam.contentZ === '10' && /PROJECTS|PROJECT/i.test(beam.text),
    JSON.stringify({ contentZ: beam?.contentZ, text: beam?.text?.slice(0, 60) }),
  )
}

/* Bukti berputar: sudut --beam-angle berubah antar waktu */
{
  const read = () =>
    page.evaluate(() =>
      getComputedStyle(document.querySelector('.stats-beam')).getPropertyValue('--beam-angle').trim(),
    )
  const a1 = await read()
  await page.waitForTimeout(400)
  const a2 = await read()
  ok('beam: sudut gradient benar-benar berubah (muter)', a1 !== a2 && a1 !== '', `${a1} -> ${a2}`)
}

/* Tengah kartu: element teratas BUKAN beam (tertutup cover/konten) */
{
  const top = await page.evaluate(() => {
    const beam = document.querySelector('.stats-beam')
    const card = beam.closest('div.group')
    const r = card.getBoundingClientRect()
    const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return { isBeam: !!el?.closest('.stats-beam'), inside: card.contains(el), tag: el?.tagName }
  })
  ok('beam: titik tengah kartu bukan lapisan beam (tertutup rapat)', !top.isBeam && top.inside, JSON.stringify(top))
}

/* Screenshot review visual (education + stats) */
await page.evaluate(() => document.getElementById('education')?.scrollIntoView({ block: 'start' }))
await page.waitForTimeout(800)
await page.screenshot({ path: 'scripts/edu-stats.png' })

await page.close()

/* ================= REDUCED MOTION ================= */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  const p = await ctx.newPage()
  p.on('pageerror', (e) => errors.push('rm pageerror: ' + e.message))
  await p.goto(URL, { waitUntil: 'networkidle', timeout: 90000 })
  await p.waitForTimeout(13000)
  const anim = await p.evaluate(() =>
    getComputedStyle(document.querySelector('.stats-beam')).animationName,
  )
  ok('reduced-motion: animasi beam mati', anim === 'none', `animationName=${anim}`)
  await ctx.close()
}

/* ================= MOBILE (touch) ================= */
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
  const m = await ctx.newPage()
  m.on('pageerror', (e) => errors.push('mobile pageerror: ' + e.message))
  m.on('console', (msg) => msg.type() === 'error' && errors.push('mobile console: ' + msg.text()))
  await m.goto(URL, { waitUntil: 'networkidle', timeout: 90000 })
  await m.waitForTimeout(13000)

  const state = await m.evaluate(() => {
    const edu = document.getElementById('education')
    const cards = [...edu.querySelectorAll('h3')]
    const rects = cards.map((h) => h.getBoundingClientRect())
    return {
      cards: cards.length,
      stacked: rects.length === 2 && rects[0].top < rects[1].top, // tumpuk vertikal
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      beam: !!document.querySelector('.stats-beam'),
    }
  })
  ok('mobile: kartu pendidikan tumpuk 1 kolom', state.cards === 2 && state.stacked, JSON.stringify(state))
  ok('mobile: tanpa overflow horizontal', state.overflow === 0, `overflow=${state.overflow}`)
  ok('mobile: beam stats tetap ada', state.beam === true)

  await ctx.close()
}

console.log(JSON.stringify(results, null, 1))
const allOk = results.every((r) => r.status === 'OK')
console.log('ERRORS:', errors.length, errors.slice(0, 6))
console.log(allOk && errors.length === 0 ? 'PASS' : 'FAIL')
await browser.close()
process.exit(allOk && errors.length === 0 ? 0 : 1)
