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
  type CompleteTodoResponse {
    message: String!
    xpGained: Int!
    leveledUp: Boolean!
    newLevel: Int!
    newXp: Int!
    currentLevelXp: Int!
    xpToNextLevel: Int!
  }

  type Mutation {
    createUser(name: String!): Response!
    createTodo(input: TodoInput!): Response!
    deleteTodo(id: ID!): String!
    deleteUser(userId: ID!): String!
    completeTodo(userId: ID!, todoId: ID!): CompleteTodoResponse!
  }
`;
