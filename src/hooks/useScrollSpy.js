import { useEffect, useState } from 'react'

/**
 * Scrollspy seperti referensi: elemen dengan `id` di daftar `ids`
 * dianggap aktif bila top-nya sudah melewati 38% tinggi viewport.
 * Dipakai Navbar untuk menampilkan pill aktif.
 */
export default function useScrollSpy(ids, enabled = true) {
  const [active, setActive] = useState(ids[0])

  useEffect(() => {
    if (!enabled) return undefined

    const onScroll = () => {
      const line = window.innerHeight * 0.38
      let current = ids[0]
      ids.forEach((id) => {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= line) current = id
      })
      setActive(current)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ids, enabled])

  return active
}
