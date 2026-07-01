import { eq, sql } from 'drizzle-orm';
import { GraphQLError } from 'graphql';
import { usersTable, coinTransactionsTable } from '../../../db';
import { drizzleProvider } from '../../../drizzle-provider/index';

export const awardCoins = async (
  _: any,
  args: { teacherId: string; studentId: string; amount: number },
  { env }: { env: any },
) => {
  const { teacherId, studentId, amount } = args;
  const db = drizzleProvider(env.DB);

  try {
    const [teacher] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, teacherId));

    if (!teacher || teacher.role !== 'TEACHER') {
      throw new GraphQLError('Only teachers are authorized to award coins.', {
        extensions: { code: 'FORBIDDEN' },
      });
    }

    if (amount <= 0) {
      throw new GraphQLError('Amount must be greater than zero.', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    const [student] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, studentId));

    if (!student) {
      throw new GraphQLError('Student not found.', {
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }

    const [updatedStudent] = await db
      .update(usersTable)
      .set({ coinBalance: sql`${usersTable.coinBalance} + ${amount}` })
      .where(eq(usersTable.id, studentId))
      .returning();

    await db.insert(coinTransactionsTable).values({
      userId: studentId,
      amount: amount,
      type: 'AWARD',
      referenceId: teacherId,
    });

    return {
      id: updatedStudent.id,
      userName: updatedStudent.userName,
      email: updatedStudent.email,
      role: updatedStudent.role,
      age: updatedStudent.age,
      coinBalance: updatedStudent.coinBalance,
      createdAt: updatedStudent.createdAt,
      updatedAt: updatedStudent.updatedAt,
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
