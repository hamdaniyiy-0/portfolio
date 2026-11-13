import { useEffect, useState } from 'react'

/**
 * Router minimal (History API) — meniru perilaku referensi:
 * - pushState ke `/project/<judul>` saat tombol Details ditekan
 * - popstate (tombol Back browser) kembali ke halaman utama
 * Path lain selain `/project/...` dianggap halaman utama.
 */

const readPath = () => window.location.pathname

export function getProjectSlug() {
  const path = readPath()
  const m = path.match(/^\/project\/(.+)$/)
  return m ? decodeURIComponent(m[1]) : null
}

export function navigate(to, { replace = false } = {}) {
  if (replace) window.history.replaceState({}, '', to)
  else window.history.pushState({}, '', to)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0, behavior: 'auto' })
}

export default function useRoute() {
  const [path, setPath] = useState(readPath)

  useEffect(() => {
    const onChange = () => setPath(readPath())
    window.addEventListener('popstate', onChange)
    return () => window.removeEventListener('popstate', onChange)
  }, [])

  const projectSlug = (() => {
    const m = path.match(/^\/project\/(.+)$/)
    return m ? decodeURIComponent(m[1]) : null
  })()

  return { path, projectSlug }
}
