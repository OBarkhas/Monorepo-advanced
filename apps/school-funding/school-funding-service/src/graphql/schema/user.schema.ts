import gql from 'graphql-tag';

export const usertypeDefs = gql`
  enum UserRole {
    STUDENT
    TEACHER
  }

  type User {
    id: ID!
    userName: String!
    email: String!
    role: UserRole!
    age: Int
    coinBalance: Int!
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    getUsers: [User!]!
    getUserById(id: ID!): User
  }

  extend type Mutation {
    createUser(
      userName: String!
      email: String!
      role: UserRole!
      age: Int
    ): User!
    deleteUser(targetUserId: ID!, requesterUserId: ID!): Response!
  }
`;
