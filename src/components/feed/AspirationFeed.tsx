import { AspirationCard } from "@/components/feed/AspirationCard";
import { getAspirations } from "@/lib/actions";
import { MessageSquareHeart, RefreshCw } from "lucide-react";

export async function AspirationFeed() {
  const aspirations = await getAspirations();

  return (
    <section id="feed" className="scroll-mt-24">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-meranti-forest sm:text-2xl">
            Feed Aspirasi Warga
          </h2>
          <p className="mt-1 text-sm text-meranti-forest/60">
            Lihat saran dan aspirasi dari warga lainnya
          </p>
        </div>
        <div className="hidden items-center gap-1.5 rounded-full bg-meranti-sage px-3 py-1.5 text-xs font-medium text-meranti-forest/70 sm:flex">
          <RefreshCw className="h-3.5 w-3.5" />
          Diperbarui otomatis
        </div>
      </div>

      {aspirations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-meranti-mist bg-white/60 px-6 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-meranti-sage">
            <MessageSquareHeart className="h-8 w-8 text-meranti-forest/40" />
          </div>
          <h3 className="font-heading text-lg font-semibold text-meranti-forest">
            Belum ada aspirasi
          </h3>
          <p className="mt-2 max-w-sm text-sm text-meranti-forest/60">
            Jadilah yang pertama menyampaikan saran atau aspirasi untuk
            lingkungan Bukit Meranti yang lebih baik!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {aspirations.map((aspiration, index) => (
            <AspirationCard
              key={aspiration.id}
              aspiration={aspiration}
              index={index}
            />
          ))}
        </div>
      )}
    </section>
  );
}
