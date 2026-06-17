import { MapPin, Trees, Shield } from "lucide-react";
import { CLUSTER_ADDRESS, CLUSTER_MAPS_URL } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-meranti-mist bg-meranti-forest text-white">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h3 className="font-heading text-lg font-bold">SuarMeranti</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              Platform aspirasi warga Cluster Bukit Meranti, Citra Indah City
              Jonggol. Suara Warga, Harmoni Komunitas.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-meranti-gold">
              Cluster Bukit Meranti
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-meranti-gold" />
                <span>{CLUSTER_ADDRESS}</span>
              </li>
              <li className="flex items-start gap-2">
                <Trees className="mt-0.5 h-4 w-4 shrink-0 text-meranti-gold" />
                <span>
                  RE Silver — Dataran tinggi dengan pemandangan perbukitan
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-meranti-gold" />
                <span>One-gate security system 24 jam</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-meranti-gold">
              Tautan
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  href={CLUSTER_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer text-white/70 transition-colors hover:text-white"
                >
                  Google Maps Bukit Meranti
                </a>
              </li>
              <li>
                <a
                  href="https://citraindah.com/bukit-meranti-citraindahcityjonggol/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer text-white/70 transition-colors hover:text-white"
                >
                  Info Cluster di CitraIndah.com
                </a>
              </li>
              <li>
                <a
                  href="#kirim-aspirasi"
                  className="cursor-pointer text-white/70 transition-colors hover:text-white"
                >
                  Kirim Aspirasi
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-white/50">
          <p suppressHydrationWarning>
            © {new Date().getFullYear()} SuarMeranti — Kotak Saran & Aspirasi
            Warga Bukit Meranti
          </p>
          <p className="mt-1">
            Platform ini dibuat oleh warga untuk warga. Bukan situs resmi PT
            Ciputra Indah.
          </p>
        </div>
      </div>
    </footer>
  );
}
