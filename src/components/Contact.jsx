import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Check, ImagePlus, MessageSquare, Send, User, Mail, FileText } from 'lucide-react'
import { socials } from '../data/portfolio'
import { createComment, fetchComments, MAX_PHOTO_BYTES } from '../lib/comments'
import { isSupabaseConfigured } from '../lib/supabaseClient'
import './Contact.css'

const SUBS = {
  GitHub: '@hamdaniyiy-0',
  Instagram: '@hamdniyiy',
  TikTok: '@hamyeyooo',
}

/** Endpoint Formspree untuk form pesan. */
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xyewkoze'

/** Format waktu komentar relatif (id-ID). */
function timeAgo(value) {
  const ts = new Date(value).getTime()
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
  /* ============ Form pesan (Formspree) ============ */
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
      // Formspree menerima data form-urlencoded dan membalas JSON karena
      // header Accept: application/json.
      const body = new URLSearchParams({
        name,
        email,
        message,
        _subject: 'Pesan Baru dari Website',
      })

      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: body.toString(),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(`Formspree menolak pengiriman (HTTP ${response.status}).`)
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

  /* ============ Komentar (Supabase) ============ */
  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [commentsError, setCommentsError] = useState('')
  const [cForm, setCForm] = useState({ name: '', message: '', photo: null, photoName: '' })
  const [cError, setCErrror] = useState('')
  const [sending, setSending] = useState(false)
  const photoInputRef = useRef(null)

  const loadComments = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setCommentsLoading(false)
      setCommentsError(
        'Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.',
      )
      return
    }

    setCommentsError('')
    try {
      setComments(await fetchComments())
    } catch (error) {
      setCommentsError(error.message || 'Gagal memuat komentar.')
    } finally {
      setCommentsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadComments()
  }, [loadComments])

  const pickPhoto = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setCErrror('File harus berupa gambar.')
      event.target.value = ''
      return
    }

    if (file.size > MAX_PHOTO_BYTES) {
      setCErrror('Ukuran file maksimal 5 MB.')
      event.target.value = ''
      return
    }

    setCForm((f) => ({ ...f, photo: file, photoName: file.name }))
    setCErrror('')
  }

  const submitComment = async (event) => {
    event.preventDefault()
    if (sending) return

    const name = cForm.name.trim()
    const message = cForm.message.trim()

    if (!name || !message) {
      setCErrror('Nama dan komentar wajib diisi.')
      return
    }

    if (!isSupabaseConfigured) {
      setCErrror(
        'Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.',
      )
      return
    }

    setSending(true)
    setCErrror('')

    try {
      await createComment({ name, message, photo: cForm.photo })

      setCForm({ name: '', message: '', photo: null, photoName: '' })
      if (photoInputRef.current) photoInputRef.current.value = ''
      await loadComments()
    } catch (error) {
      setCErrror(error.message || 'Komentar gagal dikirim. Periksa koneksi lalu coba lagi.')
    } finally {
      setSending(false)
    }
  }

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

            <form
              className="contact-actual-form"
              name="contact"
              method="post"
              onSubmit={submitMessage}
            >
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

          {/* ============ Panel kanan: komentar (Supabase) ============ */}
          <div className="contact-comments-panel reveal" style={{ '--reveal-delay': '0.1s' }}>
            <div className="contact-comments-header">
              <span className="contact-comments-icon" aria-hidden="true">
                <MessageSquare size={19} />
              </span>
              <h2>
                Komentar <span>({comments.length.toLocaleString('id-ID')})</span>
              </h2>
            </div>

            <form className="contact-comment-form" onSubmit={submitComment}>
              <div className="contact-form-field">
                <label htmlFor="comment-name">Nama</label>
                <input
                  id="comment-name"
                  name="name"
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
                  name="message"
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
                  name="photo"
                  type="file"
                  accept="image/*"
                  onChange={pickPhoto}
                  ref={photoInputRef}
                />
                <span className="contact-photo-hint">Ukuran file maksimal 5 MB</span>
              </div>

              {cError && (
                <p className="contact-comment-error" role="alert">
                  {cError}
                </p>
              )}

              <button type="submit" className="contact-submit-btn" disabled={sending}>
                <Send size={15} aria-hidden="true" />
                <span>{sending ? 'Mengirim...' : 'Kirim Komentar'}</span>
              </button>
            </form>

            <div className="contact-comments-list">
              {commentsLoading ? (
                <p className="contact-comments-empty">Memuat komentar...</p>
              ) : commentsError ? (
                <p className="contact-comment-error" role="alert">
                  {commentsError}
                </p>
              ) : comments.length === 0 ? (
                <p className="contact-comments-empty">Belum ada komentar. Jadilah yang pertama!</p>
              ) : (
                comments.map((c) => (
                  <article className="contact-comment-item" key={c.id}>
                    {c.photo_url ? (
                      <img className="contact-comment-avatar" src={c.photo_url} alt="" loading="lazy" />
                    ) : (
                      <span className="contact-comment-avatar contact-comment-avatar-fallback" aria-hidden="true">
                        {c.name.slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <div className="contact-comment-content">
                      <div className="contact-comment-meta">
                        <strong>{c.name}</strong>
                        <time dateTime={new Date(c.created_at).toISOString()}>
                          {timeAgo(c.created_at)}
                        </time>
                      </div>
                      <p>{c.message}</p>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
