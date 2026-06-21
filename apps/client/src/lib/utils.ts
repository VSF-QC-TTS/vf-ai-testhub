import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to merge Tailwind classes, resolving conflicts automatically.
 * Relies on `clsx` for conditional classes and `tailwind-merge` to override conflicting styles (e.g., p-4 vs p-2).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
