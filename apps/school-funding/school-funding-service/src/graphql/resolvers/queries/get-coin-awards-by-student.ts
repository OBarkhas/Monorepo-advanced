import { eq, and, desc } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { coinTransactionsTable } from '../../../db';
import { drizzleProvider } from '../../../drizzle-provider/index';
import { TransactionType } from '../../../types/index';

export const getCoinAwardsByStudent = async (
  _: any,
  args: { studentId: string },
  { env }: { env: any },
) => {
  const { studentId } = args;
  const db = drizzleProvider(env.DB);

  try {
    const awards = await db
      .select()
      .from(coinTransactionsTable)
      .where(
        and(
          eq(coinTransactionsTable.userId, studentId),
          eq(coinTransactionsTable.type, 'AWARD'),
        ),
      )
      .orderBy(desc(coinTransactionsTable.createdAt));

    return awards.map((award) => ({
      id: award.id,
      userId: award.userId,
      amount: award.amount,
      type: award.type as TransactionType,
      referenceId: award.referenceId,
      createdAt: award.createdAt,
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
