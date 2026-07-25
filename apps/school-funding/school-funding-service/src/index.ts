import { ApolloServer, GraphQLRequestContext } from '@apollo/server';
import { startServerAndCreateCloudflareWorkersHandler } from '@as-integrations/cloudflare-workers';
import { ExecutionContext } from '@cloudflare/workers-types';
import { eq } from 'drizzle-orm';

import { drizzleProvider } from './drizzle-provider/index';
import { GraphQLContext } from './types/index';
import { typeDefs } from './graphql/schema/index';
import { resolvers } from './graphql/resolvers/index';
import { handleClerkWebhook } from './webhook';
import { usersTable } from './db/user.schema';
import { getAuthFromRequest, getClerkUser } from '@hop-advanced-monorepo/clerk';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

const corsPlugin = {
  async requestDidStart() {
    return {
      async willSendResponse(ctx: GraphQLRequestContext<GraphQLContext>) {
        if (!ctx.response.http) return;
        Object.entries(corsHeaders).forEach(([key, value]) => {
          ctx.response.http?.headers.set(key, value);
        });
      },
    };
  },
};

const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
  introspection: true,
  plugins: [corsPlugin],
});

const handler = startServerAndCreateCloudflareWorkersHandler<
  Env,
  GraphQLContext
>(server, {
  context: async ({ request, env }) => {
    const db = drizzleProvider(env.DB);
    const auth = await getAuthFromRequest(request, env);

    const user = auth ? await getClerkUser(env, auth.userId) : null;
    console.log(
      '[Clerk] user:',
      user ? `${user.userName}, ${user.email}` : `not authenticated`,
    );

    if (user) {
      try {
        const existing = await db
          .select({ id: usersTable.id })
          .from(usersTable)
          .where(eq(usersTable.id, user.userId))
          .limit(1);

        if (existing.length === 0) {
          await db.insert(usersTable).values({
            id: user.userId,
            userName: user.userName ?? 'New User',
            email: user.email ?? '',
          });
          console.log('[User] Auto-created user in DB:', user.userId);
        }
      } catch (dbErr) {
        console.error('[User] Failed to check/create user in DB:', dbErr);
      }
    }

    return {
      db,
      env,
      userId: user?.userId,
      userName: user?.userName,
      email: user?.email,
    };
  },
});

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (url.pathname === '/api/webhooks') {
      if (request.method !== 'POST') {
        return new Response('Method Not Allowed', {
          status: 405,
          headers: corsHeaders,
        });
      }
      const res = await handleClerkWebhook(request, env);
      Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v));
      return res;
    }

    const response = await handler(request, env, ctx);
    const newResponse = new Response(response.body, response);

    Object.entries(corsHeaders).forEach(([key, value]) => {
      newResponse.headers.set(key, value);
    });

    return newResponse;
  },
};
