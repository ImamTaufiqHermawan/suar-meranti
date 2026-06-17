"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X, MapPin } from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CLUSTER_MAPS_URL } from "@/lib/constants";

const NAV_LINKS = [
  { href: "#kirim-aspirasi", label: "Kirim Aspirasi" },
  { href: "#feed", label: "Feed Warga" },
];

interface HeaderProps {
  adminSlot?: ReactNode;
}

export function Header({ adminSlot }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-meranti-mist/80 bg-white/90 backdrop-blur-lg supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:h-[4.5rem] sm:px-6">
        <Link href="/" className="flex cursor-pointer items-center gap-2.5">
          <Image
            src="/logo.svg"
            alt="SuarMeranti Logo"
            width={40}
            height={40}
            className="h-9 w-9 sm:h-10 sm:w-10"
            priority
          />
          <div className="flex flex-col">
            <span className="font-heading text-base font-bold leading-tight text-meranti-forest sm:text-lg">
              SuarMeranti
            </span>
            <span className="hidden text-[10px] font-medium text-meranti-forest/50 sm:block">
              Bukit Meranti · Citra Indah City
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="cursor-pointer rounded-xl px-4 py-2 text-sm font-medium text-meranti-forest/70 transition-colors hover:bg-meranti-sage hover:text-meranti-forest"
            >
              {link.label}
            </a>
          ))}
          <a
            href={CLUSTER_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-xl bg-meranti-forest px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-meranti-forest-light"
          >
            <MapPin className="h-4 w-4" />
            Lokasi
          </a>
          {adminSlot}
        </nav>

        <button
          type="button"
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-meranti-forest md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-meranti-mist bg-white transition-all duration-300 md:hidden",
          menuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0 border-t-0",
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="min-h-[44px] cursor-pointer rounded-xl px-4 py-3 text-sm font-medium text-meranti-forest/70 transition-colors hover:bg-meranti-sage"
            >
              {link.label}
            </a>
          ))}
          <a
            href={CLUSTER_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-meranti-sky"
          >
            <MapPin className="h-4 w-4" />
            Lihat Lokasi Cluster
          </a>
          {adminSlot && <div className="px-4 py-2">{adminSlot}</div>}
        </nav>
      </div>
    </header>
  );
}
