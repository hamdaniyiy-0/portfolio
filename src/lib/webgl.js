/**
 * Deteksi dukungan WebGL sebelum memuat komponen 3D.
 * Jika tidak tersedia (perangkat lama / GPU diblokir), website menampilkan
 * fallback kartu statis alih-alih error di console.
 */
export function supportsWebGL() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    return Boolean(gl)
  } catch {
    return false
  }
}
