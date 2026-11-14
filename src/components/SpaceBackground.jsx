import { useEffect, useRef } from 'react'
import './SpaceBackground.css'

/**
 * Latar ambient halaman utama — meniru struktur referensi:
 * 1. `.gsap-ambient`  : 3 orb blur besar (animasi CSS pengganti GSAP).
 * 2. `.particles-container.particles-background` : kanvas partikel titik.
 * 3. `.meteor-background` : 15 meteor jatuh menyilang (rotate 45deg).
 * Semua fixed, pointer-events none, di belakang konten (z 1–2).
 */

/* PRNG deterministik agar susunan meteor/partikel stabil tiap load */
function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const METEORS = (() => {
  const rnd = mulberry32(20260101)
  return Array.from({ length: 15 }, () => ({
    top: `${Math.round(rnd() * 90)}%`,
    left: `${Math.round(rnd() * 90)}%`,
    duration: `${(6 + rnd() * 9).toFixed(2)}s`,
    delay: `${(-rnd() * 14).toFixed(2)}s`,
  }))
})()

function Particles() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let raf = 0
    let dots = []
    let w = 0
    let h = 0
    let last = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const seed = mulberry32(4471)

    /* Sebaran bintang: sebagian berkedip, besar = lebih dekat (lebih cepat). */
    const build = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.min(180, Math.max(70, Math.round((w * h) / 14000)))
      dots = Array.from({ length: count }, () => {
        const r = 0.45 + seed() * 1.95
        const depth = (r - 0.45) / 1.95 // 0..1 → parallax kedalaman
        return {
          x: seed() * w,
          y: seed() * h,
          r,
          // vy negatif = mengalir ke ATAS; ±0.15–0.85 px per frame 60fps
          // (≈2.5× lebih cepat dari versi sebelumnya)
          vy: -(0.15 + depth * 0.55 + seed() * 0.15),
          vx: (seed() - 0.5) * 0.05, // geser horizontal sangat halus
          base: 0.22 + seed() * 0.6,
          twinkle: seed() > 0.45, // hanya sebagian bintang berkedip
          twinkleAmp: 0.18 + seed() * 0.32,
          phase: seed() * Math.PI * 2,
          speed: 0.5 + seed() * 1.1,
        }
      })
    }

    const paint = (t, animate) => {
      // Delta-time agar kecepatan konsisten di 60Hz/120Hz/tab yang melambat
      const dt = animate && last ? Math.min(3, (t - last) / 16.6667) : animate ? 1 : 0
      last = t
      ctx.clearRect(0, 0, w, h)

      for (const d of dots) {
        if (animate) {
          d.x += d.vx * dt
          d.y += d.vy * dt
          // Loop seamless: keluar dari atas → muncul kembali dari bawah
          if (d.y < -6) {
            d.y = h + 6
            d.x = Math.random() * w // sebar ulang X agar tidak berpola
          }
          if (d.x < -6) d.x = w + 6
          if (d.x > w + 6) d.x = -6
        }

        const tw = d.twinkle
          ? 1 - d.twinkleAmp + d.twinkleAmp * (0.5 + 0.5 * Math.sin((t / 1000) * d.speed + d.phase))
          : 1
        ctx.beginPath()
        ctx.fillStyle = `rgba(255, 255, 255, ${(d.base * tw).toFixed(3)})`
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const draw = (t) => {
      paint(t, true)
      raf = requestAnimationFrame(draw)
    }

    const onResize = () => {
      build()
      if (reduced) paint(0, false)
    }

    build()

    if (reduced) {
      // Hormati pengguna: tampilkan bintang statis, tanpa animasi.
      paint(0, false)
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    }

    raf = requestAnimationFrame(draw)
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div className="particles-container particles-background" aria-hidden="true">
      <canvas ref={canvasRef} className="particles-canvas" />
    </div>
  )
}

export default function SpaceBackground() {
  return (
    <>
      <div className="gsap-ambient" aria-hidden="true">
        <span className="gsap-ambient-orb gsap-ambient-orb-one" />
        <span className="gsap-ambient-orb gsap-ambient-orb-two" />
        <span className="gsap-ambient-orb gsap-ambient-orb-three" />
      </div>

      <Particles />

      <div className="meteor-background" aria-hidden="true">
        {METEORS.map((m, i) => (
          <span
            key={i}
            className="meteor"
            style={{
              '--meteor-top': m.top,
              '--meteor-left': m.left,
              '--meteor-duration': m.duration,
              '--meteor-delay': m.delay,
            }}
          />
        ))}
      </div>
    </>
  )
}
