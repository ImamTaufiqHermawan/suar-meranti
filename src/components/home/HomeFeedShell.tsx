"use client";

import { FeedSyncProvider } from "@/components/feed/FeedSyncContext";
import type { ReactNode } from "react";

export function HomeFeedShell({ children }: { children: ReactNode }) {
  return <FeedSyncProvider>{children}</FeedSyncProvider>;
}
