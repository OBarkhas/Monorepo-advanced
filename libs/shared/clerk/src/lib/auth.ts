import { createClerkClient } from '@clerk/backend';
import type { ClerkEnv } from './types';

export type ClerkAuth = {
  userId: string;
  sessionId: string;
};

export type ClerkUser = {
  userId: string;
  userName: string | null;
  email: string | null;
  imageUrl: string | null;
};

/**
 * Extract the authenticated Clerk user ID and session from a request.
 * Works with Cloudflare Workers and the @clerk/backend SDK.
 *
 * Clerk v3+ backend SDK: `sessions.verifySession(sessionToken: string)`
 */
export async function getAuthFromRequest(
  request: Request,
  env: ClerkEnv,
): Promise<ClerkAuth | null> {
  try {
    const clerkClient = createClerkClient({
      secretKey: env.CLERK_SECRET_KEY,
    });

    const authHeader = request.headers.get('Authorization');
    const sessionToken =
      authHeader?.replace('Bearer ', '')?.trim() ||
      getCookie(request, '__session');

    if (!sessionToken) {
      return null;
    }

    const session = await clerkClient.sessions.verifySession(sessionToken);

    if (!session) {
      return null;
    }

    return {
      userId: session.userId,
      sessionId: session.id,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch a Clerk user's profile data by their user ID.
 */
export async function getClerkUser(
  env: ClerkEnv,
  userId: string,
): Promise<ClerkUser | null> {
  try {
    const clerkClient = createClerkClient({
      secretKey: env.CLERK_SECRET_KEY,
    });

    const user = await clerkClient.users.getUser(userId);

    return {
      userId: user.id,
      userName:
        user.username ||
        `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
        'New User',
      email: user.emailAddresses?.[0]?.emailAddress || null,
      imageUrl: user.imageUrl || null,
    };
  } catch {
    return null;
  }
}

/**
 * Simple cookie parser for Cloudflare Workers.
 */
function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map((c) => c.trim());
  for (const cookie of cookies) {
    const [key, ...rest] = cookie.split('=');
    if (key?.trim() === name) {
      return rest.join('=').trim();
    }
  }
  return null;
}
