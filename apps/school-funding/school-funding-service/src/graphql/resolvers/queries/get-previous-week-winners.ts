import { asc } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { weeklyWinnersTable } from '../../../db';
import { drizzleProvider } from '../../../drizzle-provider/index';

export const getPreviousWeekWinners = async (
  _: any,
  __: any,
  { env }: { env: any },
) => {
  const db = drizzleProvider(env.DB);

  try {
    const winners = await db
      .select()
      .from(weeklyWinnersTable)
      .orderBy(asc(weeklyWinnersTable.rank));

    return winners;
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
