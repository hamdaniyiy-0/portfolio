/**
 * Netlify Function: GET /.netlify/functions/get-comments
 *
 * Mengambil submission form "comment" dari Netlify Forms API, lalu
 * mengembalikan hanya data publik (nama, komentar, waktu) ke frontend.
 *
 * Environment variables yang dibutuhkan:
 *   NETLIFY_FORMS_TOKEN  → Personal Access Token Netlify (WAJIB, rahasia)
 *   NETLIFY_SITE_ID      → opsional; fallback ke SITE_ID bawaan Netlify,
 *                          lalu ke Site ID situs ini (bukan data rahasia).
 */

const SITE_ID =
  process.env.NETLIFY_SITE_ID ||
  process.env.SITE_ID ||
  '420fbda8-64e6-4de7-a3ec-91cd4eca519d'

const TOKEN = process.env.NETLIFY_FORMS_TOKEN
const FORM_NAME = 'comment'
const MAX_PAGES = 5
const PER_PAGE = 100
const MAX_COMMENTS = 100

const json = (statusCode, payload) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    // Jangan di-cache: setelah kirim komentar, frontend langsung memanggil ulang
    // endpoint ini dan harus mendapat data terbaru.
    'Cache-Control': 'no-store',
  },
  body: JSON.stringify(payload),
})

export async function handler() {
  if (!TOKEN) {
    console.error('[get-comments] NETLIFY_FORMS_TOKEN belum diset.')
    return json(500, { error: 'Server komentar belum dikonfigurasi.' })
  }

  try {
    const all = []

    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const url =
        `https://api.netlify.com/api/v1/sites/${SITE_ID}/submissions` +
        `?per_page=${PER_PAGE}&page=${page}`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        console.error(`[get-comments] Netlify API ${response.status}: ${await response.text()}`)
        return json(502, { error: 'Gagal mengambil komentar dari Netlify.' })
      }

      const batch = await response.json()
      if (!Array.isArray(batch) || batch.length === 0) break

      all.push(...batch)
      if (batch.length < PER_PAGE) break
    }

    const comments = all
      .filter((submission) => submission.form_name === FORM_NAME && !submission.spam)
      .map((submission) => {
        const data = submission.data || {}
        return {
          id: String(submission.id || ''),
          name: String(data.name || '').trim().slice(0, 50),
          message: String(data.message || '').trim().slice(0, 500),
          createdAt: new Date(submission.created_at).getTime(),
        }
      })
      .filter((comment) => comment.name && comment.message && Number.isFinite(comment.createdAt))
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, MAX_COMMENTS)

    return json(200, { comments })
  } catch (error) {
    console.error('[get-comments] Error:', error?.message || error)
    return json(502, { error: 'Gagal memuat komentar.' })
  }
}
