/* ==========================================================
   CUTOUT FOTO — hapus latar (merah/vignette/bingkai hitam)
   + generate mask CINCIN SILUET untuk Animated Thin Border.

   Pemakaian:
     node scripts/cutout-photo.mjs [--in <file>] [--out <basename>]
     default: --in "public/FOTO DIRI me.png" --out public/foto-asli
     hasil  : <basename>.png (cutout transparan)
              <basename>-ring.png (cincin putih mengikuti siluet,
              dipakai sebagai CSS mask beam di PhotoSwap.jsx)

   Cara kerja:
     1. Crop baris/kolom hitam penuh (bingkai) di atas-bawah gambar.
     2. Seed = piksel di SEMUA tepi yang merah kuat (r-g>=25 && r-b>=25),
        lalu region-grow ke tetangga selama JARAK WARNA lokal <=32/step.
        Gradien vignette merah dilewati bertahap, tapi batas tajam
        merah->kulit (~190), merah->rambut (~132), merah->seragam (~160)
        terblokir — jadi objek interior (kulit, logo merah, mata) aman
        walaupun warnanya mirip merah.
     3. Fringe 1px di sekitar latar ikut terhapus (weakRed + dekat warna
        latar), lalu spill merah di tepi ditekan.
     4. Alpha di-feather (blur 3x3) supaya tepi halus.
     5. Ring = dilate(alpha, r=3) MINUS alpha — cincin ~3px di luar
        siluet (±1px saat tampil di layar karena foto diskalakan).
   ========================================================== */
import sharp from 'sharp'

const args = process.argv.slice(2)
const getArg = (name, fallback) => {
  const i = args.indexOf(name)
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback
}
const INPUT = getArg('--in', 'public/FOTO DIRI me.png')
const OUT = getArg('--out', 'public/foto-asli')

const RING_RADIUS = 3 // px sumber (foto ditampilkan ±0.32x -> ±1px layar)

const { data, info } = await sharp(INPUT).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
let { width: W, height: H, channels: C } = info
let buf = data
console.log(`input: ${INPUT} (${W}x${H})`)

/* ---------- 1. Crop bingkai hitam penuh (baris/kolom yang ≥90% gelap) ---------- */
const isDark = (i) => Math.max(buf[i], buf[i + 1], buf[i + 2]) < 25
const rowDarkFrac = (y) => {
  let n = 0, t = 0
  for (let x = 0; x < W; x += 5) { t++; if (isDark((y * W + x) * C)) n++ }
  return n / t
}
const colDarkFrac = (x) => {
  let n = 0, t = 0
  for (let y = 0; y < H; y += 5) { t++; if (isDark((y * W + x) * C)) n++ }
  return n / t
}
let top = 0
while (top < H && rowDarkFrac(top) >= 0.9) top++
let bottom = H - 1
while (bottom > 0 && rowDarkFrac(bottom) >= 0.9) bottom--
let left = 0
while (left < W && colDarkFrac(left) >= 0.9) left++
let right = W - 1
while (right > 0 && colDarkFrac(right) >= 0.9) right--
if (top || bottom < H - 1 || left || right < W - 1) {
  console.log(`crop bingkai: top=${top} bottom=${H - 1 - bottom} left=${left} right=${W - 1 - right}`)
}
if (bottom <= top || right <= left) throw new Error('Crop gagal — gambar seluruhnya gelap?')
const cw = right - left + 1
const ch = bottom - top + 1
const cropped = await sharp(INPUT)
  .extract({ left, top, width: cw, height: ch })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })
buf = cropped.data
W = cw
H = ch
C = cropped.info.channels
const N = W * H

/* ---------- 2. Predicate ----------
   Predicate latar = merah KUAT dengan G rendah: gradien vignette merah
   (g<=40) lolos, sedangkan kulit (g>=131), lipstik, seragam abu/navy,
   dan rambut hitam TIDAK lolos — perlindungan ganda bersama flood-fill
   dari tepi (objek interior tak tersentuh walau warnanya mirip merah). */
const strongRed = (i) =>
  buf[i] - buf[i + 1] >= 25 && buf[i] - buf[i + 2] >= 25 && buf[i + 1] <= 60
