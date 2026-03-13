const emptyBlocks = [
  {
    title: "Rental Gear",
    description:
      "Belum ada item rental yang dipublikasikan. Admin akan menambahkan produk melalui panel admin.",
  },
  {
    title: "Open Trip",
    description:
      "Belum ada trip aktif untuk ditampilkan. Silakan tunggu update jadwal dari admin.",
  },
  {
    title: "Promo",
    description:
      "Belum ada promo berjalan saat ini. Penawaran khusus akan muncul setelah admin mengatur campaign.",
  },
];

export default function DashboardPage() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat text-slate-100"
      style={{
        backgroundImage:
          "linear-gradient(to bottom, rgba(6, 10, 14, 0.72), rgba(5, 8, 12, 0.9)), url('/images/dashboard-bg.jpg')",
        backgroundColor: "#090b10",
      }}
    >
      <main className="mx-auto flex w-full max-w-6xl flex-col px-5 pb-14 pt-6 sm:px-8 lg:px-12">
        <header className="rounded-full border border-white/15 bg-white/10 p-2 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 rounded-full bg-slate-900/60 px-4 py-3 sm:px-6">
            <div className="text-sm font-bold tracking-wide text-lime-100 sm:text-base">
              PARAKELANA ADVENTURE
            </div>
            <nav className="hidden items-center gap-3 text-sm text-slate-300 md:flex">
              <span className="rounded-full bg-white/20 px-4 py-2 font-semibold text-white">
                Dashboard
              </span>
              <span className="px-3">About</span>
              <span className="px-3">Contact</span>
            </nav>
            <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-slate-100 sm:text-sm">
              USER
            </div>
          </div>
        </header>

        <section className="mt-10">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/90">
            Main Menu
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
            Dashboard Parakelana
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            Dashboard saat ini sengaja dikosongkan untuk data produk. Semua item
            akan diinput oleh role admin dari panel terpisah, lalu otomatis tampil
            di halaman ini.
          </p>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {emptyBlocks.map((block) => (
            <article
              key={block.title}
              className="rounded-3xl border border-white/12 bg-white/7 p-5 backdrop-blur-sm"
            >
              <div className="inline-flex rounded-full border border-white/20 bg-black/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                Empty State
              </div>
              <h2 className="mt-4 text-xl font-semibold text-white">{block.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {block.description}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-8 rounded-3xl border border-amber-200/35 bg-amber-200/10 p-5 text-amber-100 sm:p-6">
          <h3 className="text-lg font-semibold">Status integrasi data</h3>
          <p className="mt-2 text-sm leading-6 text-amber-50/90">
            Menunggu endpoint data produk dari admin. Setelah struktur tabel dan
            publish produk aktif, dashboard ini siap dihubungkan ke Supabase.
          </p>
        </section>
      </main>
    </div>
  );
}
