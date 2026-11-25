import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import './FolderModal.css'

/**
 * Modal "isi folder" — dipakai bersama oleh folder Projects, Certificates,
 * dan Awards.
 *
 * Props:
 * - `isOpen`  : boolean, mengontrol tampil/animasi keluar modal.
 * - `onClose` : dipanggil saat tombol X, overlay, atau Escape ditekan.
 * - `data`    : array item `{ title, image, meta? }`.
 * - `title`   : judul header, mis. "All Projects (6)".
 */
export default function FolderModal({ isOpen, onClose, data = [], title = 'Folder' }) {
  const titleId = useId()
  const closeRef = useRef(null)

  /* Escape, kunci scroll halaman, fokus awal ke tombol tutup, dan
     mengembalikan fokus ke elemen pemicu setelah modal ditutup. */
  useEffect(() => {
    if (!isOpen) return undefined

    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab') return

      /* Fokus tetap di dalam modal (focus trap sederhana). */
      const panel = document.getElementById(titleId)
      if (!panel) return
      const focusables = panel.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusables.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      if (previousFocus instanceof HTMLElement) previousFocus.focus()
    }
  }, [isOpen, onClose, titleId])

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="folder-dialog"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={onClose}
        >
          <motion.div
            id={titleId}
            className="folder-dialog__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${titleId}-title`}
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30, mass: 0.9 }}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="folder-dialog__header">
              <div className="folder-dialog__heading">
                <span className="folder-dialog__eyebrow">File Manager</span>
                <h2 id={`${titleId}-title`}>{title}</h2>
              </div>
              <button
                type="button"
                className="folder-dialog__close"
                onClick={onClose}
                aria-label="Tutup folder"
                ref={closeRef}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </header>

            <div className="folder-dialog__body">
              {data.length === 0 ? (
                <p className="folder-dialog__empty">Folder ini masih kosong.</p>
              ) : (
                <ul className="folder-dialog__grid">
                  {data.map((item, index) => (
                    <li className="folder-dialog__item" key={`${item.title}-${index}`}>
                      <div className="folder-dialog__thumb">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <span aria-hidden="true" />
                        )}
                      </div>
                      <div className="folder-dialog__caption">
                        <strong>{item.title}</strong>
                        {item.meta && <span>{item.meta}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
