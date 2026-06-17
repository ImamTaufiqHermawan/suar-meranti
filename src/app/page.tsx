import { Suspense } from "react";
import { Hero } from "@/components/layout/Hero";
import { SubmitForm } from "@/components/form/SubmitForm";
import { AspirationFeed } from "@/components/feed/AspirationFeed";
import { FeedSkeleton } from "@/components/ui/Skeleton";
import { parseFeedCategory } from "@/lib/feed-validators";

export const dynamic = "force-dynamic";

interface HomeProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const search = params.q?.trim() ?? "";
  const category = parseFeedCategory(params.category);

  return (
    <>
      <Hero />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-col gap-10 lg:gap-14">
          <SubmitForm />

          <Suspense fallback={<FeedSkeleton />}>
            <AspirationFeed search={search} category={category} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
