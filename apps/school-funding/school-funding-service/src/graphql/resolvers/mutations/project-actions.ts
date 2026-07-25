import { eq, sql } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import {
  projectsTable,
  usersTable,
  votesTable,
  coinTransactionsTable,
} from '../../../db';
import { MutationResolvers, ProjectStatus } from '../../../types/index';
import { drizzleProvider } from '../../../drizzle-provider/index';

export const projectAction: MutationResolvers['projectAction'] = async (
  _,
  { id, status, reviewedById, rejectionReason },
  { env },
) => {
  try {
    const db = drizzleProvider(env.DB);

    const [reviewer] = await db
      .select({ role: usersTable.role })
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
      ...updatedProject,
      status: updatedProject.status as ProjectStatus,
    } as any;
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
  args: { projectId: string; userId: string; coinAmount: number },
  { env }: { env: any },
) => {
  const { projectId, userId, coinAmount } = args;

  try {
    const db = drizzleProvider(env.DB);

    if (!coinAmount || coinAmount < 1) {
      throw new GraphQLError('Minimum vote amount is 1 coin.', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    const [user] = await db
      .select({ coinBalance: usersTable.coinBalance })
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (!user) {
      throw new GraphQLError('User not found.', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    if (user.coinBalance < coinAmount) {
      throw new GraphQLError(
        `Not enough coins. You have ${user.coinBalance} coins.`,
        { extensions: { code: 'BAD_USER_INPUT' } },
      );
    }

    const [project] = await db
      .select({
        status: projectsTable.status,
        creatorId: projectsTable.creatorId,
      })
      .from(projectsTable)
      .where(eq(projectsTable.id, projectId));

    if (!project || project.status !== 'APPROVED') {
      throw new GraphQLError('Voting is only allowed for approved projects.', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    if (project.creatorId === userId) {
      throw new GraphQLError('You cannot vote for your own project.', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    await db
      .update(usersTable)
      .set({ coinBalance: sql`${usersTable.coinBalance} - ${coinAmount}` })
      .where(eq(usersTable.id, userId));

    await db
      .update(projectsTable)
      .set({
        totalCoinsCollected: sql`${projectsTable.totalCoinsCollected} + ${coinAmount}`,
      })
      .where(eq(projectsTable.id, projectId));

    const [newVote] = await db
      .insert(votesTable)
      .values({
        projectId,
        studentId: userId,
        coinAmount,
      })
      .returning();

    await db.insert(coinTransactionsTable).values({
      userId,
      amount: -coinAmount,
      type: 'VOTE',
      referenceId: projectId,
    });

    return newVote as any;
  } catch (err: unknown) {
    if (err instanceof GraphQLError) throw err;
    throw new GraphQLError(
      `error: ${err instanceof Error ? err.message : 'undefined'}`,
      { extensions: { code: 'INTERNAL_SERVER_ERROR' } },
    );
  }
};
