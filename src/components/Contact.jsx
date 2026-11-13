import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpRight, Check, ImagePlus, MessageSquare, Send, User, Mail, FileText } from 'lucide-react'
import { socials } from '../data/portfolio'
import {
  addComment,
  commentCount,
  formatRemaining,
  getCooldownRemaining,
  getMaxPhotoBytes,
  loadComments,
  startCooldown,
} from '../lib/comments'
import './Contact.css'

const PAGE_SIZE = 5
const COOLDOWN_TOTAL = 60 * 60 * 1000

const SUBS = {
  GitHub: '@hamdaniyiy-0',
  Instagram: '@hamdniyiy',
  TikTok: '@hamyeyooo',
}

/** Format waktu komentar relatif (id-ID). */
function timeAgo(ts) {
  const diff = Date.now() - ts
  const menit = Math.floor(diff / 60000)
  if (menit < 1) return 'baru saja'
  if (menit < 60) return `${menit} menit lalu`
  const jam = Math.floor(menit / 60)
  if (jam < 24) return `${jam} jam lalu`
  const hari = Math.floor(jam / 24)
  if (hari < 7) return `${hari} hari lalu`
  return new Date(ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Contact() {
  /* ============ Form pesan (API + Nodemailer) ============ */
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const toastTimer = useRef(null)

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const submitMessage = async (event) => {
    event.preventDefault()
    if (sendingMessage) return

    const name = form.name.trim()
    const email = form.email.trim()
    const message = form.message.trim()

    if (!name || !email || !message) {
      alert('Semua field wajib diisi.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      alert('Format email tidak valid.')
      return
    }

    setSendingMessage(true)
    setSent(false)
    clearTimeout(toastTimer.current)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 20000)

    try {
      const response = await fetch(import.meta.env.VITE_API_URL || '/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
        signal: controller.signal,
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || 'Pesan gagal dikirim.')
      }

      setForm({ name: '', email: '', message: '' })
      setSent(true)
      toastTimer.current = setTimeout(() => setSent(false), 6000)
    } catch (error) {
      const detail =
        error.name === 'AbortError'
          ? 'Waktu pengiriman habis. Periksa koneksi lalu coba lagi.'
          : error.message || 'Pesan gagal dikirim. Coba lagi nanti.'
      alert(`Pesan gagal dikirim.\n\n${detail}`)
    } finally {
      clearTimeout(timeoutId)
      setSendingMessage(false)
    }
  }

  /* ============ Komentar (localStorage) ============ */
  const [comments, setComments] = useState(() => loadComments())
  const [count, setCount] = useState(() => commentCount())
  const [cForm, setCForm] = useState({ name: '', message: '', photo: null, photoName: '' })
  const [cError, setCErrror] = useState('')
  const [sending, setSending] = useState(false)
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [remaining, setRemaining] = useState(() => getCooldownRemaining())

  useEffect(() => {
    if (remaining <= 0) return undefined
    const id = setInterval(() => {
      const next = getCooldownRemaining()
      setRemaining(next)
      if (next <= 0) setComments(loadComments())
    }, 1000)
    return () => clearInterval(id)
  }, [remaining > 0])

  const cooldownLabel = useMemo(() => {
    if (remaining <= 0) return 'Kirim Komentar'
    if (remaining >= COOLDOWN_TOTAL) return 'Kirim lagi dalam 1 jam'
    return `Kirim lagi ${formatRemaining(remaining)}`
  }, [remaining])

  const pickPhoto = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > getMaxPhotoBytes()) {
      setCErrror('Ukuran file maksimal 5 MB.')
      event.target.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setCForm((f) => ({ ...f, photo: reader.result, photoName: file.name }))
      setCErrror('')
    }
    reader.readAsDataURL(file)
  }

  const submitComment = (event) => {
    event.preventDefault()
    if (getCooldownRemaining() > 0) return
    setSending(true)
    setCErrror('')

    // Penulisan ke localStorage bersifat sinkron — tunda sebentar agar
    // status "Mengirim..." terlihat seperti referensi.
    setTimeout(() => {
      const result = addComment({
        name: cForm.name,
        message: cForm.message,
        photo: cForm.photo,
      })
      setSending(false)
      if (!result.ok) {
        setCErrror(result.error)
        return
      }
      setComments(result.comments)
      setCount(commentCount())
      startCooldown()
      setRemaining(getCooldownRemaining())
      setCForm({ name: '', message: '', photo: null, photoName: '' })
      setVisible(PAGE_SIZE)
    }, 350)
  }

  const shown = comments.slice(0, visible)

  return (
    <section className="contact-root-section" id="Contact" aria-labelledby="contact-section-heading">
      <div className="contact-container-inner">
        <h2 className="section-display-title reveal" id="contact-section-heading">
          Hubungi saya
        </h2>

        <div className="contact-main-grid contact-layout">
          {/* ============ Panel kiri: pesan ============ */}
          <div className="contact-panel contact-message-panel reveal">
            <h2 className="contact-section-title">Hubungi</h2>
            <p className="contact-panel-intro">
              Ada yang mau didiskusikan? Langsung kirim pesan aja ya...
            </p>

            <form className="contact-actual-form" onSubmit={submitMessage}>
              <div className="contact-form-field">
                <label htmlFor="user-name">Nama</label>
                <div className="contact-input-wrap">
                  <User size={17} aria-hidden="true" />
                  <input
                    id="user-name"
                    name="name"
                    type="text"
                    required
                    maxLength={100}
                    placeholder="Nama Anda"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="contact-form-field">
                <label htmlFor="user-email">Email</label>
                <div className="contact-input-wrap">
                  <Mail size={17} aria-hidden="true" />
                  <input
                    id="user-email"
                    name="email"
                    type="email"
                    required
                    maxLength={320}
                    placeholder="Email Anda"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="contact-form-field">
                <label htmlFor="user-msg">Pesan</label>
                <div className="contact-input-wrap contact-textarea-wrap">
                  <FileText size={17} aria-hidden="true" />
                  <textarea
                    id="user-msg"
                    name="message"
                    rows={4}
                    required
                    maxLength={5000}
                    placeholder="Pesan Anda"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="contact-submit-btn"
                disabled={sendingMessage}
                aria-busy={sendingMessage}
              >
                <Send size={16} aria-hidden="true" />
                <span>{sendingMessage ? 'Mengirim...' : 'Kirim Pesan'}</span>
              </button>

              {sent && (
                <div className="contact-success-toast" role="status">
                  <Check size={18} aria-hidden="true" />
                  <span>Pesan berhasil terkirim!</span>
                </div>
              )}
            </form>

            <div className="contact-find-me">
              <h3>FIND ME</h3>
              <div className="contact-social-grid">
                {socials.map((s) => {
                  const Icon = s.icon
                  const key = s.name.toLowerCase()
                  return (
                    <a
                      key={s.name}
                      href={s.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`contact-social-card contact-social-card--${key}`}
                    >
                      <span className="contact-social-icon-box" aria-hidden="true">
                        <Icon className={`contact-social-logo contact-social-logo--${key}`} />
                      </span>
                      <span className="contact-social-text">
                        <span className="contact-social-label">{s.name}</span>
                        <span className="contact-social-sub">{SUBS[s.name] ?? s.link}</span>
                      </span>
                      <ArrowUpRight size={16} className="contact-social-arrow" aria-hidden="true" />
                    </a>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ============ Panel kanan: komentar ============ */}
          <div className="contact-comments-panel reveal" style={{ '--reveal-delay': '0.1s' }}>
            <div className="contact-comments-header">
              <span className="contact-comments-icon" aria-hidden="true">
                <MessageSquare size={19} />
              </span>
              <h2>
                Komentar <span>({count.toLocaleString('id-ID')})</span>
              </h2>
            </div>

            <form className="contact-comment-form" onSubmit={submitComment}>
              <div className="contact-form-field">
                <label htmlFor="comment-name">Nama</label>
                <input
                  id="comment-name"
                  type="text"
                  required
                  maxLength={50}
                  placeholder="Masukkan nama kamu"
                  value={cForm.name}
                  onChange={(e) => setCForm({ ...cForm, name: e.target.value })}
                />
              </div>

              <div className="contact-form-field">
                <label htmlFor="comment-message">Komentar</label>
                <textarea
                  id="comment-message"
                  required
                  maxLength={500}
                  rows={4}
                  placeholder="Tulis komentar kamu di sini..."
                  value={cForm.message}
                  onChange={(e) => setCForm({ ...cForm, message: e.target.value })}
                />
              </div>

              <div className="contact-form-field">
                <label htmlFor="comment-photo">Foto Profil (opsional)</label>
                <label className="contact-photo-picker" htmlFor="comment-photo">
                  <ImagePlus size={17} aria-hidden="true" />
                  <span>{cForm.photoName || 'Pilih Foto Profil'}</span>
                </label>
                <input
                  className="contact-photo-input"
                  id="comment-photo"
                  type="file"
                  accept="image/*"
                  onChange={pickPhoto}
                />
                <span className="contact-photo-hint">Ukuran file maksimal 5 MB</span>
              </div>

              {cError && (
                <p className="contact-comment-error" role="alert">
                  {cError}
                </p>
              )}

              <button type="submit" className="contact-submit-btn" disabled={sending || remaining > 0}>
                <Send size={15} aria-hidden="true" />
                <span>{sending ? 'Mengirim...' : cooldownLabel}</span>
              </button>

              {remaining > 0 && (
                <div
                  className="contact-comment-cooldown"
                  role="progressbar"
                  aria-label={`Waktu tunggu komentar: ${formatRemaining(remaining)} tersisa`}
                  aria-valuemin={0}
                  aria-valuemax={COOLDOWN_TOTAL}
                  aria-valuenow={remaining}
                >
                  <span
                    className="contact-comment-cooldown-progress"
                    style={{ width: `${(remaining / COOLDOWN_TOTAL) * 100}%` }}
                  />
                </div>
              )}
              {remaining > 0 && (
                <span className="contact-comment-cooldown-label">
                  Bisa komentar lagi dalam {formatRemaining(remaining)}
                </span>
              )}
            </form>

            <div className="contact-comments-list">
              {shown.length === 0 ? (
                <p className="contact-comments-empty">Belum ada komentar. Jadilah yang pertama!</p>
              ) : (
                shown.map((c) => (
                  <article className="contact-comment-item" key={c.id}>
                    {c.photo ? (
                      <img className="contact-comment-avatar" src={c.photo} alt="" loading="lazy" />
                    ) : (
                      <span className="contact-comment-avatar contact-comment-avatar-fallback" aria-hidden="true">
                        {c.name.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <div className="contact-comment-content">
                      <div className="contact-comment-meta">
                        <strong>{c.name}</strong>
                        <time dateTime={new Date(c.createdAt).toISOString()}>{timeAgo(c.createdAt)}</time>
                      </div>
                      <p>{c.message}</p>
                    </div>
                  </article>
                ))
              )}
            </div>

            {comments.length > visible && (
              <button type="button" className="contact-comments-more" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                <span>Lihat komentar lainnya</span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
