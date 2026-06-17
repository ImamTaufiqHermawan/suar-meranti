import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-meranti-forest"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "min-h-[44px] w-full rounded-2xl border-2 border-meranti-mist bg-white px-4 py-3 text-sm text-meranti-forest",
            "placeholder:text-meranti-forest/40",
            "transition-colors duration-200",
            "focus:border-meranti-forest/30 focus:outline-none focus:ring-2 focus:ring-meranti-gold/30",
            error && "border-red-300 focus:border-red-400 focus:ring-red-200",
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
