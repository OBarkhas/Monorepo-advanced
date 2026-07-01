import { GraphQLError } from 'graphql';
import { usersTable } from '../../../db';
import { QueryResolvers } from '../../../types/index';
import { drizzleProvider } from '../../../drizzle-provider/index';

export const getUsers: QueryResolvers['getUsers'] = async (_, __, { env }) => {
  try {
    const db = drizzleProvider(env.DB);

    const users = await db.select().from(usersTable).all();

    return users.map((user) => ({
      id: user.id,
      userName: user.userName,
      email: user.email,
      role: user.role,
      age: user.age,
      coinBalance: user.coinBalance,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  } catch (err: unknown) {
    if (err instanceof GraphQLError) {
      throw err;
    }
    throw new GraphQLError(
      `error: ${err instanceof Error ? err.message : 'undefined'}`,
      { extensions: { code: 'INTERNAL_SERVER_ERROR' } },
    );
  }
};
