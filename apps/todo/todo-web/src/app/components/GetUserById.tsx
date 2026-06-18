'use client';

import { useQuery } from '@apollo/client/react';
import { GET_USER_BY_ID } from '../graphql/user';

export const GetUserById = ({ userId }: { userId: string }) => {
  const { data, loading, error } = useQuery(GET_USER_BY_ID, {
    variables: { id: userId },
  });

  const user = data?.getUserById;

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error</p>;
  if (!user) return <p>User not found</p>;

  return (
    <div>
      <h1>{user.name}</h1>
      <h1>{user.xp}</h1>
      <h1>{user.level}</h1>
    </div>
  );
};
