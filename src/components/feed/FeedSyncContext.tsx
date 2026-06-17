"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  type ReactNode,
} from "react";
import type { Aspiration } from "@/types/aspiration";

interface FeedSyncContextValue {
  notifyNewAspiration: (item: Aspiration) => void;
  subscribeToNewAspirations: (
    listener: (item: Aspiration) => void,
  ) => () => void;
}

const FeedSyncContext = createContext<FeedSyncContextValue | null>(null);

export function FeedSyncProvider({ children }: { children: ReactNode }) {
  const listenersRef = useRef(new Set<(item: Aspiration) => void>());

  const notifyNewAspiration = useCallback((item: Aspiration) => {
    for (const listener of listenersRef.current) {
      listener(item);
    }
  }, []);

  const subscribeToNewAspirations = useCallback(
    (listener: (item: Aspiration) => void) => {
      listenersRef.current.add(listener);
      return () => {
        listenersRef.current.delete(listener);
      };
    },
    [],
  );

  return (
    <FeedSyncContext.Provider
      value={{ notifyNewAspiration, subscribeToNewAspirations }}
    >
      {children}
    </FeedSyncContext.Provider>
  );
}

export function useFeedSync() {
  const context = useContext(FeedSyncContext);
  if (!context) {
    throw new Error("useFeedSync must be used within FeedSyncProvider");
  }
  return context;
}
