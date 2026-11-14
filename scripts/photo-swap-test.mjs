/* Uji foto About: cutout (latar merah dihapus) + Animated Thin Border
   putih mengikuti siluet + status swap yang jujur (file belum ada):
   1) foto-asli.png benar-benar transparan di sudut, objek tetap utuh
   2) lapisan .photo-beam: conic-gradient PUTIH + mask PNG ring siluet,
      animasi berputar (sudut berubah), glow via drop-shadow di wrapper
   3) foto-spiderman TIDAK ada -> overlay swap tidak dirender, tombol
      swap dinonaktifkan (tanpa aria-pressed), petunjuk "hover / ketuk
      foto" tidak tampil — tanpa 404 di console
   4) reduced-motion: animasi beam mati
   5) ponsel: tanpa overflow horizontal, tanpa error console
*/
import { chromium } from 'playwright-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const URL = 'http://localhost:5173/'

const browser = await chromium.launch({ executablePath: EDGE, headless: true })
const errors = []
const results = []
const ok = (label, pass, detail = '') => results.push({ label, status: pass ? 'OK' : 'GAGAL', detail })

/* ================= DESKTOP ================= */
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
page.on('console', (m) => m.type() === 'error' && errors.push('console: ' + m.text()))

await page.goto(URL, { waitUntil: 'networkidle', timeout: 90000 })
await page.waitForTimeout(13000) // preloader selesai
await page.evaluate(() => document.getElementById('about')?.scrollIntoView({ block: 'center' }))
await page.waitForTimeout(1200)

/* 1) Bukti latar merah sudah hilang: sampel piksel langsung dari PNG */
{
  const px = await page.evaluate(async () => {
    const load = (url) =>
      new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = url
      })
    const img = await load('/foto-asli.png')
    const c = document.createElement('canvas')
    c.width = img.naturalWidth
    c.height = img.naturalHeight
    const ctx = c.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(img, 0, 0)
    const at = (x, y) => [...ctx.getImageData(x, y, 1, 1).data] // r,g,b,a
    return {
      w: img.naturalWidth,
      h: img.naturalHeight,
      cornerTL: at(10, 10),
      cornerBR: at(img.naturalWidth - 10, img.naturalHeight - 10),
      face: at(Math.floor(img.naturalWidth / 2), Math.floor(img.naturalHeight * 0.38)),
      uniform: at(Math.floor(img.naturalWidth * 0.35), Math.floor(img.naturalHeight * 0.75)),
    }
  })
  ok(
    'cutout: 4 sudut foto BENAR-BENAR transparan (latar merah hilang)',
    px && px.cornerTL[3] === 0 && px.cornerBR[3] === 0,
    JSON.stringify(px && { w: px.w, h: px.h, cornerTL: px.cornerTL, cornerBR: px.cornerBR }),
  )
  ok(
    'cutout: objek manusia UTUH (wajah kulit + seragam opaque)',
    px && px.face[3] === 255 && px.uniform[3] === 255 && px.face[0] > px.face[1],
    JSON.stringify(px && { face: px.face, uniform: px.uniform }),
  )
}

/* 2) Animated thin border putih mengikuti siluet */
{
  const beam = await page.evaluate(() => {
    const el = document.querySelector('.photo-beam')
    if (!el) return null
    const cs = getComputedStyle(el)
    const wrap = el.parentElement
    const wcs = getComputedStyle(wrap)
    return {
      bg: cs.backgroundImage,
      mask: cs.maskImage || cs.webkitMaskImage || '',
      maskSize: cs.maskSize || cs.webkitMaskSize || '',
      maskPos: cs.maskPosition || cs.webkitMaskPosition || '',
      anim: cs.animationName,
      iter: cs.animationIterationCount,
      dur: cs.animationDuration,
      glow: wcs.filter,
      boxW: wrap.clientWidth,
      boxH: wrap.clientHeight,
    }
  })
  ok(
    'beam: conic-gradient PUTIH berputar infinite (4.5s)',
    beam &&
      beam.bg.includes('conic-gradient') &&
      /255,\s*255,\s*255/.test(beam.bg) &&
      beam.anim === 'stats-beam-spin' &&
      beam.iter.includes('infinite'),
    JSON.stringify({ bg: beam?.bg?.slice(0, 90), anim: beam?.anim, dur: beam?.dur, iter: beam?.iter }),
  )
  ok(
    'beam: dipotong MASK png ring siluet (cover/center — presisi dgn object-cover)',
    !!beam &&
      beam.mask.includes('/foto-asli-ring.png') &&
      beam.maskSize.includes('cover') &&
      (beam.maskPos.includes('center') || beam.maskPos.includes('50%')),
    JSON.stringify({ mask: beam?.mask, size: beam?.maskSize, pos: beam?.maskPos }),
  )
  ok(
    'beam: glow drop-shadow di WRAPPER (filter di luar elemen bermask)',
    !!beam && beam.glow.includes('drop-shadow') && beam.boxW > 100 && beam.boxH > 100,
    JSON.stringify({ glow: beam?.glow, box: `${beam?.boxW}x${beam?.boxH}` }),
  )
}

