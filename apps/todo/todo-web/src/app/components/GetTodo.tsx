'use client';

import { useQuery } from '@apollo/client/react';
import { GET_TODO } from '../graphql/todo';
import { CompleteTodo } from './CompleteTodo';
export const GetTodo = ({ userId }: { userId: string }) => {
  const { data, loading, error } = useQuery(GET_TODO, {
    variables: { userId },
    skip: !userId,
  });
  const todos = data?.getTodo || [];

  if (loading) return <p>Loading...</p>;

  if (error) return <p>Error: {error.message}</p>;

  if (todos.length === 0) return <p>No todos found</p>;

  return <CompleteTodo userId={userId} />;
};
