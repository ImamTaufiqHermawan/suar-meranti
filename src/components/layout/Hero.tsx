"use client";

import { Button } from "@/components/ui/Button";
import { ChevronDown, Mountain, Trees } from "lucide-react";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="hero-gradient absolute inset-0" />
      <div className="hero-pattern absolute inset-0 opacity-30" />

      <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="flex flex-col items-center text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm sm:text-sm">
            <Trees className="h-4 w-4" />
            Cluster Bukit Meranti · RE Silver
          </div>

          <h1 className="font-heading text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Suar<span className="text-meranti-gold">Meranti</span>
          </h1>

          <p className="mt-2 text-lg font-medium text-white/90 sm:text-xl">
            Kotak Saran & Aspirasi Warga
          </p>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
            Sampaikan ide, keluhan, dan apresiasi Anda untuk membangun
            lingkungan Cluster Bukit Meranti, Citra Indah City Jonggol yang
            lebih harmonis.
          </p>

          <div className="mt-6 flex items-center gap-2 text-sm text-white/60">
            <Mountain className="h-4 w-4" />
            <span>Suara Warga, Harmoni Komunitas</span>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#kirim-aspirasi" className="cursor-pointer">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Kirim Aspirasi
              </Button>
            </a>
            <a href="#feed" className="cursor-pointer">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-white/30 bg-white/10 text-white hover:border-white/50 hover:bg-white/20 sm:w-auto"
              >
                Lihat Feed Warga
              </Button>
            </a>
          </div>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="mt-12"
          >
            <a
              href="#kirim-aspirasi"
              aria-label="Scroll ke form"
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/30 text-white/60 transition-colors hover:text-white"
            >
              <ChevronDown className="h-5 w-5" />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
