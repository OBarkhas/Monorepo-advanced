'use client';

import { useMutation } from '@apollo/client/react';
import { DELETE_TODO } from '../graphql/todo';

interface DeleteTodoProps {
  todoId: string;
  onDeleted?: () => void;
}

export const DeleteTodo = ({ todoId, onDeleted }: DeleteTodoProps) => {
  const [deleteTodo, { loading }] = useMutation(DELETE_TODO);

  const handleDelete = async () => {
    try {
      await deleteTodo({
        variables: {
          id: todoId,
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
