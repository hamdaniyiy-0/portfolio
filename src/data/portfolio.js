import {
  Router,
  Server,
  Monitor,
  ShieldCheck,
  Trophy,
  FolderGit2,
  Mail,
  MapPin,
  Clock,
  Building2,
  Network,
} from 'lucide-react'
import GithubIcon from '../components/icons/GithubIcon'
import InstagramIcon from '../components/icons/InstagramIcon'
import TikTokIcon from '../components/icons/TikTokIcon'

/* ==========================================================
   SEMUA DATA PORTFOLIO ADA DI FILE INI.
   Ganti isi placeholder di bawah dengan data milikmu sendiri.
   ========================================================== */

/* ============ NAVIGASI ============ */
// Bentuk identik dengan referensi: `section` (bila berbeda dari `name`)
// dipakai scrollspy Navbar untuk ID section di halaman.
export const navLinks = [
  { name: 'Home', href: '#Home' },
  { name: 'About', href: '#About' },
  { name: 'Portfolio', section: 'Portofolio', href: '#Portofolio' },
  { name: 'Contact', href: '#Contact' },
]

/* ============ PROFIL ============ */
export const profile = {
  name: 'HAMDANI FIRMANSYAH',
  initials: 'HF', // dipakai untuk monogram footer & kartu Lanyard
  shortName: 'Hamdani',
  role: 'React & Three.js Enthusiast',
  tagline: 'Junior Developer',
  // Judul hero DUA BARIS: baris pertama tampil dengan gradien biru,
  // baris kedua dengan warna putih (lihat Hero.jsx).
  welcome: ['Welcome to', 'My Portfolio'],
  // Subjudul hero (efek mengetik) — profesi yang ditampilkan bergantian.
  roles: ['React & Three.js Enthusiast', 'Junior Developer', 'UI Creative Coder'],
  bio: 'Saya seorang junior developer yang bangun antarmuka interaktif dengan React, animasi halus, dan dunia 3D di browser. Belajar cepat, rapi dalam detail, dan selalu penasaran.',
  location: 'Indonesia',
  email: 'hamdani.firmansyah@example.com', // ganti dengan email aslimu
  school: 'SMK Negeri 1',
  /* Foto profil di section About (About.jsx).
     - `real`  : cutout hasil `node scripts/cutout-photo.mjs` — latar merah
                 sudah DIHAPUS (PNG transparan), jadi objek manusianya saja.
     - `ring`  : tersimpan sebagai referensi aset lama (tidak dipakai). */
  photos: {
    real: '/foto-asli.png',
    ring: '/foto-asli-ring.png',
    spiderman: '/foto-spiderman.jpg',
  },
}

/* ============ PROYEK ============
   `preview` (opsional): URL gambar/GIF/video pratinjau di halaman detail.
   Biarkan '' untuk memakai placeholder jendela + ikon (bukan screenshot
   palsu). `gradient` = latar thumbnail kartu, `category` = label kategori
   yang tampil di placeholder. */
export const projects = [
  {
    title: 'Konfigurasi Router',
    description:
      'Mengatur DHCP Server, NAT, dan sistem login Hotspot dengan manajemen bandwidth untuk jaringan lokal sekolah.',
    tech: ['MikroTik', 'Winbox', 'DHCP Server', 'NAT', 'Hotspot'],
    link: '',
    live: '',
    preview: '',
    image: '/images/projects/router.png',
    gradient: 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 48%, #22d3ee 100%)',
    category: 'NETWORKING',
    icon: Router,
  },
  {
    title: 'Deployment Server Lokal (Debian Linux)',
    description:
      'Membangun Web Server (Nginx) dan DNS Server pada lingkungan Virtual Machine Debian untuk kebutuhan simulasi jaringan.',
    tech: ['Debian', 'Nginx', 'BIND9', 'VirtualBox', 'Linux'],
    link: '',
    live: '',
    preview: '',
    image: '/images/projects/linux.png',
    gradient: 'linear-gradient(135deg, #312e81 0%, #4f46e5 48%, #a78bfa 100%)',
    category: 'LINUX SERVER',
    icon: Server,
  },
  {
    title: 'Perakitan PC',
    description:
      'Merakit komputer dari komponen dasar, melakukan instalasi sistem operasi, serta troubleshooting perangkat keras.',
    tech: ['Hardware', 'Instalasi OS', 'Troubleshooting'],
    link: '',
    live: '',
    preview: '',
    image: '/images/projects/hardware.png',
    gradient: 'linear-gradient(135deg, #134e4a 0%, #0f766e 48%, #2dd4bf 100%)',
    category: 'HARDWARE',
    icon: Monitor,
  },
]

