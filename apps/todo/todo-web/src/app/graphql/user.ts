import { TypedDocumentNode } from '@apollo/client';
import gql from 'graphql-tag';
import { UserResponse } from '../types/user.type';

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
