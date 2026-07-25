import { desc, inArray } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { weeklyWinnersTable, projectsTable } from '../../../db';
import { ProjectStatus } from '../../../types/index';
import { drizzleProvider } from '../../../drizzle-provider/index';

export const resetWeeklyLeaderboard = async (
  _: any,
  __: any,
  { env }: { env: any },
) => {
  const db = drizzleProvider(env.DB);

  try {
    // 1. Calculate current week label (e.g., "Week of Mar 24 - Mar 30, 2026")
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diffToSunday = dayOfWeek === 0 ? 0 : dayOfWeek;
    const weekEnd = new Date(now);
    weekEnd.setDate(now.getDate() + (7 - diffToSunday));
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6);

    const weekLabel = `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    // 2. Get top 3 projects by total coins collected
    const topProjects = await db
      .select({
        id: projectsTable.id,
        title: projectsTable.title,
        creatorId: projectsTable.creatorId,
        totalCoinsCollected: projectsTable.totalCoinsCollected,
      })
      .from(projectsTable)
      .where(
        inArray(projectsTable.status, [ProjectStatus.APPROVED, ProjectStatus.FUNDED]),
      )
      .orderBy(desc(projectsTable.totalCoinsCollected))
      .limit(3);

    // 3. Delete previous week winners
    await db.delete(weeklyWinnersTable);

    // 4. Insert new top 3 winners
    if (topProjects.length > 0) {
      await db.insert(weeklyWinnersTable).values(
        topProjects.map((project, index) => ({
          rank: index + 1,
          projectId: project.id,
          projectTitle: project.title,
          creatorId: project.creatorId,
          coinsCollected: project.totalCoinsCollected,
          weekLabel,
        })),
      );
    }

    // 5. Reset all approved/funded project coins to 0 for the new week
    await db
      .update(projectsTable)
      .set({ totalCoinsCollected: 0 })
      .where(
        inArray(projectsTable.status, [ProjectStatus.APPROVED, ProjectStatus.FUNDED]),
      );

    return {
      success: true,
      message: `Weekly leaderboard reset completed. Top ${Math.min(topProjects.length, 3)} projects archived.`,
    };
  } catch (err: unknown) {
    if (err instanceof GraphQLError) throw err;
    throw new GraphQLError(
      `error: ${err instanceof Error ? err.message : 'undefined'}`,
      { extensions: { code: 'INTERNAL_SERVER_ERROR' } },
    );
  }
};
