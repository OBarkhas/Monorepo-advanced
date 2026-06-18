import gql from 'graphql-tag';

export const userTypeDefs = gql`
  type User {
    id: ID!
    name: String!
    xp: Int!
    level: Int!
    todos: [Todo]!
  }
  type Todo {
    id: ID!
    title: String!
    description: String
    xpReward: Int!
    isCompleted: Boolean!
  }

  type Response {
    message: String!
  }

  input TodoInput {
    title: String!
    description: String
    xpReward: Int!
    userId: ID!
  }

  type Query {
    getUsers: [User]!
    getUserById(id: ID!): User
    getTodo(userId: ID!): [Todo]!
  }

  type Mutation {
    createUser(name: String!): Response!
    createTodo(input: TodoInput!): Response!
    deleteTodo(id: ID!): String!
    deleteUser(userId: ID!): String!
  }
`;
