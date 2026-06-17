import { Context } from '../../../../types';

export const getUserById = async (
  _: unknown,
  args: { id: string },
  ctx: Context,
) => {
  const { db } = ctx;

  return db.user.findUnique({
    where: {
      id: args.id,
    },
    include: {
      todos: true,
    },
  });
};
