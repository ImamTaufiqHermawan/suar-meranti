"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface FeedCountContextValue {
  count: number;
  hasMore: boolean;
  setCount: (count: number) => void;
  setHasMore: (hasMore: boolean) => void;
}

const FeedCountContext = createContext<FeedCountContextValue | null>(null);

interface FeedCountProviderProps {
  children: ReactNode;
  initialCount: number;
  initialHasMore: boolean;
}

export function FeedCountProvider({
  children,
  initialCount,
  initialHasMore,
}: FeedCountProviderProps) {
  const [count, setCount] = useState(initialCount);
  const [hasMore, setHasMore] = useState(initialHasMore);

  return (
    <FeedCountContext.Provider
      value={{ count, hasMore, setCount, setHasMore }}
    >
      {children}
    </FeedCountContext.Provider>
  );
}

export function useFeedCount() {
  const context = useContext(FeedCountContext);
  if (!context) {
    throw new Error("useFeedCount must be used within FeedCountProvider");
  }
  return context;
}

export function FeedCountLabel() {
  const { count, hasMore } = useFeedCount();

  if (count === 0) {
    return null;
  }

  return (
    <p className="text-xs font-medium text-meranti-forest/50 sm:text-sm">
      Menampilkan {count}
      {hasMore ? "+" : ""} aspirasi
    </p>
  );
}
