import React from 'react';
import { COMPLETE_TODO, GET_USER_PROFILE } from '../graphql/todo';
import { useMutation, useQuery } from '@apollo/client/react';
import { DeleteTodo } from './DeleteTodo';

interface ProfileProps {
  userId: string;
}

export const CompleteTodo: React.FC<ProfileProps> = ({ userId }) => {
  const { loading, error, data, refetch } = useQuery(GET_USER_PROFILE, {
    variables: { id: userId },
  });

  const [completeTodo, { loading: mutating }] = useMutation(COMPLETE_TODO, {
    onCompleted: (mutationData: any) => {
      if (!mutationData || !mutationData.completeTodo) return;

      const res = mutationData.completeTodo;

      alert(res.message);

      if (res.leveledUp) {
        alert(`You leveled up`);
      }

      refetch();
    },
    onError: (err) => {
      alert(`error: ${err.message}`);
    },
  });

  if (loading) return <p>loading</p>;
  if (error) return <p>error:{error.message}</p>;

  const user = (data as any)?.getUserById;
  if (!user) return <p>user not found</p>;

  return (
    <div
      style={{
        padding: '20px',
        maxWidth: '600px',
        margin: '0 auto',
        fontFamily: 'sans-serif',
      }}
    >
      <h3>my quest (Quests)</h3>
      {!user.todos || user.todos.length === 0 ? (
        <p>no quests found</p>
      ) : (
        user.todos.map((todo: any) => (
          <div
            key={todo.id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: todo.isCompleted ? '#f9f9f9' : '#fff',
              opacity: todo.isCompleted ? 0.7 : 1,
            }}
          >
            <div>
              <h4
                style={{
                  margin: '0 0 5px 0',
                  textDecoration: todo.isCompleted ? 'line-through' : 'none',
                }}
              >
                {todo.title}
              </h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                {todo.description}
              </p>
              <span
                style={{
                  fontSize: '12px',
                  color: '#e67e22',
                  fontWeight: 'bold',
                }}
              >
                +{todo.xpReward} XP
              </span>
            </div>

            <button
              onClick={() => {
                completeTodo({
                  variables: { userId: user.id, todoId: todo.id },
                });
              }}
              disabled={todo.isCompleted || mutating}
              style={{
                backgroundColor: todo.isCompleted ? '#2ecc71' : '#3498db',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '5px',
                cursor: todo.isCompleted ? 'not-allowed' : 'pointer',
              }}
            >
              {todo.isCompleted ? 'done' : 'do'}
            </button>
            <DeleteTodo todoId={todo.id} onDeleted={refetch} />
          </div>
        ))
      )}
    </div>
  );
};
