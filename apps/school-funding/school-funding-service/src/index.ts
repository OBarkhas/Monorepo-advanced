import { ApolloServer } from '@apollo/server';
import { startServerAndCreateCloudflareWorkersHandler } from '@as-integrations/cloudflare-workers';

import { GraphQLContext } from './types';

import { drizzleProvider } from './drizzle-provider';
import { typeDefs } from './graphql/schema';
import { ExecutionContext } from '@cloudflare/workers-types';
import { resolvers } from './graphql/resolvers';

import { getAuthFromRequest } from '../../../../libs/shared/clerk/src/auth';

const server = new ApolloServer<GraphQLContext>({
  typeDefs: typeDefs,
  resolvers: resolvers,
});

const handler = startServerAndCreateCloudflareWorkersHandler<
  Env,
  GraphQLContext
>(server, {
  context: async ({ request, env }) => {
    const db = drizzleProvider(env.DB);

    const auth = await getAuthFromRequest(request, env);
    return {
      db,
      env,
      userId: auth?.userId ?? undefined,
    };
  },
});

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return handler(request, env, ctx);
  },
};
