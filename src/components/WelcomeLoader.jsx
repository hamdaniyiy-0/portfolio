import { useEffect, useRef, useState } from 'react'
import './WelcomeLoader.css'

/**
 * Layar pemuatan ala referensi: angka persen besar (tanda % biru),
 * track 2px dengan bar biru, teks "Memuat assets...".
 * Progres dihitung dari preload aset NYATA (gambar lanyard & foto);
 * bila ada yang gagal, muncul opsi "Coba lagi" / "Lanjutkan".
 * Saat selesai, layar meluncur ke atas (translateY(-100%)).
 */

const ASSETS = ['/card-front.png', '/card-back.png', '/band.png', '/foto-asli.png']

function preload(urls) {
  return Promise.all(
    urls.map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image()
          img.onload = () => resolve({ src, ok: true })
          img.onerror = () => resolve({ src, ok: false })
          img.src = src
        }),
    ),
  )
}

export default function WelcomeLoader({ onDone }) {
  const [progress, setProgress] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const [failures, setFailures] = useState([])
  const [attempt, setAttempt] = useState(0)
  const finishedRef = useRef(false)

  /* Kunci scroll selama loader tampil */
  useEffect(() => {
    document.documentElement.classList.add('is-loading')
    return () => document.documentElement.classList.remove('is-loading')
  }, [])

  useEffect(() => {
    let cancelled = false
    let shown = 0 // progres yang sudah tampil (naik halus)
    let target = 0
    let raf = 0

    const tick = () => {
      if (cancelled) return
      shown += (target - shown) * 0.12
      if (target >= 100 && shown > 99.4) shown = 100
      setProgress(Math.round(shown))
      if (shown < 100) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    ;(async () => {
      const started = Date.now()
      target = 8
      const results = await preload(ASSETS)
      if (cancelled) return
      const bad = results.filter((r) => !r.ok).map((r) => r.src)
      target = 92
      // minimal tampil supaya tidak kedip
      const elapsed = Date.now() - started
      if (elapsed < 650) await new Promise((r) => setTimeout(r, 650 - elapsed))
      if (cancelled) return
      setFailures(bad)
      target = 100
      setTimeout(
        () => {
          if (cancelled || finishedRef.current) return
          finishedRef.current = true
          setLeaving(true)
          setTimeout(onDone, 700) // durasi exit slide-up
        },
        bad.length ? 400 : 260,
      )
    })()

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
    }
  }, [attempt, onDone])

  const retry = () => {
    finishedRef.current = false
    setProgress(0)
    setFailures([])
    setAttempt((a) => a + 1)
  }

  const skip = () => {
    if (finishedRef.current) return
    finishedRef.current = true
    setLeaving(true)
    setTimeout(onDone, 700)
  }

  return (
    <div className={`welcome-screen-root${leaving ? ' is-leaving' : ''}`} role="status" aria-live="polite">
      <div className="welcome-loader">
        <span className="welcome-loader-number" aria-label={`Memuat aset portfolio ${progress}%`}>
          {progress}
          <span>%</span>
        </span>
        <div className="welcome-progress-track" aria-hidden="true">
          <span style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
        <span className="welcome-loader-count">Memuat assets...</span>
        {failures.length > 0 && (
          <div className="welcome-loader-error" role="alert">
            <span>{failures.length} aset gagal dimuat.</span>
            <div>
              <button type="button" onClick={retry}>
                Coba lagi
              </button>
              <button type="button" onClick={skip}>
                Lanjutkan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
