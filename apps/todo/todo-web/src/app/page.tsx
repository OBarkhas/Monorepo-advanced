'use client';

import { useRouter } from 'next/navigation';
import { GET_USER } from './graphql/user';
import { useQuery } from '@apollo/client/react';

const Page = () => {
  const { data, loading, error } = useQuery(GET_USER);
  const router = useRouter();

  const users = data?.getUsers || [];

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error</p>;

  return (
    <div>
      {users.map((user: any) => (
        <div
          key={user.id}
          onClick={() => router.push(`/users/${user.id}`)}
          style={{ cursor: 'pointer' }}
        >
          <div>{user.name}</div>
          <div>{user.id}</div>
        </div>
      ))}
    </div>
  );
};

export default Page;
