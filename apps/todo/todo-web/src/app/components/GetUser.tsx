'use client';

import { useQuery } from '@apollo/client/react';
import { GET_USER } from '../graphql/user';
import { DeleteUser } from './DeleteUser';
import { useRouter } from 'next/navigation';

export const GetUser = () => {
  const { data, loading, error, refetch } = useQuery(GET_USER);
  const router = useRouter();
  const users = data?.getUsers || [];

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error</p>;

  return (
    <div>
      {users.map((user: any) => (
        <div key={user.id}>
          <div
            key={user.id}
            onClick={() => router.push(`/users/${user.id}`)}
            style={{ cursor: 'pointer' }}
          >
            <p key={user.id}>{user.name}</p>
          </div>
          <DeleteUser userId={user.id} onDeleted={refetch} />;
        </div>
      ))}
    </div>
  );
};
