import { eq, asc } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { commentsTable } from '../../../db';
import { drizzleProvider } from '../../../drizzle-provider/index';

export const getCommentsByProject = async (
  _: any,
  args: { projectId: string },
  { env }: { env: any },
) => {
  const { projectId } = args;
  const db = drizzleProvider(env.DB);

  try {
    const comments = await db
      .select()
      .from(commentsTable)
      .where(eq(commentsTable.projectId, projectId))
      .orderBy(asc(commentsTable.createdAt));

    return comments.map((comment) => ({
      id: comment.id,
      projectId: comment.projectId,
      authorId: comment.authorId,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
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
