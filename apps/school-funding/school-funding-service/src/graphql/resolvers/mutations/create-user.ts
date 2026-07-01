import { eq } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { usersTable } from '../../../db';
import { MutationResolvers } from '../../../types';
import { drizzleProvider } from '../../../drizzle-provider';

export const createUser: MutationResolvers['createUser'] = async (
  _,
  args,
  { env },
) => {
  const { userName, email, role, age } = args;
  const db = drizzleProvider(env.DB);

  try {
    const [existingUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (existingUser) {
      throw new GraphQLError('user already exists.', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    const [newUser] = await db
      .insert(usersTable)
      .values({
        userName,
        email,
        role,
        age,
        coinBalance: role === 'TEACHER' ? 0 : 100,
      })
      .returning();

    return {
      id: newUser.id.toString(),
      userName: newUser.userName,
      email: newUser.email,
      role: newUser.role,
      age: newUser.age,
      coinBalance: newUser.coinBalance,
      createdAt: newUser.createdAt
        ? new Date(newUser.createdAt).toISOString()
        : new Date().toISOString(),
      updatedAt: newUser.updatedAt
        ? new Date(newUser.updatedAt).toISOString()
        : new Date().toISOString(),
    };
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
