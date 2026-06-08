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
    <header className="w-full border-b border-vampBorder bg-black/90 backdrop-blur z-50 relative">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="relative h-8 w-8 overflow-hidden rounded-full shadow-vampGlow ring-1 ring-vampAccent/40">
            <Image
              src="/vampcat_avatar.png"
              alt="VampCat"
              fill
              sizes="32px"
              priority
              className="object-cover object-center"
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-white">VampCatCoin Verification</span>
            <span className="text-[11px] text-vampTextMuted hidden sm:block">Trusted Web3 professionals</span>
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
                    ? "bg-gradient-to-r from-vampAccent to-vampAccentSoft text-white shadow-vampGlow"
                    : "text-vampTextMuted hover:text-white hover:bg-white/5")
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
              className="hidden md:inline-flex items-center justify-center rounded-full bg-vampAccent px-4 py-2 text-sm font-medium text-white shadow-vampGlow hover:bg-vampAccentSoft transition-colors whitespace-nowrap"
            >
              Create Account
            </Link>
          )}

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-xl border border-vampBorder bg-white/5 hover:bg-white/10 transition-colors gap-1.5"
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
        <div className="md:hidden border-t border-vampBorder bg-black/95 backdrop-blur">
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
                      ? "bg-vampAccent/20 text-white border border-vampAccent/40"
                      : "text-vampTextMuted hover:text-white hover:bg-white/5")
                  }
                >
                  {item.label}
                </Link>
              );
            })}
            {!isAuthenticated && (
              <Link
                href="/register"
                className="mt-2 px-4 py-3 rounded-xl text-sm font-medium text-center bg-vampAccent text-white shadow-vampGlow hover:bg-vampAccentSoft transition-colors"
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
