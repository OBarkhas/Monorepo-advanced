'use client';

import { useQuery } from '@apollo/client/react';
import { GET_TODO } from '../graphql/todo';

export const GetTodo = ({ userId }: { userId: string }) => {
  const { data, loading, error } = useQuery(GET_TODO, {
    variables: { userId },
    skip: !userId,
  });

  const todos = data?.getTodo || [];

  if (loading) return <p>Loading...</p>;

  if (error) return <p>Error: {error.message}</p>;

  if (todos.length === 0) return <p>No todos found.</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {todos.map((todo: any) => (
        <div
          key={todo.id}
          style={{
            border: '1px solid #ccc',
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: todo.isCompleted ? '#f0f0f0' : '#fff',
            opacity: todo.isCompleted ? 0.7 : 1,
          }}
        >
          <h3
            style={{
              margin: '0 0 8px 0',
              textDecoration: todo.isCompleted ? 'line-through' : 'none',
            }}
          >
            {todo.title}
          </h3>

          {todo.description && (
            <p style={{ color: '#666', fontSize: '14px', margin: '0 0 8px 0' }}>
              {todo.description}
            </p>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            <span style={{ color: '#4CAF50' }}>Reward: {todo.xpReward} XP</span>
            <span>{todo.isCompleted ? ' Completed' : 'In Progress'}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
