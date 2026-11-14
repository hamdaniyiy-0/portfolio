import { createClient } from '@supabase/supabase-js'

/**
 * Konfigurasi Supabase dibaca dari environment Vite.
 * Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env lokal
 * dan di Environment Variables Vercel.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

/**
 * Client hanya dibuat jika env tersedia, supaya aplikasi tidak crash
 * saat konfigurasi belum diisi (mis. build lokal tanpa .env).
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
