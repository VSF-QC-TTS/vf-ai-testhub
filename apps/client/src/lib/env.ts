import { z } from "zod";

const apiBaseUrlSchema = z
  .string()
  .trim()
  .min(1)
  .refine((value) => value.startsWith("/") || URL.canParse(value), {
    message: "Must be an absolute URL or a same-origin path",
  });

const envSchema = z.object({
  VITE_API_BASE_URL: apiBaseUrlSchema.default("/"),
});

let _env: z.infer<typeof envSchema>;

try {
  _env = envSchema.parse({
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  });
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("❌ Invalid environment variables:", error.flatten().fieldErrors);
    throw new Error("Invalid environment variables", { cause: error });
  }
  throw error;
}

export const env = _env;
