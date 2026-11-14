import { supabase } from './supabaseClient'

const TABLE = 'comments'
const BUCKET = 'comment-photos'

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024 // 5 MB

function ensureClient() {
  if (!supabase) {
    throw new Error(
      'Layanan komentar belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY.',
    )
  }
}

/** Nama file unik & aman untuk Supabase Storage. */
function makePhotoPath(file) {
  const safeName = String(file.name || 'foto')
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/-+/g, '-')
    .slice(-60)
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return `${unique}-${safeName}`
}

/**
 * Ambil komentar terbaru dari tabel `comments`.
 * @returns {Promise<Array<{id:number,name:string,message:string,photo_url:string|null,created_at:string}>>}
 */
export async function fetchComments() {
  ensureClient()

  const { data, error } = await supabase
    .from(TABLE)
    .select('id, name, message, photo_url, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    throw new Error(`Gagal memuat komentar: ${error.message}`)
  }

  return data ?? []
}

/**
 * Simpan komentar baru. Foto (opsional) diunggah lebih dulu ke bucket
 * `comment-photos`, lalu URL publiknya disimpan di kolom `photo_url`.
 */
export async function createComment({ name, message, photo = null }) {
  ensureClient()

  const trimmedName = String(name || '').trim()
  const trimmedMessage = String(message || '').trim()

  if (!trimmedName || !trimmedMessage) {
    throw new Error('Nama dan komentar wajib diisi.')
  }
  if (trimmedName.length > 50) {
    throw new Error('Nama maksimal 50 karakter.')
  }
  if (trimmedMessage.length > 500) {
    throw new Error('Komentar maksimal 500 karakter.')
  }
  if (photo && photo.size > MAX_PHOTO_BYTES) {
    throw new Error('Ukuran file maksimal 5 MB.')
  }

  let photoUrl = null

  if (photo) {
    const filePath = makePhotoPath(photo)

    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filePath, photo, {
      cacheControl: '3600',
      contentType: photo.type || 'image/jpeg',
      upsert: false,
    })

    if (uploadError) {
      throw new Error(`Gagal mengunggah foto: ${uploadError.message}`)
    }

    photoUrl = supabase.storage.from(BUCKET).getPublicUrl(filePath).data.publicUrl
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      name: trimmedName.slice(0, 50),
      message: trimmedMessage.slice(0, 500),
      photo_url: photoUrl,
    })
    .select('id, name, message, photo_url, created_at')
    .single()

  if (error) {
    throw new Error(`Gagal menyimpan komentar: ${error.message}`)
  }

  return data
}
