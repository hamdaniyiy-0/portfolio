# Portfolio — Hamdani Firmansyah

Website portfolio personal modern, interaktif, dan futuristik.
Dibangun dengan **React (Vite)** + **Tailwind CSS**, dilengkapi **dark mode**,
animasi halus, **efek 3D**, dan kartu **Lanyard** resmi dari
**React Bits** (kartu ID yang bergantung di tali dengan fisika nyata).

![stack](https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black)
![vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![tailwind](https://img.shields.io/badge/Tailwind_CSS-0EA5E9?style=flat&logo=tailwindcss&logoColor=white)
![three](https://img.shields.io/badge/Three.js-000000?style=flat&logo=threedotjs&logoColor=white)

---

## ▶️ Cara Menjalankan

```bash
npm install          # install dependensi
npm run dev          # jalankan server development  -> http://localhost:5173
npm run build        # build produksi ke folder dist/
npm run preview      # preview hasil build produksi
npm run check        # uji runtime (Edge headless): error console + screenshot
npm run shots        # screenshot per section untuk review visual
node scripts/upgrade-test.mjs  # uji 4 task upgrade (22 asersi, butuh dev server)
node scripts/shots-new.mjs     # screenshot fitur baru (bento, command menu, hover)
```

---

## 📦 Dependensi Utama

| Paket | Kegunaan |
| --- | --- |
| `three` | Engine 3D (versi yang disyaratkan React Bits) |
| `@react-three/fiber` | Renderer Three.js untuk React (dipakai Lanyard) |
| `framer-motion` | Animasi fade/slide, layout pill navbar, tilt 3D |
| `cmdk` | Command menu (Ctrl+K / Cmd+K) bergaya Spotlight |
| `lucide-react` | Ikon UI |
| `tailwindcss` | Utility-first styling + tema via CSS variable |

> **Catatan:**
> - **Tidak** memakai `@react-three/drei` / `@react-three/rapier` — komponen
>   **Lanyard resmi React Bits** sudah menangani fisika, drag, buang (throw),
>   dan klik-untuk-membalik kartu sendiri.
> - `lucide-react` v1 tidak menyediakan ikon brand, jadi **GitHub, Instagram,
>   dan TikTok** dibuat custom di `src/components/icons/`.
> - Komponen React Bits (`Lanyard`, `BlurText`, `GlareHover`, `ShinyText`)
>   di-*vendor* ke `src/components/react-bits/` — bisa diperbarui dari
>   [reactbits.dev](https://reactbits.dev) kapan saja.

---

## 🗂 Struktur Folder

```
portfolio/
├── public/
│   ├── favicon.svg
│   ├── foto-asli.png           # hasil cutout (latar merah sudah dihapus)
│   ├── foto-asli-ring.png      # mask cincin siluet untuk beam putih
│   └── card-front.png / card-back.png / band.png   # kartu Lanyard (milik Anda)
├── scripts/                    # tooling verifikasi (opsional)
│   ├── check.mjs               # uji runtime: error console + screenshot
│   ├── shots-sections.mjs      # screenshot per section
│   ├── mobile-check.mjs        # cek viewport HP + kondisi kartu
│   ├── overflow-check.mjs      # cari elemen penyebab overflow
│   ├── hscroll-check.mjs       # buktikan tidak ada gulir horizontal
│   ├── drag-test.mjs           # regresi seret kartu lanyard
│   ├── nav-test.mjs            # regresi navbar: scroll-spy + menu mobile
│   ├── images-test.mjs         # cek gambar hasil edit (200) + img lain di DOM
│   ├── hero-redesign.mjs       # screenshot hero desktop/tablet/mobile + cek overflow
│   ├── sfx-test.mjs            # regresi suara klik menyeluruh (tepat 1x per klik)
│   ├── preload-test.mjs        # regresi preloader + pill navbar + klik suara
│   ├── upgrade-test.mjs        # uji fitur upgrade: bento, command menu, tilt, parallax, mobile
│   ├── photo-swap-test.mjs     # uji cutout foto About + beam putih + status swap
│   ├── cutout-photo.mjs        # hapus latar foto & bikin mask ring siluet
│   ├── education-beam-test.mjs # uji riwayat pendidikan + animated thin border Stats Card
│   └── shots-new.mjs           # screenshot fitur baru (bento, modal command, hover preview)
└── src/
    ├── assets/
    │   └── avatar.svg          # aset placeholder lama (tidak dipakai)
    ├── components/
    │   ├── icons/              # ikon brand custom
    │   ├── react-bits/         # komponen resmi React Bits (di-vendor)
    │   │   ├── Lanyard.jsx     #   kartu ID 3D + fisika tali
    │   │   ├── BlurText.jsx    #   judul blur-out per kata
    │   │   ├── GlareHover.jsx  #   kilau mengikuti kursor (kartu skill)
    │   │   └── ShinyText.jsx   #   teks berkilau (baris footer)
    │   ├── Navbar.jsx          # pill navbar rapat (fit-content) + scroll-spy + suara klik
    │   │                       #   + tombol command menu (⌘)
    │   ├── Preloader.jsx       # layar loading 0→100% "Memuat assets..." saat buka situs
    │   ├── Hero.jsx            # hero dua baris (gradien biru + putih) + typewriter + lazy Lanyard
    │   ├── CommandMenu.jsx     # modal command menu (cmdk) — Ctrl+K / ikon navbar
    │   ├── PhotoSwap.jsx       # efek swap 2 foto di About (hover desktop / ketuk ponsel)
    │   ├── TechStack.jsx       # bento grid teknologi asimetris (grayscale → warna saat hover)
    │   ├── Logos.jsx           # logo SVG inline: React, Three.js, Tailwind, JS, Figma
    │   ├── LanyardBadge.jsx    # WRAPPER Lanyard: gambar kartu milik pengguna + fallback
    │   ├── HeroScene.jsx       # aksen wireframe 3D (R3F) — tidak dipakai sejak redesign (file disimpan)
    │   ├── Lanyard.jsx         # alternatif LAWAS (butuh drei + rapier) — tidak dipakai
    │   ├── About.jsx           # layout 3 kolom
    │   ├── Education.jsx       # riwayat jenjang sekolah (SMP → SMK) di bawah About
    │   ├── Stats.jsx           # kartu statistik + count-up + animated thin border
    │   ├── Skills.jsx          # skill BERKELOMPOK + GlareHover (tanpa %)
    │   ├── Projects.jsx        # kartu project + tilt 3D + tombol placeholder
    │   ├── Music.jsx           # embed Spotify (lazy loaded)
    │   ├── Contact.jsx         # 2 kartu: form mail-jujur + Komentar lokal
    │   ├── Footer.jsx          # nav + sosial + ShinyText
    │   ├── SpaceBackground.jsx  # latar deep space: gradasi nebula + starfield SVG + meteor + parallax
    │   └── Reveal.jsx          # wrapper animasi scroll
    ├── data/
    │   └── portfolio.js        # SEMUA KONTEN ada di sini
    ├── hooks/
    │   ├── useTheme.js         # dark / light mode + localStorage
    │   ├── useAmbientAudio.js  # musik ambient dari Web Audio API
    │   ├── useCardTilt.js      # tilt 3D sumbu X/Y untuk wadah kartu (rAF, aman drag/flip)
    │   └── useCommandMenu.js   # state + pintasan Ctrl/Cmd+K untuk command menu
    ├── lib/
    │   ├── cardFaces.js        # gambar wajah kartu via <canvas> 2D (cadangan, belum dipakai)
    │   ├── sfx.js              # efek suara klik UI (Web Audio, tanpa file)
    │   └── webgl.js            # deteksi dukungan WebGL
    ├── App.jsx
    ├── main.jsx
    └── index.css               # palet warna & utility kustom
```

---

## 🪪 Cara Kerja Lanyard 3D

Menggunakan **komponen resmi React Bits `Lanyard`** (bukan animasi gambar):

1. **Fisika nyata** — kartu digantungkan pada tali dan dihitung oleh engine
   fisika di dalam komponen: gravitasi, damping, elastisitas, dan "breeze"
   (angin pelan) bisa diatur lewat `lanyard.config` di `src/data/portfolio.js`.
2. **Interaktif** — seret kartu, lemparkan, lalu **klik untuk membalik**
   (sisi depan/belakang). Di ponsel mendukung sentuhan (*touch*).
3. **Gambar kartu milik pengguna** — wajah depan/belakang kartu dan tali
   memakai **file gambar hasil edit** di `public/`
   (`card-front.png`, `card-back.png`, `band.png`) yang dilewatkan lewat
   `lanyard.config` di `src/data/portfolio.js`. Tidak ada gambar
   default/placeholder, dan tidak ada gambar pengganti bila file tidak
   ditemukan (laporkan saja kepada pemilik situs).
4. **Fallback aman** — bila WebGL tidak tersedia / renderer error, komponen
   `LanyardBadge` menampilkan kartu statis dengan efek tilt CSS
   (`StaticBadge`) plus pesan jelas, tanpa error console.
5. **Performa** — render berhenti saat tab tidak terlihat / kartu di luar
   viewport, DPR dibatasi ≤ 2, dan `prefers-reduced-motion` dihormati.
6. **Penyesuaian lokal drag (patch kecil)** — beberapa penyesuaian di
   `src/components/react-bits/Lanyard.jsx` + `Lanyard.css` (ditandai komentar
   *"Penyesuaian lokal"*) agar pengalaman seret sesuai keinginan:
   - **Tanpa batasan**: kartu mengikuti kursor ke mana pun (kedalaman dikunci
     di bidang datar z konstan agar tidak pernah menjorok ke kamera), dan
     **orientasi kartu dikunci menghadap kamera** saat digenggam sehingga tidak
     pernah berputar menyamping / tampak "menghilang".
   - **Kanvas seluas hero**: di layar lebar (≥1024px) kanvas menutupi seluruh
     area hero (anchor `right`, `size` 0.46) sehingga kartu bebas diseret ke
     pojok mana pun tanpa terpotong tepi kanvas. Kanvas memakai
     `pointer-events:none` dan seluruh event dialihkan ke `window`, jadi
     tombol/tautan/teks di bawahnya tetap berfungsi (grab hanya terjadi saat
     pointer benar-benar mengenai kartu). Di ponsel/tablet kanvas tetap kotak
     terpisah — posisinya **di bawah deskripsi** (satu kolom).
   Test regresi: `node scripts/drag-test.mjs` (butuh dev server + Edge lokal).
7. **Alternatif lama** — `src/components/Lanyard.jsx` (fisika `@react-three/rapier`)
   disimpan sebagai opsi; untuk memakainya lagi:
   `npm i @react-three/drei @react-three/rapier` lalu ganti impor di `Hero.jsx`.

---

## 🚪 Layar Loading & Navbar

- **Preloader** (`src/components/Preloader.jsx`) — tampil sekali saat situs
  baru dibuka: persentase besar **0% → 100%** (+ simbol `%` biru), bar progres
  tipis, dan teks `Memuat assets...`. Persen mengikuti pemuatan nyata
  (`window load`) dengan durasi minimum ±1.4 detik dan batas pengaman 6 detik,
  lalu memudar otomatis. Gulir dikunci selama tampil, dan animasi dihormati
  bila pengguna memakai *reduced-motion*.
- **Navbar pill rapat & bening** — lebar pill mengikuti isi (`w-auto`, bukan
  `max-w-3xl`), jadi tidak ada ruang kosong di kiri/kanan: hanya
  Home · About · Portfolio · Contact, pemisah, lalu ikon suara. Efek kaca
  dibuat tembus pandang (`bg-surface/40` + `backdrop-blur-2xl`) sehingga
  bintang starfield sedikit terlihat di baliknya.
- **Suara klik menyeluruh** (`src/lib/sfx.js`) — setiap link & tombol di
  seluruh halaman (navbar, hero, kartu project, footer, form, tombol ikon)
  memutar efek klik pendek hasil Web Audio API (tanpa file audio, tanpa
  asset tambahan). Listener dipasang sekali secara global di `App.jsx`
  (eksklusi via atribut `data-sfx="off"`). Suara hanya dibangkitkan dari
  gesture pengguna sehingga aman terhadap kebijakan autoplay browser.

---

## 🌌 Hero — "Modern Dark Space Portfolio"

- **Latar "Deep Space / Starry Night"** (`SpaceBackground.jsx`,
  CSS + SVG murni): hitam navy pekat `#020617` dengan kabut nebula biru
  yang menyapu tepi kiri/kanan, starfield ±190 bintang deterministik
  (posisi/ukuran dari PRNG tetap) yang berkedip halus bertahap, serta
  4 meteor tipis yang menyapu menyilang dari beberapa sudut layar —
  tanpa gambar eksternal.
- **Kiri**: judul dua baris — `Welcome to` gradien biru, `My Portfolio` putih
  (dari `profile.welcome` di `portfolio.js`), sub-judul profesi dengan efek
  mengetik (`profile.roles`), deskripsi singkat, tombol `Lihat Projek` &
  `Hubungi Saya` (sudut `rounded-lg`, ikon setelah teks), serta label
  **FIND ME** dengan tiga ikon sosial kotak berbingkai.
- **Kanan**: kartu ID futuristik pada tali Lanyard (foto & desain asli
  pengguna) yang digantung dari atas halaman, dengan glow di belakangnya.
  Di ponsel hero jadi satu kolom dan kartu turun ke bawah deskripsi.
- **Animasi**: fade-in per blok (`Reveal`), blur-in judul (`BlurText`),
  mengambang halusnya kartu (fisika Lanyard), transisi navbar — semua
  menghormati `prefers-reduced-motion`.

---

## ⚡ Micro-interactions & Fitur Upgrade

### Tilt 3D kartu (`useCardTilt.js`)
- Wadah kartu ID miring mengikuti kursor — **hanya sumbu X/Y**
  (maks 6°/8°, lerp per frame), zona = setengah kanan hero.
- **Drag & klik-untuk-membalik tetap aman**: `pointerdown` (fase capture)
  mengembalikan transform ke datar secara sinkron, sehingga hit-testing
  kanvas WebGL selalu terjadi pada bidang datar.
- Hanya aktif pada pointer presisi + layar ≥1024px + tanpa reduced-motion.

### Parallax & latar deep space (`SpaceBackground.jsx`)
- Dua wrapper bergerak berlawanan arah kursor (jauh ±8/6px, dekat
  ±14/11px) lewat **satu loop rAF**; stabil = loop berhenti (hemat baterai).
- Starfield dibuat deterministik (PRNG tetap → posisi/ukuran/opacity
  bintang selalu sama tiap load) berupa lingkaran SVG dalam 3 layer
  (jauh/dekat/rapat), tiap layer dibagi menjadi 3 fase kedip
  (`star-twinkle`, durasi berbeda) supaya berkedip tidak seragam.
- Kabut nebula memakai `glow-breathe` dan meteor memakai
  `meteor-streak` — semuanya hanya opacity/transform (komposit GPU),
  tanpa raster ulang.
- Layer starfield sengaja dibuat melebihi viewport (`-inset-16`) supaya
  parallax tidak pernah membuka tepi kosong.
- **Ponsel**: parallax tidak dipasang + layer starfield paling rapat
  (`.space-dense`) disembunyikan agar FPS tetap stabil.
- **Reduced-motion**: seluruh animasi latar (kedip bintang, sapuan
  meteor & napas nebula) mati otomatis lewat blok
  `prefers-reduced-motion` di `index.css`.

### Bento grid TechStack (`TechStack.jsx` + `Logos.jsx`)
- Section `#stack` tepat di bawah hero: grid **asimetris** — kartu React
  besar (span 2×2), Three.js / Tailwind / JavaScript / Figma kecil.
- Hover: kartu terangkat + **logo grayscale → warna penuh** + glow biru.
- Logo SVG inline (tanpa jaringan): React atom, Three.js & Tailwind dari
  simple-icons (CC0), Figma 5 warna resmi.

### Pratinjau hover project (`Projects.jsx`)
- Saat hover kartu project muncul overlay pratinjau: memakai
  `project.preview` (URL gambar/GIF) bila diisi di data; jika kosong tampil
  **wireframe browser bergerak** (dekoratif — bukan screenshot palsu).
- Kartu tetap tampil dengan animasi **fade-in-up** (`Reveal` / framer-motion).

### Command menu (`CommandMenu.jsx` + `useCommandMenu.js`, library `cmdk`)
- **Ctrl+K / Cmd+K** atau ikon ⌘ di navbar membuka modal terpusat.
- Daftar: 4 link navigasi + 3 tautan sosial, **filter substring ketat saat
  mengetik** (skor fuzz bawaan cmdk diganti agar prediktabel), navigasi
  keyboard bawaan (↑↓, Enter, Escape).
- Pilih item → modal tertutup + **scroll halus** ke section (sosial membuka
  tab baru). Scroll halaman dikunci selama modal terbuka.

### Cutout foto + Animated Thin Border putih (`PhotoSwap.jsx`)
- **Latar merah dihapus otomatis**: foto asli (`public/FOTO DIRI me.png`)
  diproses `node scripts/cutout-photo.mjs` → `public/foto-asli.png`
  (PNG transparan) + `public/foto-asli-ring.png` (mask cincin siluet).
  Algoritmanya: crop bingkai hitam → flood-fill predicate merah ketat
  (`r−g≥25 && r−b≥25 && g≤60`, perlindungan ganda untuk kulit/lipstik)
  dari tepi → fringe 1px → red-spill ditekan → feather → ring =
  dilate(alpha, r=3) − alpha (cincin tipis ±1px di layar). Hasil diverifikasi per-piksel (sudut `a=0`,
  wajah/seragam `a=255`) — **tanpa gambar pengganti/pura-pura**.
- **Animated Thin Border putih** (`.photo-beam`): conic-gradient putih
  (garis dasar 0.34 + ekor panas penuh) **dipotong mask PNG ring siluet**
  (`mask: … / foto-asli-ring.png center / cover`) sehingga garis tipisnya
  hanya muncul **di sekeliling objek manusia**, memutar 4.5s memakai
  `@property --beam-angle` + `@keyframes stats-beam-spin`. Glow
  `drop-shadow` dipasang di **wrapper** (filter di luar elemen bermask).
  Mati otomatis pada `prefers-reduced-motion`.
- **Status swap jujur**: `foto-spiderman.jpg` belum ada, jadi PhotoSwap
  mengeceknya dulu dengan `GET` + cek `content-type: image/*`
  (dev server Vite memakai SPA fallback → file hilang tetap 200 text/html;
  `HEAD`/cancel memicu `net::ERR_ABORTED`, jadi dibaca tuntas). Bila tidak
  ada: overlay tidak dirender, tombol swap dilepas (`role`/`aria-pressed`
  hilang), dan petunjuk "hover / ketuk foto" tidak tampil. **0 request
  404/ gagal di console.**
- Aktifkan lagi kapan pun: letakkan foto →
  `node scripts/cutout-photo.mjs --in "<file>" --out public/foto-spiderman`.
- Bila foto asli hilang: bingkai menampilkan pesan jujur *"foto belum
  dipasang"* + langkah menjalankan skrip — **tanpa avatar placeholder**.
- Bingkai `aspect-square` (foto ~1:1) supaya objek tidak terpotong samping.
- Uji: `node scripts/photo-swap-test.mjs` (13 asersi: piksel cutout via
  canvas, conic+mask+rotasi beam, status swap, reduced-motion, ponsel).

### Riwayat pendidikan (`Education.jsx`)
- Section `#education` tepat **di bawah About** (sebelum Stats): judul
  `// riwayat pendidikan` + **Education**, lalu kartu jenjang sekolah
  (ikon toga, nama, jenjang, tahun) dari data `education`:
  **SMP AL-HADIID CILEUNGSI (2022 – 2025)** lalu
  **SMK AL-HADIID 1 CILEUNGSI (2025 – 2027)**.
- 2 kolom di layar lebar, tumpuk di ponsel; hover mengangkat kartu halus
  (spring framer-motion) dan menghormati `prefers-reduced-motion`.

### Animated thin border Stats Card (`index.css` → `.stats-beam`)
- Garis tepi tipis **berputar seperti laser/beam** di ketiga Stats Card,
  memakai trik **`conic-gradient` + animasi rotasi** (`@keyframes
  stats-beam-spin`, sudut gradient dirotasi via custom property
  `--beam-angle` yang didaftarkan `@property`).
- Lapisan beam dipotong **mask** menjadi cincin **1.5px** di tepi, lalu
  **tengah kartu ditutup div background card** (`inset-[1.5px]`,
  `bg-surface/40 backdrop-blur-md`) — hanya garis luarnya yang tersisa,
  tanpa cahaya menembus ke dalam, dan teks di atasnya (z-index 10) tetap
  terbaca jelas.
- Efek **mati otomatis** pada `prefers-reduced-motion`; nama keyframes
  sengaja bukan `spin` agar tidak bentrok dengan `@keyframes` bawaan
  Tailwind.
- Uji: `node scripts/education-beam-test.mjs` (15 asersi: urutan section,
  isi kartu, mask/cover, rotasi nyata, reduced-motion, ponsel).

---

## 🎨 Tema Warna

Dark mode default (`#020617` deep space black + starfield nebula + aksen `#3b82f6`).
Semua warna didefinisikan sebagai CSS variable di `src/index.css`:

```css
:root       { --c-bg: 3 6 16; --c-navy: 7 13 27; --c-line: 148 167 196; ... }  /* gelap */
html.light  { --c-bg: 240 245 255; --c-navy: 214 226 245; --c-line: 71 85 105; ... }  /* terang */
```

Ganti nilai tersebut untuk mengubah seluruh warna situs sekaligus.
Tombol ganti tema ada di navbar versi mobile (tersimpan di `localStorage`);
desktop mengikuti tema aktif. Ikon suara di navbar mengontrol musik latar.

---

## 🔠 Typografi

**Inter adalah satu-satunya font di seluruh situs** — termasuk judul hero
"Welcome to My Portfolio", label mono, dan teks pada gambar kartu (digambar
lewat canvas 2D). Google Fonts hanya memuat Inter (400–800), jadi halaman
lebih ringan dan tampilannya konsisten.

Di `tailwind.config.js`, ketiga keluarga `sans`, `display`, dan `mono` sama-sama
menunjuk ke Inter — kelas `font-display` / `font-mono` dipertahankan agar markup
dan test tidak berubah, tapi hasilnya tetap Inter.

---

## ✏️ Mengubah Konten (semua di satu file)

Hampir semua teks berada di **`src/data/portfolio.js`**:

| Bagian | Isi |
| --- | --- |
| `navLinks` | Menu navbar & footer (cocokkan dengan `id` section) |
| `profile` | Nama, `initials`, judul hero (`welcome` 2 baris), role (`roles`), bio, email, lokasi, sekolah, `photos` (path 2 foto swap About) |
| `projects` | Judul, deskripsi, tech stack, ikon, **`link`/`live`**, **`preview`** (URL gambar hover, opsional) |
| `techStack` | Item bento grid (nama, `logo` kunci di Logos.jsx, catatan, `size`) |
| `skillGroups` | Skill per kelompok — **tanpa persentase** |
| `certificates`, `stats` | Sertifikat & statistik |
| `education` | Riwayat jenjang sekolah (nama, jenjang, tahun) — section Education |
| `socials`, `contactInfo` | Tautan sosial & info kontak |
| `lanyard.config` | fisika/ukuran/warna kartu (properti resmi React Bits) |
| `lanyard.card` | Teks yang tercetak di wajah kartu |
| `spotifyPlaylistId` | ID playlist Spotify |

**Aturan tautan:** kosongkan `link`/`live` dengan string `''` — tombol akan
menampilkan *"belum tersedia"* alih-alih tautan palsu. Isi `socials[].link`
dengan URL profil aslimu.

**Foto profil:** wajah kartu Lanyard memakai **gambar hasil edit milikmu** di
folder `public/` (`card-front.png`, `card-back.png`, `band.png`) sesuai
`lanyard.config` — jangan diganti dengan gambar lain. Section About memakai
`foto-asli.png` (cutout transparan) + mask `foto-asli-ring.png` di `public/`
(lihat `profile.photos`); keduanya dibuat oleh `scripts/cutout-photo.mjs`,
bukan diedit manual.

---

## ✉️ Formulir Kontak & Komentar (jujur, tanpa backend)

Section "Hubungi saya" memakai **dua kartu** (layout referensi):

**Kartu kiri — "Hubungi"**

- Validasi custom (nama, format email, panjang pesan) dengan pesan error
  per field dan `aria-invalid`.
- Submit yang valid membuka **mail client** pengguna (`mailto:`) — pesan
  **dikirim oleh pengguna sendiri di sana**, jadi situs **tidak pernah**
  mengklaim "pesan terkirim" / "berhasil".
- Tidak ada data yang dikirim ke server mana pun.
- **FIND ME**: daftar sosial (ikon + nama platform + panah) — tanpa
  username/handle karangan.

**Kartu kanan — "Komentar"**

- Komentar disimpan di **localStorage perangkat** (`portfolio-comments-v1`),
  bukan di server. UI menulis ini terang-terangan, dan angka pada judul
  "Komentar (n)" adalah **jumlah sebenarnya** — bukan angka hiasan.
- Foto profil opsional: divalidasi (image, maks 5 MB), lalu **dikecilkan ke
  96×96 JPEG** via canvas sebelum disimpan agar kuota localStorage aman.
- Bisa dihapus per komentar; batas 50 komentar per browser; kegagalan
  penyimpanan (mode privat / kuota penuh) ditampilkan apa adanya.
- Komentar hanya terlihat di perangkat yang sama — bukan komentar publik.

---

## 🔍 Verifikasi Runtime (opsional)

```bash
npm run dev                  # jalankan dev server dulu
npm run check                # Edge headless: cek error console + screenshot
npm run shots                # screenshot tiap section
node scripts/mobile-check.mjs   # cek viewport HP + kartu setelah tenang
node scripts/hscroll-check.mjs  # buktikan tak ada gulir horizontal
node scripts/drag-test.mjs      # regresi seret kartu lanyard
node scripts/nav-test.mjs       # regresi navbar: scroll-spy + menu mobile
node scripts/hero-redesign.mjs  # screenshot hero 3 viewport + urutan kartu mobile
node scripts/sfx-test.mjs       # regresi suara klik di semua elemen interaktif
node scripts/upgrade-test.mjs   # uji 20 asersi fitur upgrade (bento/command/tilt/parallax/mobile)
node scripts/photo-swap-test.mjs # uji 13 asersi cutout + beam putih + status swap
node scripts/education-beam-test.mjs # uji 15 asersi pendidikan + beam Stats Card
node scripts/shots-new.mjs      # screenshot fitur baru untuk review visual
node scripts/cutout-photo.mjs   # buat foto-asli.png (latar dihapus) + ring siluet
```

Script memastikan tidak ada error console, WebGL hidup, semua `id` section
ada, dan menghasilkan screenshot hero/light/mobile ke folder `scripts/`.
