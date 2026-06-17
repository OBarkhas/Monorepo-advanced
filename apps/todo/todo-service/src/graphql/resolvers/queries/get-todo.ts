import { Context } from '../../../../types/index';

interface GetTodoArgs {
  userId: string;
}

export const getTodo = async (
  _: unknown,
  args: { userId: string },
  ctx: Context,
) => {
  const { db } = ctx;

  return db.todo.findMany({
    where: {
      userId: args.userId,
    },
  });
};