/* ============ TECH STACK (tab "Tech Stack" di section Portfolio) ============
   `logo` harus cocok dengan kunci di src/components/Logos.jsx. */
export const techStack = [
  { name: 'React', logo: 'react' },
  { name: 'Three.js', logo: 'three' },
  { name: 'Tailwind CSS', logo: 'tailwind' },
  { name: 'JavaScript', logo: 'js' },
  { name: 'HTML5', logo: 'html5' },
  { name: 'CSS3', logo: 'css3' },
  { name: 'Node.js', logo: 'node' },
  { name: 'Express.js', logo: 'express' },
  { name: 'REST API', logo: 'api' },
  { name: 'Figma', logo: 'figma' },
  { name: 'Git', logo: 'git' },
  { name: 'GitHub', logo: 'github' },
  { name: 'VS Code', logo: 'vscode' },
  { name: 'Vite', logo: 'vite' },
]

/* ============ SERTIFIKAT ============
   Gambar disimpan di public/images/ dan diakses lewat path absolut. */
export const certificates = [
  {
    title: 'Olimpiade Jaringan Mikrotik 2026',
    issuer: 'Mikrotik & Citraweb Solusi Teknologi',
    date: '03 September 2026',
    image: '/images/mikrotik.png',
    description: 'Peserta dalam Olimpiade Jaringan Mikrotik Antar SMK Tingkat Nasional.',
  },
  {
    title: 'Gemini Certified Student (K12)',
    issuer: 'Google for Education',
    date: '27 Agustus 2026',
    image: '/images/gemini.png',
    description:
      'Sertifikasi kemampuan dasar penggunaan Google AI (Gemini) dalam bidang pendidikan.',
  },
]

/* ============ PENGHARGAAN / AWARDS ============
   Ditampilkan di folder "Awards" pada section About.
   Gambar memakai file yang tersedia di public/images/. */
export const awards = [
  {
    title: '2026 National MikroTik Networking Olympiad',
    issuer: 'MikroTik & Citraweb',
    description:
      'Participated in the 2026 National MikroTik Networking Olympiad for vocational high schools (SMK), demonstrating an interest in computer networking and MikroTik technologies.',
    image: '/images/mikrotik.png',
  },
  {
    title: 'Gemini Certified Student (K12)',
    issuer: 'Google for Education',
    description:
      'Earned a student certification demonstrating knowledge, skills, and basic competencies in using Google AI in education.',
    image: '/images/gemini.png',
  },
]

/* ============ RIWAYAT PENDIDIKAN (jenjang sekolah) ============
   Ditampilkan di section Education (Experience.jsx), tepat di bawah About.
   Urutan = kronologis (SD lebih dulu, lalu SMP, lalu SMK).
   - `level`  -> subtitle bila tidak ada `major`
   - `major`  -> jurusan (menggantikan `level` sebagai subtitle)
   - `tag`    -> pil kecil di bawah jurusan (opsional)
   - `logo`   -> file di folder `public/`, ditulis sebagai path absolut
                 (contoh: `/images/logo-alhadiid.png`).
   - `logoBadge` -> beri latar putih bulat + padding pada logo (opsional).
                 Bila gambar gagal dimuat, ikon kelulusan dipakai otomatis. */
export const education = [
  {
    school: 'SDN PASIRANGIN 03',
    level: 'Sekolah Dasar',
    years: '2015 – 2021',
    logo: '/logo-sd.png',
    logoBadge: true,
  },
  {
    school: 'SMP AL-HADIID CILEUNGSI',
    level: 'Sekolah Menengah Pertama',
    years: '2022 – 2025',
    logo: '/images/logo-alhadiid.png',
  },
  {
    school: 'SMK AL-HADIID 1 CILEUNGSI',
    level: 'Sekolah Menengah Kejuruan',
    major: 'Teknik Komputer dan Jaringan',
    tag: 'Sekolah Menengah Kejuruan - TKJ',
    years: '2025 – 2027',
    logo: '/logo-sekolah.png',
  },
]

