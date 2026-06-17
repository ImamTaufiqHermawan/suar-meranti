# SuarMeranti — Panduan Deploy Lengkap

Panduan step-by-step untuk setup, development, dan deploy aplikasi **SuarMeranti — Kotak Saran & Aspirasi Warga Bukit Meranti** dari nol hingga production di Vercel.

---

## Daftar Isi

1. [Ringkasan Proyek](#1-ringkasan-proyek)
2. [Prasyarat](#2-prasyarat)
3. [Buat Repository GitHub](#3-buat-repository-github)
4. [Setup Lokal](#4-setup-lokal)
5. [Setup Database Supabase](#5-setup-database-supabase)
6. [Jalankan Aplikasi Lokal](#6-jalankan-aplikasi-lokal)
7. [Deploy ke Vercel](#7-deploy-ke-vercel)
8. [Setup CI/CD GitHub Actions](#8-setup-cicd-github-actions)
9. [Custom Domain (Opsional)](#9-custom-domain-opsional)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Ringkasan Proyek

| Item | Nilai |
|------|-------|
| **Nama Aplikasi** | SuarMeranti |
| **Judul** | Kotak Saran & Aspirasi Warga |
| **Cluster** | Bukit Meranti, Citra Indah City Jonggol |
| **Tagline** | Suara Warga, Harmoni Komunitas |
| **GitHub Repo** | `suar-meranti` |
| **Tech Stack** | Next.js 15, React 19, TypeScript, Tailwind CSS, Supabase |
| **Deploy** | Vercel (region: Singapore) |

### Fitur Utama

- Form kirim saran/aspirasi dengan opsi **anonim** atau **tampilkan identitas** (nama + alamat)
- Feed publik mirip Facebook — semua warga bisa melihat postingan
- Kategori: Saran, Aspirasi, Keluhan, Pujian
- Tombol suka pada setiap posting
- Responsif 100%: mobile, tablet, laptop/PC
- Kompatibel: Chrome, Firefox, Safari (Android & iOS)

---

## 2. Prasyarat

Pastikan sudah terinstall:

- [Node.js](https://nodejs.org/) v20 atau lebih baru
- [Git](https://git-scm.com/)
- Akun [GitHub](https://github.com/) (gratis)
- Akun [Supabase](https://supabase.com/) (gratis)
- Akun [Vercel](https://vercel.com/) (gratis)

---

## 3. Buat Repository GitHub

### Langkah 3.1 — Buat repo baru

1. Buka [github.com/new](https://github.com/new)
2. Isi:
   - **Repository name:** `suar-meranti`
   - **Description:** `Kotak Saran & Aspirasi Warga — Cluster Bukit Meranti, Citra Indah City Jonggol`
   - **Visibility:** Public atau Private (sesuai kebutuhan)
3. Klik **Create repository**

### Langkah 3.2 — Push kode ke GitHub

Buka terminal di folder proyek:

```bash
cd "d:\New folder\experiment\Sistem Meranti"

git init
git add .
git commit -m "feat: initial release SuarMeranti — Kotak Saran & Aspirasi Warga Bukit Meranti"
git branch -M main
git remote add origin https://github.com/USERNAME/suar-meranti.git
git push -u origin main
```

Ganti `USERNAME` dengan username GitHub Anda.

---

## 4. Setup Lokal

### Langkah 4.1 — Install dependencies

```bash
npm install
```

### Langkah 4.2 — Buat file environment

```bash
cp .env.example .env.local
```

Edit `.env.local` dan isi nilai Supabase (langkah 5):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 5. Setup Database Supabase

### Langkah 5.1 — Buat project Supabase

1. Login ke [supabase.com/dashboard](https://supabase.com/dashboard)
2. Klik **New Project**
3. Isi:
   - **Name:** `suar-meranti`
   - **Database Password:** buat password kuat (simpan!)
   - **Region:** Southeast Asia (Singapore) — terdekat dengan Indonesia
4. Klik **Create new project** (tunggu ~2 menit)

### Langkah 5.2 — Jalankan migration SQL

1. Di dashboard Supabase, buka **SQL Editor**
2. Klik **New query**
3. Copy seluruh isi file [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql) → **Run**
4. Buat query baru, copy [`supabase/migrations/002_admin_likes_richtext.sql`](supabase/migrations/002_admin_likes_richtext.sql) → **Run**
5. Buat query baru, copy [`supabase/migrations/003_fix_admin_bcrypt.sql`](supabase/migrations/003_fix_admin_bcrypt.sql) → **Run**
6. Pastikan tabel `aspirations`, `aspiration_likes`, dan `admins` sudah ada

### Langkah 5.3 — Ambil API credentials

1. Buka **Project Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (wajib untuk login & hapus admin)
3. Generate `ADMIN_SESSION_SECRET` (string random min. 32 karakter)
4. Paste semua ke `.env.local`

### Langkah 5.4 — Buat akun admin (aman, tanpa password di git)

Migration SQL **tidak** menyimpan password plaintext. Hash bcrypt aman di-push ke GitHub, tetapi **jangan** commit password asli.

1. Di terminal lokal (folder proyek), generate SQL seed:

```bash
node scripts/generate-admin-hash.mjs admin.meranti "PasswordKuatAnda"
```

2. Copy **output SQL** dari terminal → paste di Supabase **SQL Editor** → **Run**
3. Simpan username & password di password manager (bukan di repository)

> Lihat juga [`supabase/seed.admin.example.sql`](supabase/seed.admin.example.sql) sebagai panduan.

Login via tombol **Admin** di header. Setelah login, tombol **Hapus** muncul di setiap posting.

**Production:** gunakan password kuat dan unik — jangan pakai password contoh.

### Langkah 5.5 — Verifikasi RLS (Row Level Security)

Di **Table Editor**, pastikan:
- `aspirations`: policy Public read + Public insert
- `aspiration_likes`: policy Public read + Public insert
- `admins`: RLS enabled, tanpa policy publik

---

## 6. Jalankan Aplikasi Lokal

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

### Uji coba

1. Scroll ke form **Kirim Saran & Aspirasi**
2. Pilih kategori, toggle anonim/identitas, tulis pesan
3. Klik **Kirim Aspirasi**
4. Posting harus langsung muncul di **Feed Aspirasi Warga**
5. Klik tombol **Suka** pada posting — hanya bisa 1x per perangkat
6. Login admin → hapus posting uji coba

### Perintah lain

```bash
npm run lint        # Cek kode
npm run typecheck   # Cek TypeScript
npm run build       # Build production
npm run start       # Jalankan build production
```

---

## 7. Deploy ke Vercel

### Langkah 7.1 — Import project

1. Login ke [vercel.com/dashboard](https://vercel.com/dashboard)
2. Klik **Add New** → **Project**
3. Pilih repository `suar-meranti` dari GitHub
4. Framework akan terdeteksi otomatis: **Next.js**

### Langkah 7.2 — Set environment variables

Di halaman import, tambahkan:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL dari Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key dari Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (untuk hapus admin) |
| `ADMIN_SESSION_SECRET` | Secret random min. 32 karakter |
| `NEXT_PUBLIC_APP_URL` | `https://suar-meranti.vercel.app` |

### Langkah 7.3 — Deploy

1. Klik **Deploy**
2. Tunggu build selesai (~2-3 menit)
3. Aplikasi live di: `https://suar-meranti.vercel.app`

### Langkah 7.4 — Verifikasi production

- [ ] Halaman utama tampil dengan tema hijau Meranti
- [ ] Form submit berhasil
- [ ] Feed menampilkan posting
- [ ] Responsif di mobile (buka di HP)
- [ ] Health check: `https://suar-meranti.vercel.app/api/health`

---

## 8. Setup CI/CD GitHub Actions

Pipeline sudah dikonfigurasi di [`.github/workflows/pipeline.yml`](.github/workflows/pipeline.yml).

### Langkah 8.1 — Tambah GitHub Secrets

1. Buka repo GitHub → **Settings** → **Secrets and variables** → **Actions**
2. Klik **New repository secret**, tambahkan:

| Secret Name | Value |
|-------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key Supabase |
| `ADMIN_SESSION_SECRET` | Secret session admin |

### Langkah 8.2 — Alur otomatis

```
Push/PR ke main
    → GitHub Actions: lint + typecheck + build
    → Vercel: auto-deploy (preview untuk PR, production untuk main)
```

Setiap PR mendapat **Preview URL** otomatis dari Vercel.

---

## 9. Custom Domain (Opsional)

1. Di Vercel Dashboard → project → **Settings** → **Domains**
2. Tambahkan domain, misal: `suarmeranti.id` atau subdomain
3. Ikuti instruksi DNS (CNAME/A record)
4. Update `NEXT_PUBLIC_APP_URL` di Vercel env variables

---

## 10. Troubleshooting

### Build gagal: "Missing Supabase environment variables"

**Penyebab:** Env variables belum diset di Vercel atau GitHub Secrets.

**Solusi:** Pastikan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` sudah di-set di Vercel Dashboard dan GitHub Secrets.

### `getAspirations error: TypeError: fetch failed` (development lokal)

**Penyebab:** Bukan env Supabase yang salah — biasanya **proxy SSL kantor/antivirus** memblokir koneksi Node.js ke Supabase (`SELF_SIGNED_CERT_IN_CHAIN`).

**Solusi:** Script `npm run dev` sudah otomatis mengaktifkan bypass SSL untuk development. **Wajib restart** dev server:

```bash
# Tekan Ctrl+C untuk stop server yang sedang jalan, lalu:
npm run dev
```

> Jangan jalankan `next dev` langsung — harus lewat `npm run dev`.
> Bypass SSL **hanya** aktif di development, tidak mempengaruhi deploy Vercel.

### Form submit gagal

**Penyebab:** RLS policy belum benar atau tabel belum dibuat.

**Solusi:** Jalankan ulang SQL migration di Supabase SQL Editor. Cek policy di Table Editor.

### Feed kosong padahal sudah submit

**Penyebab:** Env variables salah atau koneksi Supabase gagal.

**Solusi:** Cek browser console dan Vercel Function logs. Verifikasi URL dan anon key.

### Like tidak bertambah

**Penyebab:** Policy UPDATE belum dibuat.

**Solusi:** Jalankan bagian policy "Public update likes" dari migration SQL.

### Tampilan rusak di Safari iOS

**Penyebab:** Cache browser lama.

**Solusi:** Hard refresh atau clear cache. Aplikasi sudah menggunakan `-webkit-` prefixes dan `safe-area-inset`.

---

## Palet Warna Tema

| Nama | Hex | Penggunaan |
|------|-----|------------|
| Forest Green | `#1B4332` | Primary, header, tombol |
| Forest Light | `#2D6A4F` | Hover, gradient |
| Meranti Wood | `#8B5E3C` | Secondary, aksen kayu |
| Hilltop Gold | `#C9A227` | Accent, highlight |
| Sage Cream | `#F5F7F0` | Background |
| Mist | `#E8EDE3` | Border, divider |
| Sky Blue | `#4A90A4` | Link, gradient |

---

## Kontak & Dukungan

Platform ini dibuat untuk warga Cluster **Bukit Meranti**, Citra Indah City Jonggol.

- **Lokasi cluster:** [Google Maps Bukit Meranti](https://maps.app.goo.gl/snKgxQBd51bDVZ3u6)
- **Info resmi cluster:** [citraindah.com/bukit-meranti](https://citraindah.com/bukit-meranti-citraindahcityjonggol/)

> Platform ini dibuat oleh warga untuk warga. Bukan situs resmi PT Ciputra Indah.
