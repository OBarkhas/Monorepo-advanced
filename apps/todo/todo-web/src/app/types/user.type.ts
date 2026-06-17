export type UserTypes = {
  id: string;
  name: string;
  xp: number;
  level: number;
};

export type UserResponse = {
  getUsers: UserTypes[];
};
export type User = {
  id: string;
  name: string;
  xp: number;
  level: number;
};

export type GetUserResponse = {
  getUserById: User & {
    todos: {
      id: string;
      title: string;
      description?: string;
      xpReward: number;
      isCompleted: boolean;
    }[];
  };
};

export type GetUserVariables = {
  id: string;
};

export interface Todo {
  id: string;
  title: string;
  description?: string | null;
  xpReward: number;
  isCompleted: boolean;
}

export interface TodoResponse {
  getTodo: Todo[];
}

export interface TodoVariables {
  userId: string;
}
