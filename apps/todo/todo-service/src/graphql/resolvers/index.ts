import * as Mutation from './mutations';
import * as Query from './queries';

export const resolvers = {
  Query: {
    getUsers: Query.getUsers,
    getTodo: Query.getTodo,
  },
  Mutation: {
    createUser: Mutation.createUser,
    createTodo: Mutation.createTodo,
  },
};
