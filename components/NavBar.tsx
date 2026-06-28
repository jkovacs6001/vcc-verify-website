"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";

interface NavBarProps {
  isAuthenticated: boolean;
  hasActiveApplication: boolean;
}

export const NavBar: React.FC<NavBarProps> = ({ isAuthenticated, hasActiveApplication }) => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/directory", label: "Directory" },
    { href: "/projects", label: "Projects" },
    { href: "/blacklist", label: "Blacklist" },
    { href: "/report", label: "Report Scam" },
    { href: "/member", label: isAuthenticated ? "My Dashboard" : "Login" },
    ...(!hasActiveApplication ? [{ href: "/apply", label: "Apply" }] : []),
  ];

  return (
    <header className="w-full border-b border-blistBorder bg-black/90 backdrop-blur z-50 relative">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="relative h-8 w-8">
            <Image
              src="/blist_logo.png"
              alt="Blacklist"
              fill
              sizes="32px"
              priority
              className="object-contain"
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-white">Blacklist</span>
            <span className="text-[11px] text-blistTextMuted hidden sm:block">Verified. Trusted. Protected.</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm flex-wrap">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "px-3 py-1.5 rounded-full transition-colors whitespace-nowrap " +
                  (active
                    ? "bg-gradient-to-r from-blistAccent to-blistAccentSoft text-black shadow-blistGlow"
                    : "text-blistTextMuted hover:text-white hover:bg-white/5")
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* Desktop create account */}
          {!isAuthenticated && (
            <Link
              href="/register"
              className="hidden md:inline-flex items-center justify-center rounded-full bg-blistAccent px-4 py-2 text-sm font-medium text-black shadow-blistGlow hover:bg-blistAccentSoft transition-colors whitespace-nowrap"
            >
              Create Account
            </Link>
          )}

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-xl border border-blistBorder bg-white/5 hover:bg-white/10 transition-colors gap-1.5"
            aria-label="Toggle menu"
          >
            <span className={`block w-5 h-0.5 bg-white transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-white transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-blistBorder bg-black/95 backdrop-blur">
          <nav className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    "px-4 py-3 rounded-xl text-sm font-medium transition-colors " +
                    (active
                      ? "bg-blistAccent/20 text-white border border-blistAccent/40"
                      : "text-blistTextMuted hover:text-white hover:bg-white/5")
                  }
                >
                  {item.label}
                </Link>
              );
            })}
            {!isAuthenticated && (
              <Link
                href="/register"
                className="mt-2 px-4 py-3 rounded-xl text-sm font-medium text-center bg-blistAccent text-black shadow-blistGlow hover:bg-blistAccentSoft transition-colors"
              >
                Create Account
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
