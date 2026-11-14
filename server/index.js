import 'dotenv/config'
import express from 'express'
import nodemailer from 'nodemailer'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const PORT = Number(process.env.PORT || 8787)

/* ============ Konfigurasi SMTP (dari .env) ============ */
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com'
const SMTP_PORT = Number(process.env.SMTP_PORT || 465)
const SMTP_SECURE = String(process.env.SMTP_SECURE ?? 'true').toLowerCase() !== 'false'
const SMTP_USER = process.env.SMTP_USER || ''
const SMTP_PASS = process.env.SMTP_PASS || ''
const EMAIL_TO = process.env.EMAIL_TO || SMTP_USER

const emailConfigured = Boolean(SMTP_USER && SMTP_PASS && EMAIL_TO)

/* ============ Middleware ============ */
app.disable('x-powered-by')
app.set('trust proxy', 1)
app.use(express.json({ limit: '32kb' }))

/* ============ Transporter (dibuat sekali, dipakai ulang) ============ */
let transporter = null

function getTransporter() {
  if (!emailConfigured) return null
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    })
  }
  return transporter
}

/* ============ Helper validasi ============ */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function cleanText(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function safeHeader(value) {
  return value.replace(/[\r\n]+/g, ' ').replace(/["<>]/g, '')
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/* ============ Rate limit sederhana (in-memory) ============ */
const RATE_WINDOW_MS = 10 * 60 * 1000
const RATE_MAX = 5
const attempts = new Map()

function rateLimit(req, res, next) {
  const key = req.ip || req.socket.remoteAddress || 'unknown'
  const now = Date.now()
  const recent = (attempts.get(key) || []).filter((time) => now - time < RATE_WINDOW_MS)

  if (recent.length >= RATE_MAX) {
    return res.status(429).json({
      error: 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.',
    })
  }

  recent.push(now)
  attempts.set(key, recent)
  return next()
}

/* ============ API: kirim pesan kontak ============ */
app.post('/api/contact', rateLimit, async (req, res) => {
  const name = cleanText(req.body?.name, 100)
  const email = cleanText(req.body?.email, 320)
  const message = cleanText(req.body?.message, 5000)

  if (name.length < 2) {
    return res.status(400).json({ error: 'Nama wajib diisi (minimal 2 karakter).' })
  }

  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Format email tidak valid.' })
  }

  if (message.length < 5) {
    return res.status(400).json({ error: 'Pesan wajib diisi (minimal 5 karakter).' })
  }

  if (!emailConfigured) {
    console.error('[contact] SMTP belum dikonfigurasi. Isi .env (SMTP_USER, SMTP_PASS, EMAIL_TO).')
    return res.status(500).json({
      error: 'Server email belum dikonfigurasi. Hubungi pemilik website.',
    })
  }

  const safeName = safeHeader(name)
  const safeEmail = safeHeader(email)

  try {
    await getTransporter().sendMail({
      from: `"Portfolio Contact" <${SMTP_USER}>`,
      to: EMAIL_TO,
      replyTo: `"${safeName}" <${safeEmail}>`,
      subject: `Pesan portfolio dari ${safeName}`,
      text: [
        `Nama: ${name}`,
        `Email: ${email}`,
        '',
        'Pesan:',
        message,
      ].join('\n'),
      html: `
        <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#0f172a">
          <h2 style="margin:0 0 16px;color:#2563eb">Pesan baru dari website</h2>
          <p style="margin:0 0 8px"><strong>Nama:</strong> ${escapeHtml(name)}</p>
          <p style="margin:0 0 16px">
            <strong>Email:</strong>
            <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>
          </p>
          <div style="padding:16px;border-left:3px solid #3b82f6;background:#f1f5f9;border-radius:8px">
            ${escapeHtml(message).replace(/\n/g, '<br />')}
          </div>
        </div>
      `,
    })

    return res.json({ ok: true })
  } catch (error) {
    console.error('[contact] Gagal mengirim email:', error.message)
    return res.status(502).json({
      error: 'Pesan gagal dikirim. Coba lagi nanti.',
    })
  }
})

/* ============ Produksi: sajikan hasil build Vite ============ */
const distDir = path.resolve(__dirname, '..', 'dist')

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir))
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return next()
    return res.sendFile(path.join(distDir, 'index.html'))
  })
}

/* ============ Error handler (JSON) ============ */
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error)

  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Body request tidak valid (JSON).' })
  }

  if (error?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Data yang dikirim terlalu besar.' })
  }

  console.error('[server] Error:', error?.message || error)
  return res.status(500).json({ error: 'Terjadi kesalahan pada server.' })
})

app.listen(PORT, () => {
  console.log(`[server] API berjalan di http://localhost:${PORT}`)
  if (!emailConfigured) {
    console.warn(
      '[server] PERINGATAN: .env belum lengkap. Isi SMTP_USER, SMTP_PASS, dan EMAIL_TO agar email bisa dikirim.',
    )
  }
})
