import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from 'react'
import { Trash2 } from 'lucide-react'
import { COMMANDS, WELCOME_LINES, type HistoryItem } from '../constants/commands'
import './Terminal.css'

/**
 * Terminal — CLI interaktif pengganti CodeWidget statis.
 *
 * - Riwayat perintah disimpan di state (`HistoryItem[]`).
 * - Perintah & teksnya ada di `src/constants/commands.ts`.
 * - Output pendek dianimasikan huruf-per-huruf; output panjang langsung tampil
 *   supaya terminal tidak terasa lambat.
 * - Semua timer dibersihkan saat komponen unmount / perintah baru dijalankan.
 */

/** Jeda antar huruf saat efek typing (ms). */
const TYPE_DELAY = 14
/** Jeda sebelum baris output berikutnya mulai diketik (ms). */
const LINE_PAUSE = 60
/** Output di atas jumlah karakter ini tampil instan (tanpa typing). */
const MAX_TYPED_CHARS = 220
/** Jeda sebelum auto-scroll ke section Contact setelah `sudo hire-me`. */
const CONTACT_REDIRECT_DELAY = 1200

/** Baris sambutan dengan id unik yang selalu baru. */
function welcomeItems(startId: number): HistoryItem[] {
  return WELCOME_LINES.map((text, index) => ({
    id: startId + index,
    type: 'output',
    text,
  }))
}

