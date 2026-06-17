import { cn } from "@/lib/utils";
import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "glass";
}

export function Card({
  className,
  variant = "default",
  children,
  ...props
}: CardProps) {
  const variants = {
    default: "bg-white border border-meranti-mist shadow-sm",
    elevated:
      "bg-white border border-meranti-mist/80 shadow-lg shadow-meranti-forest/5",
    glass: "bg-white/80 backdrop-blur-md border border-white/60 shadow-lg",
  };

  return (
    <div
      className={cn("rounded-3xl p-5 sm:p-6", variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}
