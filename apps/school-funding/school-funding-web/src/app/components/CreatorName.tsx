'use client';

import { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import gql from 'graphql-tag';

type User = {
  id: string;
  userName: string;
};

const GET_USER_BY_ID: TypedDocumentNode<
  { getUserById: User | null },
  { id: string }
> = gql`
  query GetUserById($id: ID!) {
    getUserById(id: $id) {
      id
      userName
    }
  }
`;

export function CreatorName({ creatorId }: { creatorId: string }) {
  const { data, loading, error } = useQuery(GET_USER_BY_ID, {
    variables: { id: creatorId },
  });

  if (loading) return <span className="text-gray-400">Loading...</span>;
  if (error || !data?.getUserById)
    return <span className="text-gray-500">{creatorId}</span>;

  return <span>{data.getUserById.userName}</span>;
}
