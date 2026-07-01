import { eq } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { usersTable } from '../../../db';
import { drizzleProvider } from '../../../drizzle-provider/index';

export const getUserById = async (
  _: any,
  args: { id: string },
  { env }: { env: any },
) => {
  const { id } = args;
  const db = drizzleProvider(env.DB);

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      userName: user.userName,
      email: user.email,
      role: user.role,
      age: user.age,
      coinBalance: user.coinBalance,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
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
