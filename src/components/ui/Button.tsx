import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const variants = {
      primary:
        "bg-meranti-forest text-white hover:bg-meranti-forest-light shadow-md shadow-meranti-forest/20",
      secondary:
        "bg-meranti-wood text-white hover:bg-meranti-wood/90 shadow-md shadow-meranti-wood/20",
      ghost: "bg-transparent text-meranti-forest hover:bg-meranti-mist",
      outline:
        "border-2 border-meranti-forest/20 bg-white text-meranti-forest hover:border-meranti-forest/40 hover:bg-meranti-sage",
    };

    const sizes = {
      sm: "h-9 px-4 text-sm rounded-xl",
      md: "h-11 px-6 text-sm rounded-2xl",
      lg: "h-13 px-8 text-base rounded-2xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 font-semibold transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-meranti-gold focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "active:scale-[0.98]",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Memproses...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
