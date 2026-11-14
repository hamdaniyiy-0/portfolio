import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Check, ImagePlus, MessageSquare, Send, User, Mail, FileText } from 'lucide-react'
import { socials } from '../data/portfolio'
import {
  addComment,
  commentCount,
  fetchComments,
  getMaxPhotoBytes,
  loadComments,
} from '../lib/comments'
import './Contact.css'

const PAGE_SIZE = 5

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

/** Ubah data URL (hasil FileReader) menjadi File agar bisa dikirim lewat FormData. */
async function dataUrlToFile(dataUrl, fileName) {
  const blob = await (await fetch(dataUrl)).blob()
  return new File([blob], fileName || 'foto-profil', { type: blob.type || 'image/jpeg' })
}

/** Endpoint "palsu" berisi skeleton form statis — wajib untuk Netlify Forms di SPA. */
const NETLIFY_FORMS_ENDPOINT = '/__forms.html'

export default function Contact() {
  /* ============ Form pesan (Netlify Forms) ============ */
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
      // Netlify Forms membaca data dari endpoint statis ini (public/__forms.html).
      const body = new URLSearchParams({
        'form-name': 'contact',
        name,
        email,
        message,
      })

      const response = await fetch(NETLIFY_FORMS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
        signal: controller.signal,
      })

      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? 'Form belum terdeteksi Netlify (HTTP 404). Aktifkan Forms → Form detection, lalu deploy ulang.'
            : `Server menolak pengiriman (HTTP ${response.status}).`,
        )
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

  /* ============ Komentar (Netlify Forms via Function + fallback localStorage) ============ */
  const [comments, setComments] = useState(() => loadComments())
  const [count, setCount] = useState(() => commentCount())
  const [cForm, setCForm] = useState({ name: '', message: '', photo: null, photoName: '' })
  const [cError, setCErrror] = useState('')
  const [sending, setSending] = useState(false)
  const [visible, setVisible] = useState(PAGE_SIZE)

  // Komentar yang baru dikirim dari perangkat ini tapi belum muncul di API
  // (jeda propagasi Netlify Forms). Disimpan sebentar agar tidak "hilang"
  // saat daftar server menggantikan daftar lokal.
  const pendingRef = useRef([])
  const syncTimers = useRef([])

  /**
   * Ambil komentar dari Netlify Function.
   * Saat berhasil, daftar SERVER menjadi sumber kebenaran + komentar yang
   * baru saja dikirim dari perangkat ini (maks. 2 menit).
   * Saat function gagal (null), daftar lokal dibiarkan sebagai fallback.
   */
  const refreshComments = async () => {
    const remote = await fetchComments()
    if (!remote) return

    const now = Date.now()
    const isSame = (a, b) => a.name === b.name && a.message === b.message

    pendingRef.current = pendingRef.current.filter(
      (pending) => pending.expiresAt > now && !remote.some((item) => isSame(item, pending)),
    )

    const merged = [...pendingRef.current, ...remote].sort((a, b) => b.createdAt - a.createdAt)
    setComments(merged)
  }

  // Muat komentar saat halaman dibuka.
  useEffect(() => {
    refreshComments()
  }, [])

  // Auto-refresh tiap 15 detik + saat tab kembali aktif/fokus, supaya
  // komentar dari HP/pengunjung lain muncul di laptop tanpa reload.
  useEffect(() => {
    const POLL_MS = 15000
    const tick = () => {
      if (!document.hidden) refreshComments()
    }
    const id = setInterval(tick, POLL_MS)
    document.addEventListener('visibilitychange', tick)
    window.addEventListener('focus', tick)

    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', tick)
      window.removeEventListener('focus', tick)
    }
  }, [])

  // Bersihkan timer refresh tertunda saat komponen di-unmount.
  useEffect(
    () => () => {
      syncTimers.current.forEach((timer) => clearTimeout(timer))
      syncTimers.current = []
    },
    [],
  )

  // Jaga angka di judul "Komentar (n)" tetap sinkron dengan daftar.
  useEffect(() => {
    setCount(comments.length)
  }, [comments])

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

  const submitComment = async (event) => {
    event.preventDefault()
    if (sending) return
    setSending(true)
    setCErrror('')

    try {
      // Foto Profil bersifat opsional → hanya dilampirkan jika ada.
      const data = new FormData()
      data.append('form-name', 'comment')
      data.append('name', cForm.name)
      data.append('message', cForm.message)
      if (cForm.photo) {
        data.append('photo', await dataUrlToFile(cForm.photo, cForm.photoName))
      }

      const response = await fetch(NETLIFY_FORMS_ENDPOINT, {
        method: 'POST',
        body: data, // Content-Type multipart/form-data di-set otomatis oleh browser
      })

      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? 'Form komentar belum terdeteksi Netlify (HTTP 404). Deploy ulang setelah Form detection aktif.'
            : `Server menolak pengiriman (HTTP ${response.status}).`,
        )
      }

      // Tetap simpan komentar di localStorage agar langsung tampil di halaman ini.
      const result = addComment({
        name: cForm.name,
        message: cForm.message,
        photo: cForm.photo,
      })

      if (!result.ok) {
        setCErrror(result.error)
        return
      }

      const submittedAt = Date.now()
      const pendingComment = {
        id: `pending-${submittedAt}`,
        name: cForm.name.trim().slice(0, 50),
        message: cForm.message.trim().slice(0, 500),
        photo: cForm.photo,
        createdAt: submittedAt,
        expiresAt: submittedAt + 2 * 60 * 1000,
      }
      // Tandai sebagai "menunggu API" agar tetap tampil sampai Netlify Forms
      // selesai memprosesnya, tanpa membuat perangkat lain ikut menampilkannya.
      pendingRef.current = [
        pendingComment,
        ...pendingRef.current.filter(
          (item) => !(item.name === pendingComment.name && item.message === pendingComment.message),
        ),
      ]

      setComments(result.comments)
      setCount(commentCount())
      setCForm({ name: '', message: '', photo: null, photoName: '' })
      setVisible(PAGE_SIZE)

      // Ambil ulang dari Netlify Forms agar komentar baru (dan komentar orang
      // lain) langsung tampil tanpa reload halaman. Ulangi beberapa detik
      // kemudian untuk mengantisipasi jeda propagasi API Netlify.
      refreshComments()
      syncTimers.current.push(
        setTimeout(refreshComments, 3000),
        setTimeout(refreshComments, 10000),
      )
    } catch (error) {
      setCErrror(error.message || 'Komentar gagal dikirim. Periksa koneksi lalu coba lagi.')
    } finally {
      setSending(false)
    }
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

            <form
              className="contact-actual-form"
              name="contact"
              method="post"
              data-netlify="true"
              netlify-honeypot="bot-field"
              onSubmit={submitMessage}
            >
              <input type="hidden" name="form-name" value="contact" />
              <p hidden>
                <label>
                  Jangan diisi: <input name="bot-field" />
                </label>
              </p>

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

            <form
              className="contact-comment-form"
              name="comment"
              method="post"
              encType="multipart/form-data"
              data-netlify="true"
              netlify-honeypot="bot-field"
              onSubmit={submitComment}
            >
              <input type="hidden" name="form-name" value="comment" />
              <p hidden>
                <label>
                  Jangan diisi: <input name="bot-field" />
                </label>
              </p>

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
