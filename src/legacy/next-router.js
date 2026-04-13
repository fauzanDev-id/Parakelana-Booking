"use client";

import React from "react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";

const STORAGE_PREFIX = "parakelana:navstate:";

function normalizePath(to) {
  if (!to) return "/";
  if (typeof to !== "string") return String(to);
  if (to.startsWith("http://") || to.startsWith("https://")) return to;
  return to.startsWith("/") ? to : `/${to}`;
}

function saveState(path, state) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(`${STORAGE_PREFIX}${path}`, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

function readState(path) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(`${STORAGE_PREFIX}${path}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function Link({ to, state, onClick, ...props }) {
  const href = normalizePath(to);

  const handleClick = (event) => {
    if (state !== undefined) saveState(href, state);
    if (onClick) onClick(event);
  };

  return <NextLink href={href} onClick={handleClick} {...props} />;
}

export function useNavigate() {
  const router = useRouter();

  return React.useCallback(
    (to, options = {}) => {
      const href = normalizePath(to);
      if (options?.state !== undefined) saveState(href, options.state);

      if (options?.replace) {
        router.replace(href);
        return;
      }

      router.push(href);
    },
    [router],
  );
}

export function useLocation() {
  const pathname = usePathname() || "/";
  const key = pathname;
  const state = React.useMemo(() => readState(pathname), [pathname, key]);

  return { pathname, key, state };
}

// Compatibility stubs so legacy App.jsx still compiles if imported.
export function BrowserRouter({ children }) {
  return <>{children}</>;
}

export function Routes({ children }) {
  return <>{children}</>;
}

export function Route() {
  return null;
}
