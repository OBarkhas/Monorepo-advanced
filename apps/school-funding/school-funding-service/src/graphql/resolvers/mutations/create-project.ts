import { eq } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { projectsTable, usersTable } from '../../../db';
import { MutationResolvers, ProjectStatus } from '../../../types/index';
import { drizzleProvider } from '../../../drizzle-provider/index';

export const createProject: MutationResolvers['createProject'] = async (
  _,
  args,
  { env },
) => {
  const { title, description, images, creatorId } = args;
  const db = drizzleProvider(env.DB);

  try {
    const [creator] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, creatorId));

    if (!creator) {
      throw new GraphQLError('Creator user not found.', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    if (creator.role !== 'STUDENT') {
      throw new GraphQLError('Only students can create projects.', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    const [newProject] = await db
      .insert(projectsTable)
      .values({
        title,
        description,
        images: images ?? [],
        creatorId,
        status: 'PENDING',
        totalCoinsCollected: 0,
      })
      .returning();

    return {
      id: newProject.id,
      title: newProject.title,
      description: newProject.description,
      images: newProject.images,
      creatorId: newProject.creatorId,
      status: newProject.status as ProjectStatus,
      reviewedById: newProject.reviewedById,
      rejectionReason: newProject.rejectionReason,
      totalCoinsCollected: newProject.totalCoinsCollected,
      endDate: newProject.endDate,
      createdAt: newProject.createdAt,
      updatedAt: newProject.updatedAt,
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
