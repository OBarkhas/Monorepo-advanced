import { eq, and, or } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { projectsTable, usersTable } from '../../../db';
import { drizzleProvider } from '../../../drizzle-provider/index';

export const deleteProject = async (
  _: any,
  args: { projectId: string; userId: string },
  { env }: { env: any },
) => {
  const { projectId, userId } = args;
  const db = drizzleProvider(env.DB);

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (!user) {
      throw new GraphQLError('User not found.', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId));

    if (!project) {
      throw new GraphQLError('Project not found.', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    const isCreator = project.creatorId === userId;
    const isTeacher = user.role === 'TEACHER';

    if (!isCreator && !isTeacher) {
      throw new GraphQLError(
        'You do not have permission to delete this project.',
        {
          extensions: { code: 'FORBIDDEN' },
        },
      );
    }

    await db.delete(projectsTable).where(eq(projectsTable.id, projectId));

    return {
      success: true,
      message:
        'Project and all associated data have been successfully deleted.',
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
