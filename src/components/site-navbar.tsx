"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { href: "/dashboard", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

type SiteNavbarProps = {
  username?: string;
};

export function SiteNavbar({ username = "Fauzancomellll" }: SiteNavbarProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed left-1/2 top-3 z-50 w-[96%] max-w-7xl -translate-x-1/2 sm:top-5 sm:w-[94%]">
      <div className="absolute inset-0 rounded-full bg-linear-to-r from-[#DAEBCE]/20 via-blue-200/15 to-[#a896a4]/20 blur-xl" />

      <div className="relative flex items-center justify-between rounded-full border border-white/25 bg-white/12 px-2.5 py-2 text-white shadow-2xl backdrop-blur-xl sm:px-6 md:px-8 md:py-3">
        <Link href="/dashboard" className="flex items-center gap-2 sm:gap-3">
          <div className="rounded-full bg-white p-1.5 shadow-lg">
            <Image
              src="/images/reference/logo-parakelana.png"
              alt="Parakelana"
              width={30}
              height={30}
              className="h-6 w-6 rounded-full object-contain sm:h-7 sm:w-7"
              priority
            />
          </div>
          <span className="hidden bg-linear-to-r from-white to-[#DAEBCE] bg-clip-text text-sm font-bold tracking-wide text-transparent md:inline">
            PARAKELANA ADVENTURE
          </span>
        </Link>

        <div className="flex items-center gap-0.5 text-[11px] font-semibold sm:gap-2 sm:text-sm">
          {menuItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href === "/dashboard" && pathname === "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-2 py-1.5 transition-all duration-300 sm:px-4 sm:py-2 ${
                  active
                    ? "bg-white/20 text-white shadow-md"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-1.5 py-1.5 sm:gap-2 sm:px-3">
          <span className="hidden text-sm font-semibold uppercase text-slate-100 lg:inline">
            {username}
          </span>
          <div className="grid h-8 w-8 place-items-center rounded-full bg-linear-to-br from-[#DAEBCE] to-[#a896a4] text-xs font-bold text-[#101215]">
            {username.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </nav>
  );
}
