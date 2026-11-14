import { useEffect } from 'react'

/**
 * Reveal saat elemen masuk viewport — meniru animasi scroll referensi
 * (GSAP) memakai IntersectionObserver + kelas `.reveal.is-visible`
 * (lihat index.css). Pasang kelas `reveal` pada elemen target.
 *
 * `key` boleh berubah (mis. tab berganti) agar konten baru ikut diawasi.
 */
export default function useReveal({ root, threshold, rootMargin, key } = {}) {
  useEffect(() => {
    const scope = root ?? document
    const nodes = scope.querySelectorAll('.reveal:not(.is-visible)')
    if (!nodes.length) return undefined

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      nodes.forEach((n) => n.classList.add('is-visible'))
      return undefined
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: threshold ?? 0.12, rootMargin: rootMargin ?? '0px 0px -6% 0px' },
    )

    nodes.forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [root, threshold, rootMargin, key])
}
