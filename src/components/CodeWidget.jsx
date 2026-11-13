import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Check, Copy, Terminal } from 'lucide-react'
import './CodeWidget.css'

/**
 * CodeWidget — panel editor kode bergaya VS Code (tema gelap futuristik).
 * Menggantikan player Spotify di sisi kanan section Spotify.
 *
 * - Warna syntax di-hardcode lewat class CSS (tanpa library highlighting).
 * - Animasi mengetik baris-per-baris dimulai saat masuk viewport
 *   (IntersectionObserver), lalu kursor berkedip di akhir kode.
 * - Tombol salin menyalin kode polos ke clipboard.
 * - `prefers-reduced-motion`: kode langsung tampil utuh, tanpa animasi.
 */

/** Token: { k: kelas warna, v: teks } */
const tk = (k, v) => ({ k, v })

/* ============ Sumber kode (ide: "membuat sesuatu dari benih") ============ */
const CODE = [
  [tk('kw', 'import'), tk('pn', ' { '), tk('fn', 'ignite'), tk('pn', ' } '), tk('kw', 'from'), tk('pn', ' '), tk('str', "'./universe'")],
  [],
  [tk('kw', 'export'), tk('pn', ' '), tk('kw', 'function'), tk('pn', ' '), tk('fn', 'createIdea'), tk('pn', '('), tk('vr', 'seed'), tk('pn', ': '), tk('kw', 'string'), tk('pn', ') {')],
  [tk('kw', 'const'), tk('pn', ' '), tk('vr', 'spark'), tk('pn', ' = '), tk('fn', 'ignite'), tk('pn', '('), tk('vr', 'seed'), tk('pn', ')')],
  [tk('kw', 'if'), tk('pn', ' (!'), tk('vr', 'spark'), tk('pn', ') '), tk('kw', 'return'), tk('pn', ' '), tk('kw', 'null')],
  [],
  [tk('kw', 'return'), tk('pn', ' {')],
  [tk('pn', '  '), tk('vr', 'title'), tk('pn', ': '), tk('str', '`idea: ${'), tk('vr', 'spark'), tk('str', '}`,'),],
  [tk('pn', '  '), tk('vr', 'stars'), tk('pn', ': '), tk('vr', 'spark'), tk('pn', '.'), tk('vr', 'length'), tk('pn', ' * '), tk('num', '42'), tk('pn', ',')],
  [tk('pn', '  }')],
  [tk('pn', '}')],
]

/** Potong token sehingga hanya `n` karakter pertama yang tampil. */
function sliceTokens(tokens, n) {
  const out = []
  let used = 0
  for (const token of tokens) {
    if (used >= n) break
    const rest = n - used
    out.push(rest >= token.v.length ? token : { ...token, v: token.v.slice(0, rest) })
    used += token.v.length
  }
  return out
}

/** Kode polos untuk clipboard. */
const PLAIN_CODE = CODE.map((line) => line.map((t) => t.v).join('')).join('\n')

const TYPE_MS = 16 // kecepatan mengetik (ms per karakter)
const LINE_PAUSE_MS = 140 // jeda antar baris

export default function CodeWidget() {
  const rootRef = useRef(null)
  const posRef = useRef({ line: 0, char: 0 })
  const copyTimer = useRef(null)
  const [started, setStarted] = useState(false)
  const [pos, setPos] = useState({ line: 0, char: 0 }) // posisi kursor mengetik
  const [done, setDone] = useState(false)
  const [copied, setCopied] = useState(false)

  const reduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  /* Mulai animasi saat widget masuk viewport (sekali saja). */
  useEffect(() => {
    if (reduced) {
      setDone(true)
      return undefined
    }
    const el = rootRef.current
    if (!el) return undefined
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setStarted(true)
          io.disconnect()
        }
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  /* Mesin mengetik: maju per karakter, baris demi baris. */
  useEffect(() => {
    if (!started || done) return undefined
    let cancelled = false
    let timer

    const step = () => {
      if (cancelled) return
      const p = posRef.current
      const line = CODE[p.line] ?? []
      let next
      let delay
      if (p.char < line.length) {
        next = { line: p.line, char: p.char + 1 }
        delay = TYPE_MS
      } else if (p.line < CODE.length - 1) {
        next = { line: p.line + 1, char: 0 }
        delay = LINE_PAUSE_MS
      } else {
        setDone(true)
        return
      }
      posRef.current = next
      setPos(next)
      timer = setTimeout(step, delay)
    }

    timer = setTimeout(step, 350)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [started, done])

  useEffect(() => () => clearTimeout(copyTimer.current), [])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(PLAIN_CODE)
      setCopied(true)
      clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard diblokir browser — diamkan, jangan tampilkan toast palsu */
    }
  }, [])

  const cursorLine = done ? CODE.length - 1 : pos.line

  return (
    <div className="code-widget" ref={rootRef}>
      {/* ============ Header jendela ============ */}
      <div className="code-widget__header">
        <span className="code-widget__dots" aria-hidden="true">
          <i className="code-widget__dot code-widget__dot--red" />
          <i className="code-widget__dot code-widget__dot--yellow" />
          <i className="code-widget__dot code-widget__dot--green" />
        </span>
        <span className="code-widget__file">idea.ts</span>
        <button type="button" className="code-widget__copy" onClick={handleCopy} aria-label="Salin kode">
          {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
          <span>{copied ? 'Tersalin' : 'Salin'}</span>
        </button>
      </div>

      {/* ============ Badan kode ============ */}
      <pre className="code-widget__body" aria-label="Cuplikan kode TypeScript">
        <code>
          {CODE.map((line, i) => {
            // Baris mendatang tetap dirender (opacity 0) agar tinggi stabil.
            const pending = !done && i > pos.line
            const tokens =
              !line.length || done || i < pos.line ? line : i === pos.line ? sliceTokens(line, pos.char) : line
            const showCursor = i === cursorLine
            return (
              <span className={`code-widget__line${pending ? ' is-pending' : ''}`} key={i}>
                {tokens.map((t, j) => (
                  <span className={`tok tok--${t.k}`} key={j}>
                    {t.v}
                  </span>
                ))}
                {showCursor && <span className="code-widget__cursor" aria-hidden="true" />}
                {'\n'}
              </span>
            )
          })}
        </code>
      </pre>

      {/* ============ Watermark ikon terminal ============ */}
      <Terminal className="code-widget__watermark" aria-hidden="true" />
    </div>
  )
}
