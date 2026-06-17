import { User } from '../../../../generated/prisma/client';
import { Context } from '../../../../types/index';

export const createUser = async (_: unknown, args: User, context: Context) => {
  const { db } = context;
  const { name } = args;
  try {
    await db.user.create({ data: { name } });
    return { message: 'Success' };
  } catch (err: any) {
    throw new Error('System err', err);
  }
};
