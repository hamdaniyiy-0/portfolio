import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Check, MessageSquare, Send, User, Mail, FileText } from 'lucide-react'
import { socials } from '../data/portfolio'
import GiscusComments from './GiscusComments'
import './Contact.css'

const SUBS = {
  GitHub: '@hamdaniyiy-0',
  Instagram: '@hamdniyiy',
  TikTok: '@hamyeyooo',
}

/** Endpoint Formspree untuk form pesan. */
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xyewkoze'

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

          {/* ============ Panel kanan: komentar (Giscus) ============ */}
          <div className="contact-comments-panel reveal" style={{ '--reveal-delay': '0.1s' }}>
            <div className="contact-comments-header">
              <span className="contact-comments-icon" aria-hidden="true">
                <MessageSquare size={19} />
              </span>
              <h2>Komentar</h2>
            </div>

            <GiscusComments />
          </div>
        </div>
      </div>
    </section>
  )
}
