/**
 * Komentar tersimpan LOCALLY di browser (localStorage) agar langsung tampil.
 * Salinan setiap komentar juga dikirim ke Netlify Forms (form "comment")
 * lewat fetch ke /__forms.html — lihat Contact.jsx.
 */

const KEY = 'portfolio-comments'
const COOLDOWN_KEY = 'portfolio-comment-cooldown'
const COOLDOWN_MS = 60 * 60 * 1000 // 1 jam (sama dengan referensi)
const MAX_PHOTO_BYTES = 5 * 1024 * 1024 // 5 MB

function read() {
  try {
    const raw = localStorage.getItem(KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function write(list) {
  localStorage.setItem(KEY, JSON.stringify(list)) // bisa melempar QuotaExceededError
}

export function loadComments() {
  return read().sort((a, b) => b.createdAt - a.createdAt)
}

export function commentCount() {
  return read().length
}

export function getMaxPhotoBytes() {
  return MAX_PHOTO_BYTES
}

/**
 * Tambah komentar baru.
 * @returns {{ok: true, comments: array} | {ok: false, error: string}}
 */
export function addComment({ name, message, photo = null }) {
  const trimmedName = String(name || '').trim()
  const trimmedMessage = String(message || '').trim()
  if (!trimmedName || !trimmedMessage) {
    return { ok: false, error: 'Nama dan komentar wajib diisi.' }
  }
  if (photo && photo.length > MAX_PHOTO_BYTES * 1.35) {
    // perkiraan kasar dari dataURL; pemeriksaan presisi ada di pemilih file
    return { ok: false, error: 'Ukuran file maksimal 5 MB.' }
  }

  const list = read()
  list.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: trimmedName.slice(0, 50),
    message: trimmedMessage.slice(0, 500),
    photo,
    createdAt: Date.now(),
  })

  try {
    write(list)
  } catch {
    return {
      ok: false,
      error: 'Gagal menyimpan komentar — penyimpanan browser penuh. Coba tanpa foto.',
    }
  }

  return { ok: true, comments: loadComments() }
}

/* ============ Cooldown anti-spam 1 jam ============ */
export function getCooldownRemaining() {
  try {
    const until = Number(localStorage.getItem(COOLDOWN_KEY) || 0)
    return Math.max(0, until - Date.now())
  } catch {
    return 0
  }
}

export function startCooldown() {
  try {
    localStorage.setItem(COOLDOWN_KEY, String(Date.now() + COOLDOWN_MS))
  } catch {
    /* abaikan bila localStorage diblokir */
  }
}

/** Sisa waktu -> teks "59 menit 12 detik" / "1 jam 5 menit". */
export function formatRemaining(ms) {
  const total = Math.ceil(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h} jam ${m} menit`
  if (m > 0) return `${m} menit ${s} detik`
  return `${s} detik`
}
