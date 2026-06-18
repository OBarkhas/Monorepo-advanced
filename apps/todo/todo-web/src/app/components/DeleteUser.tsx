'use client';

import { useMutation } from '@apollo/client/react';
import { DELETE_USER } from '../graphql/user';

interface DeleteUserProps {
  userId: string;
  onDeleted?: () => void;
}

export const DeleteUser = ({ userId, onDeleted }: DeleteUserProps) => {
  const [deleteUser, { loading }] = useMutation(DELETE_USER);

  const handleDelete = async () => {
    try {
      await deleteUser({
        variables: {
          userId,
        },
      });

      onDeleted?.();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button onClick={handleDelete} disabled={loading}>
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  );
};
