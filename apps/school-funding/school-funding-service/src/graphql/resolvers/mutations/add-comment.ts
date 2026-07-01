import { eq } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { commentsTable, projectsTable, usersTable } from '../../../db';
import { drizzleProvider } from '../../../drizzle-provider/index';

export const addComment = async (
  _: any,
  args: { projectId: string; authorId: string; content: string },
  { env }: { env: any },
) => {
  const { projectId, authorId, content } = args;
  const db = drizzleProvider(env.DB);

  try {
    if (!content || content.trim() === '') {
      throw new GraphQLError('Comment content cannot be empty.', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, authorId));

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

    const [newComment] = await db
      .insert(commentsTable)
      .values({
        projectId,
        authorId,
        content,
      })
      .returning();

    return {
      id: newComment.id,
      projectId: newComment.projectId,
      authorId: newComment.authorId,
      content: newComment.content,
      createdAt: newComment.createdAt,
      updatedAt: newComment.updatedAt,
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
