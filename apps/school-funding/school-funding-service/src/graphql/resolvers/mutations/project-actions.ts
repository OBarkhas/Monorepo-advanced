import { eq, sql } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import {
  projectsTable,
  usersTable,
  votesTable,
  coinTransactionsTable,
} from '../../../db';
import { ProjectStatus } from '../../../types/index';
import { drizzleProvider } from '../../../drizzle-provider/index';

export const updateProjectStatus = async (
  _: any,
  args: {
    id: string;
    status: ProjectStatus;
    reviewedById: string;
    rejectionReason?: string;
  },
  { env }: { env: any },
) => {
  const { id, status, reviewedById, rejectionReason } = args;
  try {
    const db = drizzleProvider(env.DB);

    const [reviewer] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, reviewedById));

    if (!reviewer || reviewer.role !== 'TEACHER') {
      throw new GraphQLError('Only teachers can review projects.', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    const [updatedProject] = await db
      .update(projectsTable)
      .set({
        status,
        reviewedById,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(projectsTable.id, id))
      .returning();

    if (!updatedProject) {
      throw new GraphQLError('Project not found.', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

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
    if (err instanceof GraphQLError) throw err;
    throw new GraphQLError(
      `error: ${err instanceof Error ? err.message : 'undefined'}`,
      { extensions: { code: 'INTERNAL_SERVER_ERROR' } },
    );
  }
};

export const voteProject = async (
  _: any,
  args: { projectId: string; studentId: string },
  { env }: { env: any },
) => {
  const { projectId, studentId } = args;
  try {
    const db = drizzleProvider(env.DB);

    const [student] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, studentId));

    if (!student || student.role !== 'STUDENT') {
      throw new GraphQLError('Only students can vote.', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    if (student.coinBalance < 10) {
      throw new GraphQLError(
        'Not enough coins. Minimum 10 coins required to vote.',
        {
          extensions: { code: 'BAD_USER_INPUT' },
        },
      );
    }

    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId));

    if (!project || project.status !== 'APPROVED') {
      throw new GraphQLError('Voting is only allowed for approved projects.', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    await db
      .update(usersTable)
      .set({ coinBalance: sql`${usersTable.coinBalance} - 10` })
      .where(eq(usersTable.id, studentId));

    await db
      .update(projectsTable)
      .set({
        totalCoinsCollected: sql`${projectsTable.totalCoinsCollected} + 10`,
      })
      .where(eq(projectsTable.id, projectId));

    const [newVote] = await db
      .insert(votesTable)
      .values({
        projectId,
        studentId,
        coinAmount: 10,
      })
      .returning();

    await db.insert(coinTransactionsTable).values({
      userId: studentId,
      amount: -10,
      type: 'VOTE',
      referenceId: projectId,
    });

    return {
      id: newVote.id,
      projectId: newVote.projectId,
      studentId: newVote.studentId,
      coinAmount: newVote.coinAmount,
      createdAt: newVote.createdAt,
    };
  } catch (err: unknown) {
    if (err instanceof GraphQLError) throw err;
    throw new GraphQLError(
      `error: ${err instanceof Error ? err.message : 'undefined'}`,
      { extensions: { code: 'INTERNAL_SERVER_ERROR' } },
    );
  }
};
