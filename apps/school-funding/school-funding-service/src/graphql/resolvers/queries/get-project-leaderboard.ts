import { desc, or, eq } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { projectsTable } from '../../../db';
import { ProjectStatus } from '../../../types/index';
import { drizzleProvider } from '../../../drizzle-provider/index';

export const getLeaderboard = async (
  _: any,
  __: any,
  { env }: { env: any },
) => {
  const db = drizzleProvider(env.DB);

  try {
    const leaderboardProjects = await db
      .select()
      .from(projectsTable)
      .where(or(eq(projectsTable.status, 'APPROVED')))
      .orderBy(desc(projectsTable.totalCoinsCollected));

    return leaderboardProjects.map((project) => ({
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