const weakRed = (i) =>
  buf[i] >= buf[i + 1] && buf[i] >= buf[i + 2] && buf[i] - buf[i + 1] >= 8 && buf[i] - buf[i + 2] >= 8

/* ---------- 3. Flood-fill dari tepi (4-konektivitas) ----------
   Hanya piksel berpredicate yang menyebar — batas warna tajam
   (kulit/rambut/seragam) menghentikan banjir. */
const bg = new Uint8Array(N) // 1 = latar
const queue = new Int32Array(N)
let qh = 0, qt = 0
const push = (p) => { if (!bg[p]) { bg[p] = 1; queue[qt++] = p } }
for (let x = 0; x < W; x++) {
  const a = x, b = (H - 1) * W + x
  if (strongRed(a * C)) push(a)
  if (strongRed(b * C)) push(b)
}
for (let y = 0; y < H; y++) {
  const a = y * W, b = y * W + (W - 1)
  if (strongRed(a * C)) push(a)
  if (strongRed(b * C)) push(b)
}
const seedCount = qt
const near2 = (p, n, tol2) => {
  const i = p * C, j = n * C
  const dr = buf[i] - buf[j], dg = buf[i + 1] - buf[j + 1], db = buf[i + 2] - buf[j + 2]
  return dr * dr + dg * dg + db * db <= tol2
}
while (qh < qt) {
  const p = queue[qh++]
  const x = p % W, y = (p / W) | 0
  if (x > 0 && !bg[p - 1] && strongRed((p - 1) * C)) push(p - 1)
  if (x < W - 1 && !bg[p + 1] && strongRed((p + 1) * C)) push(p + 1)
  if (y > 0 && !bg[p - W] && strongRed((p - W) * C)) push(p - W)
  if (y < H - 1 && !bg[p + W] && strongRed((p + W) * C)) push(p + W)
}
console.log(`seed tepi: ${seedCount} — latar (flood): ${((bg.reduce((s, v) => s + v, 0) / N) * 100).toFixed(1)}%`)

/* ---------- 4. Fringe 1px: piksel di sekitar latar yang lemah merah
   DAN warnanya masih dekat dengan warna latar tetangganya (<=160) ----------
   Membersihkan halo merah/AA tanpa merembet ke objek (kulit jaraknya ~190). */
const add = new Uint8Array(N)
const FR2 = 160 * 160
for (let p = 0; p < N; p++) {
  if (bg[p] || !weakRed(p * C)) continue
  const x = p % W, y = (p / W) | 0
  const nb = []
  if (x > 0) nb.push(p - 1)
  if (x < W - 1) nb.push(p + 1)
  if (y > 0) nb.push(p - W)
  if (y < H - 1) nb.push(p + W)
  for (const q of nb) {
    if (bg[q] && near2(p, q, FR2)) { add[p] = 1; break }
  }
}
let fringe = 0
for (let p = 0; p < N; p++) if (add[p]) { bg[p] = 1; fringe++ }
console.log(`latar + fringe: ${((bg.reduce((s, v) => s + v, 0) / N) * 100).toFixed(1)}% (+${fringe})`)

/* ---------- 5. Spill merah: tepi objek yang berdampingan latar ---------- */
const nearBg = new Uint8Array(N)
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const p = y * W + x
    if (bg[p]) continue
    const n1 = x > 0 && bg[p - 1], n2 = x < W - 1 && bg[p + 1]
    const n3 = y > 0 && bg[p - W], n4 = y < H - 1 && bg[p + W]
    if (n1 || n2 || n3 || n4) nearBg[p] = 1
  }
}
for (let p = 0; p < N; p++) {
  if (!nearBg[p]) continue
  const i = p * C
  const cap = Math.max(buf[i + 1], buf[i + 2]) + 18
  if (buf[i] > cap) buf[i] = cap
}

