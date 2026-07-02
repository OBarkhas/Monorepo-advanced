import { eq } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { usersTable } from '../../../db';
import { drizzleProvider } from '../../../drizzle-provider/index';

export const deleteUser = async (
  _: any,
  args: { targetUserId: string; requesterUserId: string },
  { env }: { env: any },
) => {
  const { targetUserId, requesterUserId } = args;
  const db = drizzleProvider(env.DB);

  try {
    const [requester] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, requesterUserId));

    if (!requester) {
      throw new GraphQLError('Requester user not found.', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    const [targetUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, targetUserId));

    if (!targetUser) {
      throw new GraphQLError('Target user not found.', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    const isSelf = targetUserId === requesterUserId;
    const isTeacher = requester.role === 'TEACHER';

    if (!isSelf && !isTeacher) {
      throw new GraphQLError(
        'You do not have permission to delete this user.',
        {
          extensions: { code: 'FORBIDDEN' },
        },
      );
    }

    await db.delete(usersTable).where(eq(usersTable.id, targetUserId));

    return {
      success: true,
      message: `User with ID ${targetUserId} and all associated data have been successfully deleted.`,
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
