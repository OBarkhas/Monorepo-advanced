/**
 * Minimum environment variables required by Clerk helpers.
 * Extends to fit the actual Cloudflare Workers Env at runtime.
 */
export interface ClerkEnv {
  CLERK_SECRET_KEY: string;
  CLERK_PUBLISHABLE_KEY?: string;
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?: string;
}
