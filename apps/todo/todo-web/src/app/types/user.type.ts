export type DeleteTodoResponse = {
  deleteTodo: string;
};

export type DeleteTodoVariables = {
  id: string;
};
export type DeleteUserResponse = {
  deleteUser: string;
};
export type DeleteUserVariables = {
  userId: string;
};

export type User = {
  id: string;
  name: string;
  xp: number;
  level: number;
};

export type UserResponse = {
  getUsers: User[];
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
