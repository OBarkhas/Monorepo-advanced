import { TypedDocumentNode } from '@apollo/client';
import gql from 'graphql-tag';
import {
  DeleteTodoResponse,
  DeleteTodoVariables,
  TodoResponse,
  TodoVariables,
} from '../types/user.type';
export const CREATE_TODO = gql`
  mutation CreateTodo($input: TodoInput!) {
    createTodo(input: $input) {
      message
    }
  }
`;

export const GET_TODO: TypedDocumentNode<TodoResponse, TodoVariables> = gql`
  query GetTodo($userId: ID!) {
    getTodo(userId: $userId) {
      id
      title
      description
      xpReward
      isCompleted
    }
  }
`;
export const DELETE_TODO: TypedDocumentNode<
  DeleteTodoResponse,
  DeleteTodoVariables
> = gql`
  mutation DeleteTodo($id: ID!) {
    deleteTodo(id: $id)
  }
`;
export const GET_USER_PROFILE = gql`
  query GetUserById($id: ID!) {
    getUserById(id: $id) {
      id
      name
      xp
      level
      todos {
        id
        title
        description
        xpReward
        isCompleted
      }
    }
  }
`;

export const COMPLETE_TODO = gql`
  mutation CompleteTodo($userId: ID!, $todoId: ID!) {
    completeTodo(userId: $userId, todoId: $todoId) {
      message
      xpGained
      leveledUp
      newLevel
      newXp
      currentLevelXp
      xpToNextLevel
    }
  }
`;
