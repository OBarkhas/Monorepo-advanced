import { Context } from '../../../../types/index';

export const deleteTodo = async (
  _: unknown,
  { id }: { id: string },
  context: Context,
) => {
  const { db } = context;

  await db.todo.delete({
    where: {
      id,
    },
  });

  return 'Todo deleted';
};
