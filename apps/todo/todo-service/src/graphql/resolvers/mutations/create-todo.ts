import { Context } from '../../../../types/index';

type Todo = {
  title: string;
  description: string;
  xpReward: number;
  userId: string;
};

type TodoInput = {
  input: Todo;
};

export const createTodo = async (
  _: unknown,
  args: TodoInput,
  context: Context,
) => {
  const { db } = context;
  const { title, description, xpReward, userId } = args.input;
  try {
    await db.todo.create({
      data: {
        title,
        description,
        xpReward,
        userId,
      },
    });
    return { message: 'Success' };
  } catch (err: any) {
    throw new Error('System err', err);
  }
};
