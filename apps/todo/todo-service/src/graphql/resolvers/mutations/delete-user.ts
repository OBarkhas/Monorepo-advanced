import { Context } from '../../../../types/index';

export const deleteUser = async (
  _: unknown,
  args: { userId: string },
  context: Context,
) => {
  const { db } = context;
  await db.user.delete({
    where: {
      id: args.userId,
    },
  });
  return 'user deleted';
};
