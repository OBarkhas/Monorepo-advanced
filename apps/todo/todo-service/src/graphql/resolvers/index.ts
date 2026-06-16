import * as Mutations from './mutations';
import * as Query from './queries';

export const resolvers = {
  Query: {
    getUsers: Query.getUsers,
  },
  Mutation: {
    createUser: Mutations.createUser,
  },
};
