import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { Context } from '../types/index';
import { userTypeDefs } from './graphql/schema/user.schema';
import { resolvers } from './graphql/resolvers/index';
import { db } from './config/db';

const startServer = async () => {
  const server = new ApolloServer({
    typeDefs: userTypeDefs,
    resolvers: resolvers,
  });

  const { url } = await startStandaloneServer<Context>(server, {
    listen: { port: Number(process.env.PORT) || 4001 },
    context: async ({ req }) => {
      return { db };
    },
  });

  console.log(`GraphQL server is running on ${url}`);
};

startServer().catch((err) => {
  console.error(err);
});
