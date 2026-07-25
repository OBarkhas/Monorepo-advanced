import { createClerkClient } from '@clerk/backend';
import type { ClerkEnv } from './types';

export type ClerkClient = ReturnType<typeof createClerkClient>;

/**
 * Create a Clerk client instance for use in Cloudflare Workers.
 */
export function createClerk(env: ClerkEnv): ClerkClient {
  return createClerkClient({
    secretKey: env.CLERK_SECRET_KEY,
    publishableKey: env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  });
}

/**
 * Verify a Clerk session token and return the user ID.
 * Clerk v3+ backend SDK: `sessions.verifySession(sessionToken: string)`
 */
export async function verifySession(
  env: ClerkEnv,
  sessionToken: string,
): Promise<{ userId: string; sessionId: string } | null> {
  try {
    const clerk = createClerk(env);
    const session = await clerk.sessions.verifySession(sessionToken);
    return {
      userId: session.userId,
      sessionId: session.id,
    };
  } catch {
    return null;
  }
}
