import {
  CodeXml,
  Layers,
  Terminal,
  ShieldCheck,
  Trophy,
  FolderGit2,
  Mail,
  MapPin,
  Clock,
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
    title: 'Nusa Commerce',
    description:
      'Toko online headless dengan katalog realtime, keranjang persisten, dan checkout multistep. Fokus pada performa serta Lighthouse score 95+.',
    tech: ['React', 'Vite', 'Tailwind CSS', 'FakeStore API'],
    link: '',
    live: '',
    preview: '',
    gradient: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 45%, #22d3ee 100%)',
    category: 'E-Commerce',
    icon: Layers,
  },
  {
    title: 'Orbit Dashboard',
    description:
      'Panel analitik dengan grafik realtime, tema gelap/terang, dan drag-and-drop widget. Data visual gaya mission-control untuk monitoring layanan.',
    tech: ['React', 'JavaScript', 'REST API', 'Git'],
    link: '',
    live: '',
    preview: '',
    gradient: 'linear-gradient(135deg, #312e81 0%, #4f46e5 45%, #38bdf8 100%)',
    category: 'Dashboard',
    icon: CodeXml,
  },
  {
    title: 'Lanyard 3D Portfolio',
    description:
      'Kartu identitas 3D yang bergantung dan berayun dengan fisika tali — memakai komponen resmi React Bits Lanyard di atas Three.js.',
    tech: ['React', 'Three.js', 'React Three Fiber', 'Vite'],
    link: '',
    live: '',
    preview: '',
    gradient: 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 45%, #67e8f9 100%)',
    category: '3D / WebGL',
    icon: Terminal,
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

/* ============ SERTIFIKAT ============ */
export const certificates = [
  { name: 'Belajar Dasar Pemrograman Web', issuer: 'Dicoding', year: '2024' },
  { name: 'Front-End Web with React', issuer: 'FreeCodeCamp', year: '2025' },
  { name: 'JavaScript Algorithms & Data Structures', issuer: 'FreeCodeCamp', year: '2025' },
]

/* ============ RIWAYAT PENDIDIKAN (jenjang sekolah) ============
   Ditampilkan di section Education (Experience.jsx), tepat di bawah About.
   Urutan = kronologis (SMP lebih dulu, lalu SMK).
   - `level`  -> subtitle bila tidak ada `major`
   - `major`  -> jurusan (menggantikan `level` sebagai subtitle)
   - `tag`    -> pil kecil di bawah jurusan (opsional)
   - `logo`   -> file di folder `public/`. Logo sekolah transparan saat ini
                 ada di `public/logo-sekolah.png` (bisa diganti kapan saja).
                 Bila gambar gagal dimuat, ikon kelulusan dipakai otomatis. */
export const education = [
  {
    school: 'SMP AL-HADIID CILEUNGSI',
    level: 'Sekolah Menengah Pertama',
    years: '2022 – 2025',
    logo: '/logo-sekolah.png',
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
   Sengaja masih kosong — isi dengan data asli milikmu agar kolom
   "Experience" otomatis muncul di samping Education.
   Bentuk data (urutkan dari yang terbaru):
   { company: 'Nama instansi', role: 'Jabatan', detail: 'Lokasi · Detail',
     years: '2025 – Sekarang', icon: OpsionalIkonLucide } */
export const experience = []

/* ============ STATISTIK ============
   `detail` = kalimat kecil di bawah label (meniru referensi). */
export const stats = [
  { label: 'Projects', value: 3, icon: FolderGit2, detail: 'Karya yang dibuat' },
  { label: 'Certificates', value: 3, icon: ShieldCheck, detail: 'Skill yang divalidasi' },
  { label: 'Awards', value: 1, icon: Trophy, detail: 'Pencapaian diraih' },
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
