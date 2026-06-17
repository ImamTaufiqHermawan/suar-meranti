# SuarMeranti

**Kotak Saran & Aspirasi Warga — Cluster Bukit Meranti, Citra Indah City Jonggol**

> *Suara Warga, Harmoni Komunitas*

Platform web responsif untuk warga Cluster Bukit Meranti menyampaikan saran, aspirasi, keluhan, dan pujian — dengan feed publik yang bisa dilihat semua warga.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=flat-square&logo=supabase)

---

## Fitur

- **Rich text editor** — tebal, miring, garis bawah, daftar, tautan
- **Kirim aspirasi** — dengan opsi anonim atau tampilkan nama & alamat rumah
- **Feed publik** — semua posting langsung tampil (tanpa moderasi)
- **Like per perangkat** — 1 suka per posting per device (visitor ID)
- **Admin login/logout** — hapus posting tidak pantas
- **4 kategori** — Saran, Aspirasi, Keluhan, Pujian
- **100% responsif** — mobile, tablet, laptop/PC
- **Cross-browser** — Chrome, Firefox, Safari (Android & iOS)
- **Tema Bukit Meranti** — warna alam perbukitan, hijau hutan, kayu Meranti

---

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/USERNAME/suar-meranti.git
cd suar-meranti
npm install
```

### 2. Setup environment

```bash
cp .env.example .env.local
```

Isi `.env.local` dengan kredensial Supabase (lihat [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)).

### 3. Setup database

Jalankan SQL di Supabase SQL Editor (berurutan):

```
supabase/migrations/001_init.sql
supabase/migrations/002_admin_likes_richtext.sql
supabase/migrations/003_fix_admin_bcrypt.sql
```

Buat akun admin (password **tidak** disimpan di git):

```bash
node scripts/generate-admin-hash.mjs admin.meranti "PasswordKuatAnda"
# → paste output SQL ke Supabase SQL Editor
```

Contoh isi aspirasi untuk testing: [`docs/CONTOH_TEMPLATE_ASPIRASI.md`](docs/CONTOH_TEMPLATE_ASPIRASI.md)

### 4. Jalankan

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

---

## Scripts

| Command | Deskripsi |
|---------|-----------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Jalankan production build |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript check |

---

## Struktur Proyek

```
src/
├── app/                  # Next.js App Router (pages, layout, API)
├── components/
│   ├── feed/             # Feed & card posting
│   ├── form/             # Form kirim aspirasi
│   ├── layout/           # Header, Footer, Hero
│   └── ui/               # Button, Input, Card, dll
├── lib/
│   ├── actions.ts        # Server Actions (submit, like, fetch)
│   ├── supabase/         # Supabase client
│   └── validators.ts     # Zod schemas
└── types/                # TypeScript types
```

---

## Deploy

Panduan lengkap deploy ke Vercel: **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**

Ringkasan:
1. Push ke GitHub repo `suar-meranti`
2. Setup Supabase + jalankan migration
3. Import ke Vercel + set env variables
4. Deploy otomatis setiap push ke `main`

---

## Tema Warna

| Token | Hex | Makna |
|-------|-----|-------|
| Forest Green | `#1B4332` | Nuansa alam, perbukitan |
| Meranti Wood | `#8B5E3C` | Nama cluster, kayu tropis |
| Hilltop Gold | `#C9A227` | RE Silver, premium terjangkau |
| Sage Cream | `#F5F7F0` | Background bersih |
| Sky Blue | `#4A90A4` | Pemandangan dataran tinggi |

---

## Lisensi

Proyek ini dibuat untuk komunitas warga Cluster Bukit Meranti.

Bukan produk resmi PT Ciputra Indah.
