"use client";

import Link from "next/link";

export default function Page() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#0f1110] px-6">
      <section className="w-full max-w-md rounded-2xl border border-white/15 bg-white/5 p-8 text-center backdrop-blur-xl">
        <h1 className="mb-3 text-2xl font-bold text-white">Forgot Password</h1>
        <p className="mb-6 text-sm text-gray-300">
          Silakan hubungi admin untuk reset password manual sementara.
        </p>
        <Link
          href="/login"
          className="inline-flex rounded-xl bg-[#DAEBCE] px-5 py-2.5 text-sm font-semibold text-[#0a0a0a]"
        >
          Kembali ke Login
        </Link>
      </section>
    </main>
  );
}