/* Bukti benar-benar berputar: sudut gradient berubah antar waktu */
{
  const read = () =>
    page.evaluate(() =>
      getComputedStyle(document.querySelector('.photo-beam')).getPropertyValue('--beam-angle').trim(),
    )
  const a1 = await read()
  await page.waitForTimeout(450)
  const a2 = await read()
  ok('beam: sudut gradient berubah (berputar)', a1 !== a2 && a1 !== '', `${a1} -> ${a2}`)
}

/* 3) Status swap jujur — foto-spiderman belum ada */
{
  const s = await page.evaluate(() => {
    const about = document.getElementById('about')
    const box = about?.querySelector('div.group')
    const imgs = [...(box?.querySelectorAll('img') ?? [])]
    const hint = [...about.querySelectorAll('p')].find((p) => /ketuk foto/i.test(p.textContent))
    return {
      imgCount: imgs.length,
      srcs: imgs.map((i) => i.getAttribute('src')),
      interactive: !!box?.getAttribute('role'),
      pressed: box?.getAttribute('aria-pressed'),
      hint: hint ? hint.textContent.trim() : null,
      beam: !!box?.querySelector('.photo-beam'),
      missingPanel: !![...box.querySelectorAll('p')].find((p) => /foto belum dipasang/i.test(p.textContent)),
      aspect: getComputedStyle(box).aspectRatio,
    }
  })
  ok(
    'swap: foto-spiderman belum ada -> HANYA 1 foto (overlay tidak dirender)',
    s && s.imgCount === 1 && s.srcs[0] === '/foto-asli.png',
    JSON.stringify(s && { imgCount: s.imgCount, srcs: s.srcs }),
  )
  ok(
    'swap: tombol NONAKTIF (tanpa role/aria-pressed) — tidak ada tombol palsu',
    s && !s.interactive && s.pressed === null,
    JSON.stringify({ interactive: s?.interactive, pressed: s?.pressed }),
  )
  ok(
    'swap: petunjuk "hover / ketuk foto" TIDAK tampil',
    s && (s.hint === null || s.hint === ''),
    `hint=${JSON.stringify(s?.hint)}`,
  )
  ok(
    'foto: cutout dipakai + beam terpasang + bingkai square (tanpa panel kosong)',
    s && s.beam && !s.missingPanel && s.aspect === '1 / 1',
    JSON.stringify({ beam: s?.beam, missing: s?.missingPanel, aspect: s?.aspect }),
  )
}

/* 4) Reduced motion: animasi beam mati */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  const p = await ctx.newPage()
  p.on('pageerror', (e) => errors.push('rm pageerror: ' + e.message))
  await p.goto(URL, { waitUntil: 'networkidle', timeout: 90000 })
  await p.waitForTimeout(13000)
  const anim = await p.evaluate(() => getComputedStyle(document.querySelector('.photo-beam')).animationName)
  ok('reduced-motion: animasi beam foto mati', anim === 'none', `animationName=${anim}`)
  await ctx.close()
}

/* Screenshot review visual */
await page.evaluate(() => document.getElementById('about')?.scrollIntoView({ block: 'center' }))
await page.waitForTimeout(900)
await page.screenshot({ path: 'scripts/photo-about.png' })

await page.close()

/* ================= MOBILE (touch) ================= */
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
  const m = await ctx.newPage()
  m.on('pageerror', (e) => errors.push('mobile pageerror: ' + e.message))
  m.on('console', (msg) => msg.type() === 'error' && errors.push('mobile console: ' + msg.text()))
  await m.goto(URL, { waitUntil: 'networkidle', timeout: 90000 })
  await m.waitForTimeout(13000)
  await m.evaluate(() => document.getElementById('about')?.scrollIntoView({ block: 'center' }))
  await m.waitForTimeout(900)

  const state = await m.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    imgs: document.querySelectorAll('#about div.group img').length,
    beam: !!document.querySelector('.photo-beam'),
    missing: !!document.querySelector('#about img[src*="avatar.svg"]'),
  }))
  ok('mobile: tanpa overflow horizontal', state.overflow === 0, `overflow=${state.overflow}`)
  ok('mobile: foto cutout + beam tetap tampil', state.imgs === 1 && state.beam && !state.missing, JSON.stringify(state))

  await m.screenshot({ path: 'scripts/photo-about-mobile.png' })
  await ctx.close()
}

console.log(JSON.stringify(results, null, 1))
const allOk = results.every((r) => r.status === 'OK')
console.log('ERRORS:', errors.length, errors.slice(0, 6))
console.log(allOk && errors.length === 0 ? 'PASS' : 'FAIL')
await browser.close()
process.exit(allOk && errors.length === 0 ? 0 : 1)
