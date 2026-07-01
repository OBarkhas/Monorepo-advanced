import { eq } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { projectsTable } from '../../../db';
import { ProjectStatus } from '../../../types/index';
import { drizzleProvider } from '../../../drizzle-provider/index';

export const getProjectById = async (
  _: any,
  args: { id: string },
  { env }: { env: any },
) => {
  const { id } = args;
  const db = drizzleProvider(env.DB);

  try {
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, id));

    if (!project) {
      return null;
    }

    return {
      id: project.id,
      title: project.title,
      description: project.description,
      images: project.images,
      creatorId: project.creatorId,
      status: project.status as ProjectStatus,
      reviewedById: project.reviewedById,
      rejectionReason: project.rejectionReason,
      totalCoinsCollected: project.totalCoinsCollected,
      endDate: project.endDate,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
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
