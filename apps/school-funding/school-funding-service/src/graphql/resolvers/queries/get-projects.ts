import { eq, desc } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { projectsTable } from '../../../db';
import { ProjectStatus } from '../../../types/index';
import { drizzleProvider } from '../../../drizzle-provider/index';

export const getPublicProjects = async (
  _: any,
  __: any,
  { env }: { env: any },
) => {
  try {
    const db = drizzleProvider(env.DB);
    const projects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.status, 'APPROVED'))
      .all();

    return projects.map((project) => ({
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
    if (err instanceof GraphQLError) throw err;
    throw new GraphQLError(
      `error: ${err instanceof Error ? err.message : 'undefined'}`,
      { extensions: { code: 'INTERNAL_SERVER_ERROR' } },
    );
  }
};

export const getPendingProjects = async (
  _: any,
  __: any,
  { env }: { env: any },
) => {
  try {
    const db = drizzleProvider(env.DB);
    const projects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.status, 'PENDING'))
      .all();

    return projects.map((project) => ({
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
    if (err instanceof GraphQLError) throw err;
    throw new GraphQLError(
      `error: ${err instanceof Error ? err.message : 'undefined'}`,
      { extensions: { code: 'INTERNAL_SERVER_ERROR' } },
    );
  }
};

export const getProjectsByStudent = async (
  _: any,
  args: { studentId: string },
  { env }: { env: any },
) => {
  try {
    const db = drizzleProvider(env.DB);
    const projects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.creatorId, args.studentId))
      .all();

    return projects.map((project) => ({
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
    if (err instanceof GraphQLError) throw err;
    throw new GraphQLError(
      `error: ${err instanceof Error ? err.message : 'undefined'}`,
      { extensions: { code: 'INTERNAL_SERVER_ERROR' } },
    );
  }
};

export const getLeaderboard = async (
  _: any,
  __: any,
  { env }: { env: any },
) => {
  try {
    const db = drizzleProvider(env.DB);
    const projects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.status, 'APPROVED'))
      .orderBy(desc(projectsTable.totalCoinsCollected))
      .limit(3)
      .all();

    return projects.map((project) => ({
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
    if (err instanceof GraphQLError) throw err;
    throw new GraphQLError(
      `error: ${err instanceof Error ? err.message : 'undefined'}`,
      { extensions: { code: 'INTERNAL_SERVER_ERROR' } },
    );
  }
};
