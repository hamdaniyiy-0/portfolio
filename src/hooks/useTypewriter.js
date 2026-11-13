import { useEffect, useState } from 'react'

/**
 * Efek mengetik (typewriter) untuk sub-judul hero — meniru kecepatan
 * referensi: 45ms saat mengetik, 90ms saat menghapus, jeda 2 detik.
 */
export default function useTypewriter(words, { typeSpeed = 45, deleteSpeed = 90, pause = 2000 } = {}) {
  const [text, setText] = useState('')
  const [index, setIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!words?.length) return undefined
    const word = words[index % words.length]
    let timeout

    if (!deleting && text === word) {
      timeout = setTimeout(() => setDeleting(true), pause)
    } else if (deleting && text === '') {
      setDeleting(false)
      setIndex((i) => i + 1)
    } else {
      timeout = setTimeout(
        () => setText(word.slice(0, text.length + (deleting ? -1 : 1))),
        deleting ? deleteSpeed : typeSpeed,
      )
    }
    return () => clearTimeout(timeout)
  }, [text, deleting, index, words, typeSpeed, deleteSpeed, pause])

  return text
}