export default function Terminal() {
  const [history, setHistory] = useState<HistoryItem[]>(() => welcomeItems(0))
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  /** Counter id agar update typing tidak menimpa baris yang salah. */
  const nextIdRef = useRef(WELCOME_LINES.length)

  const shellRef = useRef<HTMLDivElement>(null)
  const screenRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputRowRef = useRef<HTMLFormElement>(null)

  /** Semua timer aktif — dibersihkan saat unmount / reset. */
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const intervalsRef = useRef<ReturnType<typeof setInterval>[]>([])

  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  ).current

  const stopTimers = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout)
    intervalsRef.current.forEach(clearInterval)
    timeoutsRef.current = []
    intervalsRef.current = []
  }, [])

  /** Bersihkan semua timer ketika komponen dilepas (anti memory leak). */
  useEffect(() => stopTimers, [stopTimers])

  /** Auto-scroll ke baris terakhir setiap ada history baru. */
  useEffect(() => {
    const screen = screenRef.current
    if (!screen) return

    screen.scrollTo({
      top: screen.scrollHeight,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }, [history, prefersReducedMotion])

  /** Tambah satu item baru dengan id unik. */
  const createItem = useCallback(
    (type: HistoryItem['type'], text: string): HistoryItem => ({
      id: nextIdRef.current++,
      type,
      text,
    }),
    [],
  )

  const resetToWelcome = useCallback(() => {
    stopTimers()
    setIsTyping(false)
    const items = welcomeItems(nextIdRef.current)
    nextIdRef.current += WELCOME_LINES.length
    setHistory(items)
  }, [stopTimers])

  /** Animasi mengetik per baris. */
  const typeLines = useCallback((lines: string[]) => {
    let lineIndex = 0

    setIsTyping(true)

    const typeNextLine = () => {
      if (lineIndex >= lines.length) {
        setIsTyping(false)
        return
      }

      const line = lines[lineIndex++]
      const item = { id: nextIdRef.current++, type: 'output' as const, text: '' }

      setHistory((prev) => [...prev, item])

      let charIndex = 0
      const interval = setInterval(() => {
        charIndex += 1
        const partial = line.slice(0, charIndex)

        setHistory((prev) =>
          prev.map((entry) =>
            entry.id === item.id ? { ...entry, text: partial } : entry,
          ),
        )

        if (charIndex >= line.length) {
          clearInterval(interval)
          intervalsRef.current = intervalsRef.current.filter((id) => id !== interval)

          if (lineIndex < lines.length) {
            const timeout = setTimeout(typeNextLine, LINE_PAUSE)
            timeoutsRef.current.push(timeout)
          } else {
            setIsTyping(false)
          }
        }
      }, TYPE_DELAY)

      intervalsRef.current.push(interval)
    }

    typeNextLine()
  }, [])

  // Saat user memilih teks (mis. untuk copy email), jangan rebut fokus input.
  const shouldKeepSelection = () => Boolean(window.getSelection()?.toString())

  /** Klik di mana pun pada terminal memfokuskan input. */
  const handleShellClick = (event: MouseEvent<HTMLDivElement>) => {
    if (shouldKeepSelection()) return

    const target = event.target as HTMLElement
    if (target.closest('button, a, input')) return

    inputRef.current?.focus()
  }

  /** Di mobile, dorong input ke area yang tidak tertutup keyboard. */
  const handleInputFocus = () => {
    const timeout = setTimeout(() => {
      inputRowRef.current?.scrollIntoView({ block: 'nearest' })
    }, 280)
    timeoutsRef.current.push(timeout)
  }

  const redirectToContact = useCallback(() => {
    const timeout = setTimeout(() => {
      document.getElementById('Contact')?.scrollIntoView({ behavior: 'smooth' })
    }, CONTACT_REDIRECT_DELAY)
    timeoutsRef.current.push(timeout)
  }, [])

  /** Jalankan perintah dari input. */
  const runCommand = useCallback(
    (raw: string) => {
      const command = raw.trim()
      if (!command) return

      // Hentikan animasi yang masih berjalan sebelum memproses perintah baru.
      stopTimers()
      setIsTyping(false)
      setInput('')

      // `clear` tidak menyisakan baris perintah, hanya layar sambutan.
      if (command.toLowerCase() === 'clear') {
        resetToWelcome()
        return
      }

      setHistory((prev) => [...prev, createItem('input', command)])

      const handler = COMMANDS[command.toLowerCase()]

      if (!handler) {
        setHistory((prev) => [
          ...prev,
          createItem(
            'error',
            `Command not found: ${command}. Type 'help' for options.`,
          ),
        ])
        return
      }

      const lines = handler.run().filter((line) => typeof line === 'string')
      const totalChars = lines.reduce((sum, line) => sum + line.length, 0)

      if (prefersReducedMotion || totalChars > MAX_TYPED_CHARS) {
        // Output panjang / reduced-motion: tampil langsung.
        setHistory((prev) => [
          ...prev,
          ...lines.map((line) => createItem('output', line)),
        ])
        setIsTyping(false)
      } else if (lines.length > 0) {
        typeLines(lines)
      }

      if (command.toLowerCase() === 'sudo hire-me') {
        redirectToContact()
      }
    },
    [createItem, prefersReducedMotion, redirectToContact, resetToWelcome, stopTimers, typeLines],
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    runCommand(input)
  }

  /** Tombol clear: reset layar, fokuskan kembali input. */
  const handleClear = () => {
    resetToWelcome()
    inputRef.current?.focus()
  }

  return (
    <div
      className="terminal"
      ref={shellRef}
      onClick={handleShellClick}
      role="region"
      aria-label="Terminal interaktif Hamdani"
    >
      {/* ============ Header jendela ============ */}
      <div className="terminal__header">
        <span className="terminal__dots" aria-hidden="true">
          <span className="terminal__dot terminal__dot--red" />
          <span className="terminal__dot terminal__dot--yellow" />
          <span className="terminal__dot terminal__dot--green" />
        </span>

        <span className="terminal__title">hamdani-cli</span>

        <button
          type="button"
          className="terminal__clear"
          onClick={handleClear}
          aria-label="Bersihkan terminal"
          title="Bersihkan terminal"
        >
          <Trash2 size={13} aria-hidden="true" />
          <span>clear</span>
        </button>
      </div>

      {/* ============ Layar / riwayat ============ */}
      <div
        className="terminal__screen"
        ref={screenRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {history.map((item) => {
          if (item.type === 'input') {
            return (
              <div className="terminal__line terminal__line--input" key={item.id}>
                <span className="terminal__prompt" aria-hidden="true">
                  <span className="terminal__prompt-arrow">➜</span>{' '}
                  <span className="terminal__prompt-path">~</span>
                </span>{' '}
                <span className="terminal__command">{item.text}</span>
              </div>
            )
          }

          return (
            <div
              className={
                item.type === 'error'
                  ? 'terminal__line terminal__line--error'
                  : 'terminal__line terminal__line--output'
              }
              key={item.id}
            >
              {item.text}
            </div>
          )
        })}
      </div>

      {/* ============ Baris input (selalu di bawah, tidak ikut scroll) ============ */}
      <form
        className="terminal__input-row"
        ref={inputRowRef}
        onSubmit={handleSubmit}
        onClick={() => inputRef.current?.focus()}
      >
        <span className="terminal__prompt" aria-hidden="true">
          <span className="terminal__prompt-arrow">➜</span>{' '}
          <span className="terminal__prompt-path">~</span>
        </span>

        <div className={`terminal__field${isTyping ? ' is-typing' : ''}`}>
          {/* Teks bayangan: input asli transparan, jadi blok kursor bisa
              menempel tepat di ujung teks. */}
          <span className="terminal__ghost" aria-hidden="true">
            {input}
            <span className="terminal__cursor" />
            {!input && <span className="terminal__hint">type &apos;help&apos;</span>}
          </span>

          <input
            ref={inputRef}
            className="terminal__input"
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onFocus={handleInputFocus}
            aria-label="Ketik perintah terminal"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="send"
          />
        </div>
      </form>
    </div>
  )
}
