import { Context } from '../../../../types/index';

export const getUsers = async (_: unknown, __: unknown, ctx: Context) => {
  const { db } = ctx;
  const users = await db.user.findMany();
  return users;
};
