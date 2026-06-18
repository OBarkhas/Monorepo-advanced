export const xpForLevel = (level: number): number => {
  return (100 * level * (level - 1)) / 2;
};

export const getLevel = (totalXp: number): number => {
  let level = 1;

  while (xpForLevel(level + 1) <= totalXp) {
    level++;
  }

  return level;
};

type Level = {
  current: number;

  needed: number;

  level: number;
};

export const xpWithinLevel = (totalXp: number): Level => {
  const level = getLevel(totalXp);

  const current = totalXp - xpForLevel(level);

  const needed = xpForLevel(level + 1) - xpForLevel(level);

  return { current, needed, level };
};
