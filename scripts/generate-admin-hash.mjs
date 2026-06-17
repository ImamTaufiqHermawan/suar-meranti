#!/usr/bin/env node
/**
 * Generate bcrypt hash + SQL untuk seed admin.
 * Usage:
 *   node scripts/generate-admin-hash.mjs admin.meranti "PasswordAnda"
 *
 * JANGAN commit password plaintext — jalankan script ini di mesin lokal,
 * lalu paste hasil SQL ke Supabase SQL Editor.
 */
import bcrypt from "bcryptjs";

const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
  console.error(
    "Usage: node scripts/generate-admin-hash.mjs <username> <password>",
  );
  process.exit(1);
}

const hash = await bcrypt.hash(password, 10);

console.log("-- Paste ke Supabase SQL Editor (jangan commit password ini)\n");
console.log(`INSERT INTO public.admins (username, password_hash)
VALUES (
  '${username.replace(/'/g, "''")}',
  '${hash}'
)
ON CONFLICT (username) DO UPDATE
  SET password_hash = EXCLUDED.password_hash;`);
