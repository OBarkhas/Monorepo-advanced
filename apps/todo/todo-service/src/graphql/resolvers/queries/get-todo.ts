import { Context } from '../../../../types/index';

export const getTodo = async (_: unknown, __: unknown, ctx: Context) => {
  const { db } = ctx;
  const todo = await db.todo.findMany();
  return todo;
};