/* ============ PENGALAMAN / RIWAYAT KERJA ============
   Tampil di kolom kanan section Education (Experience.jsx).
   Bentuk data (urutkan dari yang terbaru):
   - `title`  -> judul peran/kegiatan (baris utama kartu)
   - `company`-> instansi/organisasi (subtitle)
   - `type`   -> pil kecil di bawah subtitle
   - `years`  -> badge tahun di kanan atas kartu
   - `icon`   -> ikon Lucide khusus item (opsional; fallback ikon gedung)
   - `logo`   -> opsional, file di folder `public/`
   - `logoBadge` -> opsional, latar putih bulat untuk logo persegi */
export const experience = [
  {
    title: 'Praktik Kerja Lapangan (PKL)',
    company: 'PT. Corinthian Industries Indonesia',
    type: 'Internship',
    years: '2025',
    icon: Building2,
  },
  {
    title: 'Olimpiade Jaringan Mikrotik',
    company: 'SMK AL-HADIID 1 CILEUNGSI',
    type: 'Competition',
    years: '2026',
    icon: Trophy,
  },
  {
    title: 'Pelatihan MTCNA (MikroTik Certified Network Associate)',
    company: 'MikroTik',
    type: 'Training',
    years: '2026',
    icon: Network,
  },
]

/* ============ STATISTIK ============
   `detail` = kalimat kecil di bawah label (meniru referensi). */
export const stats = [
  { label: 'Projects', value: 3, icon: FolderGit2, detail: 'Karya yang dibuat' },
  { label: 'Certificates', value: 2, icon: ShieldCheck, detail: 'Skill yang divalidasi' },
  { label: 'Awards', value: 2, icon: Trophy, detail: 'Pencapaian diraih' },
]

/* ============ SOSIAL MEDIA ============ */
// Isi `link` dengan URL profilmu sendiri.
export const socials = [
  { name: 'GitHub', link: 'https://github.com/hamdaniyiy-0', icon: GithubIcon },
  { name: 'Instagram', link: 'https://www.instagram.com/hamdniyiy', icon: InstagramIcon },
  { name: 'TikTok', link: 'https://www.tiktok.com/@hamyeyooo', icon: TikTokIcon },
]

/* ============ KONTAK ============ */
export const contactInfo = [
  { label: 'Email', value: 'hamdani.firmansyah@example.com', icon: Mail, href: 'mailto:hamdani.firmansyah@example.com' },
  { label: 'Lokasi', value: 'Indonesia (WIB)', icon: MapPin, href: null },
  { label: 'Status', value: 'Open for project', icon: Clock, href: null },
]

/* ============ LANYARD (kartu ID 3D) ============
   `config` mengikuti properti resmi komponen React Bits Lanyard.
   `card` berisi teks yang digambar ke wajah kartu (depan & belakang). */
export const lanyard = {
  config: {
    /* ==== GAMBAR HASIL EDIT MILIK ANDA (folder public/) ====
       Dipakai langsung oleh komponen Lanyard: depan, belakang, dan tali.
       Jangan diganti dengan gambar lain. */
    frontImage: '/card-front.png',
    backImage: '/card-back.png',
    strapImage: '/band.png',
    cardColor: '#070b18',
    orientation: 'portrait',
    finish: 'glossy',
    cornerRadius: 0.3,
    // 0.5 = kartu memakan ~50% tinggi bingkai. Saat diseret, kartu mengikuti
    // kursor dengan BEBAS ke segala arah tanpa batasan (kedalaman dikunci di
    // bidang datar agar tidak menjorok ke kamera).
    size: 0.5,
    anchor: 'center',
    strapLength: 0.45,
    strapColor: '#0d1430',
    strapWidth: 0.6,
    metal: 'silver',
    gravity: 1,
    damping: 0.5,
    elasticity: 0.5,
    breeze: 0.45, // angin pelan agar tali selalu bergerak halus
    interactive: true, // seret, lempar, dan klik untuk membalik kartu
    intro: true, // animasi kartu jatuh saat pertama muncul
  },
  card: {
    eyebrow: 'PORTFOLIO ID',
    pill: 'Available',
    stack: 'React · Three.js · Tailwind',
    id: 'HF-2026-001',
    footer: 'ISSUED 2026',
    backTitle: 'GET IN TOUCH',
    backFooter: 'REACT · THREE.JS · TAILWIND',
  },
}

/* ============ PLAYLIST SPOTIFY ============ */
// Ganti ID playlist milikmu sendiri di sini
export const spotifyPlaylistId = '37i9dQZF1DX4sWSpwq3LiO'
