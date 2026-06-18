import { TypedDocumentNode } from '@apollo/client';
import gql from 'graphql-tag';
import {
  DeleteUserResponse,
  DeleteUserVariables,
  GetUserResponse,
  GetUserVariables,
  UserResponse,
} from '../types/user.type';

export const CREATE_USER = gql`
  mutation CreateUser($name: String!) {
    createUser(name: $name) {
      message
    }
  }
`;
export const GET_USER: TypedDocumentNode<UserResponse> = gql`
  query GetUsers {
    getUsers {
      id
      name
      xp
      level
    }
  }
`;

export const GET_USER_BY_ID: TypedDocumentNode<
  GetUserResponse,
  GetUserVariables
> = gql`
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
export const DELETE_USER: TypedDocumentNode<
  DeleteUserResponse,
  DeleteUserVariables
> = gql`
  mutation DeleteUser($userId: ID!) {
    deleteUser(userId: $userId)
  }
`;
