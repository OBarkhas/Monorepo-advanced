export type UserTypes = {
  id: string;
  name: string;
  xp: number;
  level: number;
};

export type UserResponse = {
  getUsers: UserTypes[];
};
