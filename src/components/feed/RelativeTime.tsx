"use client";

import { useEffect, useState } from "react";
import { formatRelativeTime } from "@/lib/utils";

interface RelativeTimeProps {
  dateTime: string;
  className?: string;
}

export function RelativeTime({ dateTime, className }: RelativeTimeProps) {
  const [label, setLabel] = useState(() => formatRelativeTime(dateTime));

  useEffect(() => {
    const tick = () => setLabel(formatRelativeTime(dateTime));
    const interval = window.setInterval(tick, 60_000);

    return () => window.clearInterval(interval);
  }, [dateTime]);

  return (
    <time dateTime={dateTime} className={className} suppressHydrationWarning>
      {label}
    </time>
  );
}
