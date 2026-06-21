import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url().default("http://localhost:8080"),
});

let _env: z.infer<typeof envSchema>;

try {
  _env = envSchema.parse({
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  });
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error("❌ Invalid environment variables:", error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }
  throw error;
}

export const env = _env;
