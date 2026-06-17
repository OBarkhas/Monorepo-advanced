'use client';

import { useQuery } from '@apollo/client/react';
import { GET_USER } from '../graphql/user';

export const GetUser = () => {
  const { data, loading, error } = useQuery(GET_USER);

  const users = data?.getUsers || [];

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error</p>;

  return (
    <div>
      {users.map((user: any) => (
        <p key={user.id}>{user.name}</p>
      ))}
    </div>
  );
};
