import { eq } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { projectsTable } from '../../../db';
import { ProjectStatus } from '../../../types/index';
import { drizzleProvider } from '../../../drizzle-provider/index';

export const updateProject = async (
  _: any,
  args: {
    id: string;
    title?: string;
    description?: string;
    images?: string[];
    creatorId: string;
  },
  { env }: { env: any },
) => {
  const { id, title, description, images, creatorId } = args;
  const db = drizzleProvider(env.DB);

  try {
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, id));

    if (!project) {
      throw new GraphQLError('Project not found.', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    if (project.creatorId !== creatorId) {
      throw new GraphQLError('Only the creator can update this project.', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    if (project.status === 'APPROVED' || project.status === 'FUNDED') {
      throw new GraphQLError(
        'Approved or funded projects cannot be modified.',
        {
          extensions: { code: 'FORBIDDEN' },
        },
      );
    }

    const nextStatus =
      project.status === 'REJECTED' ? 'PENDING' : project.status;

    const [updatedProject] = await db
      .update(projectsTable)
      .set({
        title: title ?? project.title,
        description: description ?? project.description,
        images: images ?? project.images,
        status: nextStatus,
        rejectionReason:
          nextStatus === 'PENDING' ? null : project.rejectionReason,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(projectsTable.id, id))
      .returning();

    return {
      id: updatedProject.id,
      title: updatedProject.title,
      description: updatedProject.description,
      images: updatedProject.images,
      creatorId: updatedProject.creatorId,
      status: updatedProject.status as ProjectStatus,
      reviewedById: updatedProject.reviewedById,
      rejectionReason: updatedProject.rejectionReason,
      totalCoinsCollected: updatedProject.totalCoinsCollected,
      endDate: updatedProject.endDate,
      createdAt: updatedProject.createdAt,
      updatedAt: updatedProject.updatedAt,
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
