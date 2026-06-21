import { useId, type ComponentProps } from "react"
import { cn } from "@/lib/utils"

export interface FloatingInputProps extends ComponentProps<"input"> {
  label: string;
}

/**
 * A specialized Input component with a "Floating Label" effect.
 * Primarily designed for Auth screens (Login, Register) where horizontal space is plentiful
 * and a premium, modern aesthetic is desired.
 * Do NOT use this inside dense data-entry forms (e.g., Target Configuration).
 */
function FloatingInput({ className, type, id, label, ref, ...props }: FloatingInputProps) {
  // Generate a random ID if none provided to link the label and input for accessibility
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="relative w-full">
      <input
        type={type}
        id={inputId}
        className={cn(
          "peer flex h-12 w-full rounded-md border border-border bg-surface px-3 pb-2 pt-5 text-sm text-foreground ring-offset-background placeholder:text-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
          className
        )}
        placeholder={label} // Important: placeholder must exist for the CSS :placeholder-shown to work
        ref={ref}
        {...props}
      />
      <label
        htmlFor={inputId}
        className="absolute left-3 top-3.5 z-10 origin-[0] -translate-y-2.5 scale-75 transform text-muted-foreground duration-150 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-75 peer-focus:text-primary pointer-events-none"
      >
        {label}
      </label>
    </div>
  )
}
FloatingInput.displayName = "FloatingInput"

export { FloatingInput }