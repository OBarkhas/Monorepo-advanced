import { GraphQLError } from 'graphql';
import { getLevel, xpWithinLevel } from '../../../lib/xp';
import { Context } from '../../../../types/index';

type Args = { todoId: string; userId: string };

export const completeTodo = async (_: unknown, args: Args, ctx: Context) => {
  const { todoId, userId } = args;

  const result = await ctx.db.$transaction(async (tx) => {
    const todo = await tx.todo.findUnique({ where: { id: todoId } });
    if (!todo) throw new GraphQLError('Todo not found');
    if (todo.userId !== userId) throw new GraphQLError('Unauthorized');

    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) throw new GraphQLError('User not found');

    if (todo.isCompleted) {
      const { current, needed, level } = xpWithinLevel(user.xp);
      return {
        message: 'Already completed',
        xpGained: 0,
        leveledUp: false,
        newLevel: level,
        newXp: user.xp,
        currentLevelXp: current,
        xpToNextLevel: needed,
      };
    }

    await tx.todo.update({
      where: { id: todoId },
      data: { isCompleted: true },
    });

    const xpGained = todo.xpReward;
    const oldLevel = getLevel(user.xp);
    const newXp = user.xp + xpGained;
    const newLevel = getLevel(newXp);
    const leveledUp = newLevel > oldLevel;

    await tx.user.update({
      where: { id: userId },
      data: { xp: newXp, level: newLevel },
    });

    const { current, needed } = xpWithinLevel(newXp);

    return {
      message: 'Quest completed!',
      xpGained,
      leveledUp,
      newLevel,
      newXp,
      currentLevelXp: current,
      xpToNextLevel: needed,
    };
  });

  return result;
};
