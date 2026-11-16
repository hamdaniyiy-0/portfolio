-- ============================================================
-- Supabase Storage policies — bucket "comment-photos"
-- Jalankan di Supabase Dashboard -> SQL Editor -> Run.
--
-- Dibutuhkan oleh fitur komentar di Contact.jsx:
--   1. Pengunjung (anon) boleh mengunggah foto komentar.
--   2. Foto boleh dibaca publik lewat getPublicUrl().
--
-- Aman dijalankan berulang kali (policy lama di-drop dulu).
-- ============================================================

-- Pastikan bucket ada dan bisa dibaca publik.
-- Supabase Storage -> bucket "comment-photos" -> Public bucket: ON.
insert into storage.buckets (id, name, public)
values ('comment-photos', 'comment-photos', true)
on conflict (id) do update set public = true;

-- 1. Izinkan siapa saja mengunggah (insert) ke bucket comment-photos
drop policy if exists "Allow public uploads for comment photos" on storage.objects;
create policy "Allow public uploads for comment photos"
on storage.objects for insert
to public
with check (bucket_id = 'comment-photos');

-- 2. Izinkan siapa saja melihat (select) foto dari bucket comment-photos
drop policy if exists "Allow public read for comment photos" on storage.objects;
create policy "Allow public read for comment photos"
on storage.objects for select
to public
using (bucket_id = 'comment-photos');

-- ============================================================
-- Verifikasi: harus muncul 2 baris (INSERT dan SELECT).
-- ============================================================
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname in (
    'Allow public uploads for comment photos',
    'Allow public read for comment photos'
  )
order by cmd;

-- Cek status bucket (public harus true).
select id, public, file_size_limit, allowed_mime_types
from storage.buckets
where id = 'comment-photos';

-- ============================================================
-- OPSIONAL (disarankan): batasi ukuran & tipe file di level bucket.
-- Client sudah membatasi 5 MB, tetapi batas bucket mencegah bypass
-- lewat request langsung ke Supabase.
--
-- update storage.buckets
-- set file_size_limit = 5242880,
--     allowed_mime_types = array[
--       'image/jpeg',
--       'image/png',
--       'image/webp',
--       'image/gif'
--     ]
-- where id = 'comment-photos';
-- ============================================================
