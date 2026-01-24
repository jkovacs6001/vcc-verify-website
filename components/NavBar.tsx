"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface NavBarProps {
  isAuthenticated: boolean;
}

export const NavBar: React.FC<NavBarProps> = ({ isAuthenticated }) => {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/directory", label: "Directory" },
    { href: "/member", label: "My Dashboard" },
    { href: "/apply", label: "Apply" },
  ];

  return (
    <header className="w-full border-b border-vampBorder bg-black/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 cursor-paw-pointer">
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
            <span className="text-sm font-semibold text-white">
              VampCatCoin Verification
            </span>
            <span className="text-[11px] text-vampTextMuted">
              Trusted Web3 professionals
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  "px-3 py-1.5 rounded-full cursor-paw-pointer transition-colors " +
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

        {!isAuthenticated && (
          <Link
            href="/register"
            className="hidden sm:inline-flex items-center justify-center rounded-full bg-vampAccent px-4 py-2 text-sm font-medium text-white shadow-vampGlow hover:bg-vampAccentSoft transition-colors"
          >
            Create Account
          </Link>
        )}
      </div>
    </header>
  );
};

