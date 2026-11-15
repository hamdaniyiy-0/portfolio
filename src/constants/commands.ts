/**
 * Daftar perintah untuk Interactive Terminal.
 * Edit teks/output di sini tanpa menyentuh komponen Terminal.
 */

export type HistoryType = 'input' | 'output' | 'error' | 'clear'

export interface HistoryItem {
  id: number
  type: HistoryType
  text: string
}

export interface Command {
  /** Keterangan singkat, dipakai oleh perintah `help`. */
  description: string
  /** Mengembalikan satu atau beberapa baris output. */
  run: () => string[]
}

const CONTACT = {
  email: 'hamdanif042@gmail.com',
  github: 'https://github.com/hamdaniyiy-0',
  linkedin: 'https://www.linkedin.com/in/hamdani-firmansyah-07019b44b/',
}

export const WELCOME_LINES = [
  "Welcome to Hamdani's Terminal v1.0.0",
  "Type 'help' to start.",
]

/** Dibuat sebagai fungsi agar `help` selalu mengikuti daftar terbaru. */
function buildHelp(): string[] {
  return [
    'Available commands:',
    ...Object.entries(COMMANDS).map(
      ([name, command]) => `  ${name.padEnd(14)} ${command.description}`,
    ),
  ]
}

export const COMMANDS: Record<string, Command> = {
  help: {
    description: 'Tampilkan daftar perintah',
    run: buildHelp,
  },
  about: {
    description: 'Tentang saya',
    run: () => [
      'Halo! Saya Hamdani Firmansyah, Web Developer.',
      'Saya suka membangun antarmuka interaktif dengan React,',
      'animasi yang halus, dan sentuhan 3D di browser.',
    ],
  },
  skills: {
    description: 'Tech stack yang saya pakai',
    run: () => [
      'Tech stack:',
      '  • JavaScript / TypeScript',
      '  • React / Next.js',
      '  • Tailwind CSS',
      '  • Node.js',
    ],
  },
  projects: {
    description: 'Proyek pilihan',
    run: () => [
      'Projects:',
      '  • Lanyard 3D Portfolio — kartu 3D interaktif berbasis React',
      '  • Orbit Dashboard — dashboard analitik modern',
      '  • Musa Commerce — platform e-commerce',
    ],
  },
  contact: {
    description: 'Email & sosial media',
    run: () => [
      'Contact:',
      `  Email    : ${CONTACT.email}`,
      `  GitHub   : ${CONTACT.github}`,
      `  LinkedIn : ${CONTACT.linkedin}`,
    ],
  },
  clear: {
    description: 'Bersihkan layar terminal',
    // Ditangani khusus oleh komponen Terminal (reset history).
    run: () => [],
  },
  'sudo hire-me': {
    description: 'Rekrut saya (easter egg)',
    run: () => ['Access Granted! Redirecting to contact...'],
  },
}
