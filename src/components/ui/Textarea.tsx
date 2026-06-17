import { cn } from "@/lib/utils";
import { type TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  showCount?: boolean;
  maxLength?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      showCount = false,
      maxLength = 2000,
      id,
      value,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const charCount = typeof value === "string" ? value.length : 0;

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
        <textarea
          ref={ref}
          id={inputId}
          maxLength={maxLength}
          value={value}
          className={cn(
            "min-h-[140px] w-full resize-y rounded-2xl border-2 border-meranti-mist bg-white px-4 py-3 text-sm text-meranti-forest",
            "placeholder:text-meranti-forest/40",
            "transition-colors duration-200",
            "focus:border-meranti-forest/30 focus:outline-none focus:ring-2 focus:ring-meranti-gold/30",
            error && "border-red-300 focus:border-red-400 focus:ring-red-200",
            className,
          )}
          {...props}
        />
        <div className="flex items-center justify-between">
          {error ? (
            <p className="text-xs text-red-600">{error}</p>
          ) : (
            <span />
          )}
          {showCount && (
            <p
              className={cn(
                "text-xs text-meranti-forest/50",
                charCount > maxLength * 0.9 && "text-amber-600",
              )}
            >
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export { Textarea };