/* ---------- 6. Alpha: 0 untuk latar, feather 3x3, sisanya 255 ---------- */
const alpha = new Uint8Array(N)
for (let p = 0; p < N; p++) alpha[p] = bg[p] ? 0 : 255
const feather = new Uint8Array(N)
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    let sum = 0, cnt = 0
    for (let dy = -1; dy <= 1; dy++) {
      const yy = y + dy
      if (yy < 0 || yy >= H) continue
      for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx
        if (xx < 0 || xx >= W) continue
        sum += alpha[yy * W + xx]; cnt++
      }
    }
    feather[y * W + x] = Math.round(sum / cnt)
  }
}

/* Susun buffer RGBA keluaran */
const out = Buffer.allocUnsafe(N * 4)
for (let p = 0; p < N; p++) {
  const i = p * C, o = p * 4
  out[o] = buf[i]; out[o + 1] = buf[i + 1]; out[o + 2] = buf[i + 2]
  out[o + 3] = feather[p]
}

/* ---------- 7. Ring: dilate(alpha>=128, r=RING_RADIUS) MINUS alpha ---------- */
const solid = new Uint8Array(N)
for (let p = 0; p < N; p++) solid[p] = feather[p] >= 128 ? 1 : 0
let dil = solid.slice()
for (let r = 1; r <= RING_RADIUS; r++) {
  const next = dil.slice()
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const p = y * W + x
      if (next[p]) continue
      let hit = 0
      for (let dy = -r; dy <= r && !hit; dy++) {
        const yy = y + dy
        if (yy < 0 || yy >= H) continue
        for (let dx = -r; dx <= r; dx++) {
          const xx = x + dx
          if (xx < 0 || xx >= W) continue
          if (dil[yy * W + xx]) { hit = 1; break }
        }
      }
      if (hit) next[p] = 1
    }
  }
  dil = next
}
const ring = Buffer.allocUnsafe(N * 4)
let ringCount = 0
for (let p = 0; p < N; p++) {
  const on = dil[p] && !solid[p]
  if (on) ringCount++
  ring[p * 4] = 255; ring[p * 4 + 1] = 255; ring[p * 4 + 2] = 255
  ring[p * 4 + 3] = on ? 255 : 0
}
/* Feather ring 1px supaya AA halus */
const ringF = Buffer.allocUnsafe(N * 4)
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    let sum = 0, cnt = 0
    for (let dy = -1; dy <= 1; dy++) {
      const yy = y + dy
      if (yy < 0 || yy >= H) continue
      for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx
        if (xx < 0 || xx >= W) continue
        sum += ring[(yy * W + xx) * 4 + 3]; cnt++
      }
    }
    const o = (y * W + x) * 4
    ringF[o] = 255; ringF[o + 1] = 255; ringF[o + 2] = 255
    ringF[o + 3] = Math.round(sum / cnt)
  }
}
console.log(`ring: ${((ringCount / N) * 100).toFixed(2)}% piksel`)

/* ---------- 8. Tulis hasil (TANPA ICC profile — warna pasti sRGB) ---------- */
await sharp(out, { raw: { width: W, height: H, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(`${OUT}.png`)
await sharp(ringF, { raw: { width: W, height: H, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(`${OUT}-ring.png`)

/* ---------- 9. Preview QA: cutout di atas latar gelap + ring putih ---------- */
const dark = await sharp({
  create: { width: W, height: H, channels: 4, background: { r: 5, g: 10, b: 24, alpha: 1 } },
}).png().toBuffer()
const outPng = await sharp(out, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer()
const ringPng = await sharp(ringF, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer()
// Satu panggilan composite dengan array (rantai .composite() dua kali
// membuat lapisan pertama tergantikan oleh sharp).
const composited = await sharp(dark)
  .composite([
    { input: outPng, top: 0, left: 0 },
    { input: ringPng, top: 0, left: 0 },
  ])
  .png()
  .toBuffer()
await sharp(composited).png().toFile('scripts/cutout-preview.png')

/* Statistik kualitas */
let transparent = 0
for (let p = 0; p < N; p++) if (feather[p] === 0) transparent++
console.log(`output: ${OUT}.png + ${OUT}-ring.png (${W}x${H})`)
console.log(`transparan: ${((transparent / N) * 100).toFixed(1)}% — preview: scripts/cutout-preview.png`)
