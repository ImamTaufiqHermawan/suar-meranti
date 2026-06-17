/**
 * Dev-only: bypass SSL verification untuk jaringan dengan proxy kantor/antivirus.
 * Aktif otomatis saat `npm run dev` (lihat script di package.json).
 */
if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}
