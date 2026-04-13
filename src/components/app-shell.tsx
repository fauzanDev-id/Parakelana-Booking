"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/legacy/components/Navbar";
import { useAuth } from "@/legacy/context/AuthContext";

const HIDE_NAVBAR_ROUTES = new Set([
  "/",
  "/login",
  "/register",
  "/profile",
  "/booking",
  "/open-trip-booking",
  "/admin",
  "/edit-profile",
  "/checkout",
]);

const PUBLIC_ROUTES = new Set(["/", "/login", "/register"]);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { isGuest, isAuthenticated, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated && !isGuest && !isAdmin && !PUBLIC_ROUTES.has(pathname)) {
      router.replace("/");
      return;
    }

    if (isAdmin && pathname !== "/admin" && !PUBLIC_ROUTES.has(pathname)) {
      router.replace("/admin");
      return;
    }

    if (!isAdmin && pathname === "/admin") {
      router.replace(isAuthenticated ? "/dashboard" : "/");
      return;
    }

    if (isAdmin && PUBLIC_ROUTES.has(pathname)) {
      router.replace("/admin");
      return;
    }

    if (isAuthenticated && PUBLIC_ROUTES.has(pathname)) {
      router.replace("/dashboard");
    }
  }, [loading, isAuthenticated, isGuest, isAdmin, pathname, router]);

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0f0f0f 100%)" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage: "url(/images/legacy/BG_PARAKELANA.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      />
      {!HIDE_NAVBAR_ROUTES.has(pathname) && <Navbar username="" />}
      {children}
    </div>
  );
}
