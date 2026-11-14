import { createClient } from '@supabase/supabase-js'

/**
 * Konfigurasi Supabase dibaca dari environment Vite.
 * Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env lokal
 * dan di Environment Variables Vercel.
 *
 * Nilai dibersihkan dari spasi/quote yang tidak sengaja ikut ter-paste.
 */
function readEnv(name) {
  const raw = import.meta.env[name]
  if (typeof raw !== 'string') return ''
  return raw.trim().replace(/^['"]|['"]$/g, '')
}

const supabaseUrl = readEnv('VITE_SUPABASE_URL')
const supabaseAnonKey = readEnv('VITE_SUPABASE_ANON_KEY')

/** URL harus benar-benar http(s), bukan sekadar string tidak kosong. */
function isValidHttpUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const urlValid = isValidHttpUrl(supabaseUrl)

let client = null

if (!supabaseUrl || !supabaseAnonKey || !urlValid) {
  // Jangan biarkan createClient melempar error saat modul di-import —
  // error seperti itu membuat seluruh aplikasi React blank putih.
  console.error('VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY tidak ditemukan!', {
    urlTerbaca: supabaseUrl || '(kosong)',
    keyTerbaca: supabaseAnonKey ? '(ada)' : '(kosong)',
    urlValid,
    contohBenar: 'https://syherqcsflinjvgleip.supabase.co',
  })
} else {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.error('Gagal membuat Supabase client:', error)
  }
}

export const isSupabaseConfigured = Boolean(client)
export const supabase = client
