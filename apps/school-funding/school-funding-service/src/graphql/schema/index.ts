import gql from 'graphql-tag';
import { usertypeDefs } from './user.schema';
import { projectTypeDefs } from './project.schema';
import { commonTypeDefs } from './common.schema';

const baseTypeDefs = gql`
  type Query {
    _empty: String
  }
  type Mutation {
    _empty: String
  }
`;

export const typeDefs = [
  baseTypeDefs,
  commonTypeDefs,
  usertypeDefs,
  projectTypeDefs,
];
