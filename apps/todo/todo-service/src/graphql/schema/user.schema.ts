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

  input TodoInput {
    title: String!
    description: String
    xpReward: Int!
  }

  type Query {
    getUsers: [User]!
    getTodoByUserId(userId: ID!): [Todo]!
  }
  type Response {
    message: String!
  }
  type Mutation {
    createUser(name: String!): Response!
    createTodo(input: TodoInput): Response!
  }
`;
