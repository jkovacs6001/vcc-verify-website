"use client";

<<<<<<< HEAD
import Image from "next/image";
=======
>>>>>>> af47a14e4f777a0db58a7c03dec0e44b038d35cd
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/directory", label: "Directory" },
  { href: "/apply", label: "Apply" },
];

export const NavBar: React.FC = () => {
  const pathname = usePathname();

  return (
    <header className="w-full border-b border-vampBorder bg-black/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 cursor-paw-pointer">
<<<<<<< HEAD
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
=======
          <div className="h-8 w-8 rounded-2xl bg-vampAccent flex items-center justify-center shadow-vampGlow">
            <span className="text-xs font-black text-white">VCC</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-white">
              VCC Verification
>>>>>>> af47a14e4f777a0db58a7c03dec0e44b038d35cd
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
      </div>
    </header>
  );
};

