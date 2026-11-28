import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // 1. Tambahan untuk Tailwind
import { fileURLToPath, URL } from 'node:url' // 2. Tambahan untuk Alias

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss() // 3. Daftarkan plugin Tailwind di sini
  ],
  resolve: {
    alias: {
      // 4. Tambahan Alias agar '@' mengarah ke folder 'src'
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      // Frontend memanggil /api/contact → diteruskan ke server Express (Nodemailer)
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
})