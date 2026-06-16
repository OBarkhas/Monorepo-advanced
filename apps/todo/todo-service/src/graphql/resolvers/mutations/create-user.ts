import { Context } from '../../../../types/index';

type User = { name: string };

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
