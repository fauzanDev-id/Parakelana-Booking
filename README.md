# Parakelana Adventure Booking

Setup awal aplikasi booking online menggunakan Next.js dan Supabase.

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Supabase JavaScript SDK

## Menjalankan Project

1. Install dependency:

```bash
npm install
```

2. Buat file environment lokal:

```bash
cp .env.example .env.local
```

3. Isi kredensial Supabase di `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

4. Jalankan development server:

```bash
npm run dev
```

5. Buka `http://localhost:3000`.

## Struktur Awal Supabase

- `src/lib/supabase/client.ts`: helper untuk client-side.
- `src/lib/supabase/server.ts`: helper untuk server-side.
- `src/lib/supabase/config.ts`: validasi env Supabase.

## Next Step yang Disarankan

- Integrasi auth (email/password atau OAuth).
- Setup tabel awal: `trips`, `bookings`, `profiles`, `payments`.
- Implementasi halaman katalog trip, detail trip, checkout, dan dashboard booking.



okee
 test git
