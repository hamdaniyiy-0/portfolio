/**
 * Efek suara UI (tanpa file audio) — dibangkitkan langsung lewat Web Audio API.
 * Dipakai untuk klik tombol/link di SELURUH halaman (dipasang sekali secara
 * global di App.jsx), tanpa menambah asset eksternal.
 */
let ctx = null

/* Preferensi suara SFX (toggle di navbar, tersimpan di localStorage) */
const SOUND_KEY = 'portfolio-sound'
let enabled = true
try {
  enabled = localStorage.getItem(SOUND_KEY) !== 'off'
} catch {
  enabled = true
}

export function isSoundEnabled() {
  return enabled
}

export function setSoundEnabled(on) {
  enabled = Boolean(on)
  try {
    localStorage.setItem(SOUND_KEY, enabled ? 'on' : 'off')
  } catch {
    /* localStorage diblokir — preferensi hanya berlaku selama sesi */
  }
}

const getCtx = () => {
  if (ctx && ctx.state !== 'closed') return ctx
  const Ctx = window.AudioContext || window.webkitAudioContext
  if (!Ctx) return null
  try {
    ctx = new Ctx()
  } catch {
    return null
  }
  return ctx
}

/** Klik pendek & lembut — panggil dari handler klik pengguna (gesture). */
export function playClick() {
  if (!enabled) return
  const ac = getCtx()
  if (!ac) return
  // AudioContext dibuat saat pertama klik (gesture) — resume bila tertunda
  if (ac.state === 'suspended') ac.resume().catch(() => {})

  try {
    const t = ac.currentTime

    // Nada dasar cepat turun -> kesan "klik" padat tapi tetap lembut
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(760, t)
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.09)
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.18, t + 0.006)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14)
    osc.connect(gain).connect(ac.destination)
    osc.start(t)
    osc.stop(t + 0.16)

    // Transien atas agar terdengar seperti klik nyata
    const tick = ac.createOscillator()
    const tickGain = ac.createGain()
    tick.type = 'triangle'
    tick.frequency.setValueAtTime(1800, t)
    tickGain.gain.setValueAtTime(0.0001, t)
    tickGain.gain.exponentialRampToValueAtTime(0.07, t + 0.004)
    tickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
    tick.connect(tickGain).connect(ac.destination)
    tick.start(t)
    tick.stop(t + 0.06)
  } catch {
    /* suara gagal dibangkitkan — bukan masalah fatal */
  }
}
