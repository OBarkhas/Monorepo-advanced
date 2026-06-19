'use client';

import { useQuery } from '@apollo/client/react';
import { GET_TODO } from '../graphql/todo';
import { CompleteTodo } from './CompleteTodo';

export const GetTodo = ({ userId }: { userId: string }) => {
  const { data, loading, error, refetch } = useQuery(GET_TODO, {
    variables: { userId },
    skip: !userId,
  });

  const todos = data?.getTodo || [];

  if (loading)
    return (
      <div style={cardStyle}>
        <p style={{ fontSize: '13px', color: '#9a9a9a', margin: 0 }}>
          Loading todos…
        </p>
      </div>
    );

  if (error)
    return (
      <div style={cardStyle}>
        <p style={{ fontSize: '13px', color: '#d08080', margin: 0 }}>
          {error.message}
        </p>
      </div>
    );

  if (todos.length === 0)
    return (
      <div style={cardStyle}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <p style={{ fontSize: '13px', color: '#bbb', margin: 0 }}>
            No todos yet. Add one above!
          </p>
          <button onClick={() => refetch()} style={refreshBtnStyle}>
            Refresh
          </button>
        </div>
      </div>
    );

  const completed = todos.filter((t: any) => t.isCompleted).length;

  return (
    <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
      <div
        style={{ padding: '24px 28px 16px', borderBottom: '1px solid #eeece9' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: '17px',
                  fontWeight: 600,
                  color: '#2d2d2d',
                  letterSpacing: '-0.01em',
                }}
              >
                Todos
              </h2>
              <button
                onClick={() => refetch()}
                style={refreshBtnStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = '#eeece9')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = 'none')
                }
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                Refresh
              </button>
            </div>
            <p
              style={{ margin: '4px 0 0', fontSize: '13px', color: '#9a9a9a' }}
            >
              {completed} of {todos.length} completed
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '2px',
            }}
          >
            <div
              style={{
                width: '72px',
                height: '6px',
                borderRadius: '99px',
                background: '#e8e6e3',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${todos.length ? Math.round((completed / todos.length) * 100) : 0}%`,
                  borderRadius: '99px',
                  background: '#a8c5b0',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
            <span
              style={{ fontSize: '12px', color: '#b0ada8', minWidth: '30px' }}
            >
              {todos.length ? Math.round((completed / todos.length) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      <CompleteTodo userId={userId} todos={todos} onTodoMutation={refetch} />
    </div>
  );
};

const cardStyle: React.CSSProperties = {
  maxWidth: '420px',
  padding: '28px',
  background: '#f8f7f5',
  borderRadius: '18px',
  boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
};

const refreshBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '11px',
  color: '#a8c5b0',
  fontWeight: 600,
  padding: '3px 8px',
  borderRadius: '6px',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  transition: 'background 0.15s, color 0.15s',
};
