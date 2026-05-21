"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/lib/auth/actions";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const NAV: NavItem[] = [
  {
    href: "/dashboard",
    label: "Tableau de bord",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
  {
    href: "/dashboard/evenements",
    label: "Événements",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 9h18M8 3v4M16 3v4" />
      </svg>
    ),
  },
  {
    href: "/dashboard/galerie",
    label: "Galerie",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
  },
  {
    href: "/dashboard/dons",
    label: "Dons",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/utilisateurs",
    label: "Bénévoles",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6" />
        <circle cx="17" cy="8" r="2.5" />
        <path d="M16 14c3 0 6 1.5 6 5" />
      </svg>
    ),
  },
];

export function Sidebar({ user }: { user: { email?: string } }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Bouton hamburger mobile */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-30 inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-parchment text-ink lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
          <path d="M4 7h16M4 12h16M4 17h12" />
        </svg>
      </button>

      {/* Voile semi-transparent mobile */}
      {mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-ink/40 backdrop-blur-sm lg:hidden"
          aria-label="Fermer le menu"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-line bg-parchment transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-start gap-3 px-7 pt-8 pb-6 border-b border-line">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gold via-gold-deep to-ink font-display text-xl italic text-cream shadow-sm">
            D
          </span>
          <div className="leading-tight">
            <p className="font-display text-lg italic text-ink">
              La Maison de David
            </p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-deep">
              Espace bénévole
            </p>
          </div>
          {/* Bouton fermer (mobile) */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full text-ink-soft lg:hidden"
            aria-label="Fermer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-deep">
            Pilotage
          </p>
          <ul className="space-y-1">
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${
                      active
                        ? "bg-gold/10 text-ink"
                        : "text-ink-soft hover:bg-cream hover:text-ink"
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-gold-deep" />
                    )}
                    <span className={active ? "text-gold-deep" : "text-ink-soft/70"}>
                      {item.icon}
                    </span>
                    <span className={active ? "font-semibold" : ""}>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <p className="mt-8 px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-deep">
            Site public
          </p>
          <a
            href="https://site-live-rouge.vercel.app"
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-ink-soft transition hover:bg-cream hover:text-ink"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
              <path d="M14 4h6v6M20 4L10 14M6 4h-2a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-2" />
            </svg>
            Voir le site
          </a>
        </nav>

        {/* User card */}
        <div className="border-t border-line p-4">
          <div className="rounded-md bg-cream/60 p-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink font-semibold text-cream text-xs uppercase">
                {(user.email ?? "?").slice(0, 1)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-semibold uppercase tracking-widest text-gold-deep">
                  Connecté
                </p>
                <p className="truncate text-xs text-ink">{user.email ?? "—"}</p>
              </div>
            </div>
            <form action={signOut} className="mt-3">
              <button
                type="submit"
                className="w-full rounded-md border border-line bg-parchment px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-soft transition hover:border-burgundy/40 hover:text-burgundy"
              >
                Se déconnecter
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
