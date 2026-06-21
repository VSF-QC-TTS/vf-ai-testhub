import { useId, useState, type ComponentProps } from "react"
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"

export interface FloatingInputProps extends ComponentProps<"input"> {
  label: string;
}

/**
 * A specialized Input component with a "Floating Label" effect.
 * Upgraded for high-agency design: larger touch target, smoother transitions, 
 * standard bg-background, and border-input.
 */
function FloatingInput({ className, type, id, label, ref, ...props }: FloatingInputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="relative w-full">
      <input
        type={inputType}
        id={inputId}
        className={cn(
          "peer flex h-[52px] w-full rounded-lg border bg-background px-4 pb-1.5 pt-6 text-sm text-foreground ring-offset-background placeholder:text-transparent focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          props["aria-invalid"] ? "border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive" : "border-input focus-visible:ring-primary/20 focus-visible:border-primary",
          isPassword && "pr-10",
          className
        )}
        placeholder={label} 
        ref={ref}
        {...props}
      />
      <label
        htmlFor={inputId}
        className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2.5 scale-[0.85] transform text-muted-foreground duration-200 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2.5 peer-focus:scale-[0.85] peer-focus:text-foreground pointer-events-none"
      >
        {label}
      </label>
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      )}
    </div>
  )
}
FloatingInput.displayName = "FloatingInput"

export { FloatingInput }