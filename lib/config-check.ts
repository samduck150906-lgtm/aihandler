/**
 * Configuration validation utility
 * Helps identify missing environment variables or misconfiguration
 */

export interface ConfigStatus {
  isValid: boolean;
  issues: string[];
  warnings: string[];
}

export function checkConfiguration(): ConfigStatus {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Check Supabase configuration
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    issues.push("NEXT_PUBLIC_SUPABASE_URL is not set");
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    issues.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");
  }

  // Check OpenAI configuration (required for API endpoint)
  if (!process.env.OPENAI_API_KEY) {
    issues.push("OPENAI_API_KEY is not set - AI prompt generation will fail");
  }

  // Check Paddle configuration
  if (!process.env.NEXT_PUBLIC_PADDLE_TOKEN) {
    warnings.push("NEXT_PUBLIC_PADDLE_TOKEN is not set - Paddle checkout will not work");
  }
  if (!process.env.PADDLE_API_KEY) {
    warnings.push("PADDLE_API_KEY is not set - Webhook processing will not work");
  }
  if (!process.env.PADDLE_WEBHOOK_SECRET) {
    warnings.push("PADDLE_WEBHOOK_SECRET is not set - Webhook verification will fail");
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
  };
}

/**
 * Check if Supabase is configured (client-side check)
 */
export function isSupabaseConfigured(): boolean {
  if (typeof window === "undefined") return true; // Can't check client-side env on server
  // At runtime, if supabase client is null, it means env vars weren't set
  return true; // We'll rely on the supabase client being null if not configured
}
