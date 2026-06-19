'use client';

import React, { useState } from 'react';
import { COMPLETE_TODO } from '../graphql/todo';
import { useMutation } from '@apollo/client/react';
import { DeleteTodo } from './DeleteTodo';

interface CompleteTodoProps {
  userId: string;
  todos: any[];
  onTodoMutation: () => void;
}

export const CompleteTodo: React.FC<CompleteTodoProps> = ({
  userId,
  todos,
  onTodoMutation,
}) => {
  const [optimisticCompleted, setOptimisticCompleted] = useState<Set<string>>(
    new Set(),
  );
  const [completeTodo, { loading: mutating }] = useMutation(COMPLETE_TODO);

  const handleComplete = async (todoId: string) => {
    setOptimisticCompleted((prev) => new Set(prev).add(todoId));
    try {
      await completeTodo({ variables: { userId, todoId } });
      onTodoMutation();
    } catch {
    } finally {
      setOptimisticCompleted((prev) => {
        const next = new Set(prev);
        next.delete(todoId);
        return next;
      });
    }
  };

  const isEffectivelyCompleted = (t: any) =>
    t.isCompleted || optimisticCompleted.has(t.id);

  const pending = todos.filter((t: any) => !isEffectivelyCompleted(t));
  const done = todos.filter((t: any) => isEffectivelyCompleted(t));

  return (
    <div style={{ position: 'relative' }}>
      {pending.length > 0 && (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {pending.map((todo: any, index: number) => (
            <li
              key={todo.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 28px',
                borderBottom:
                  index < pending.length - 1 || done.length > 0
                    ? '1px solid #eeece9'
                    : 'none',
                background: '#fff',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLLIElement).style.background =
                  '#fdfcfb')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLLIElement).style.background = '#fff')
              }
            >
              <button
                onClick={() => handleComplete(todo.id)}
                disabled={mutating || optimisticCompleted.has(todo.id)}
                title="Mark complete"
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  border: '2px solid #d0cdc8',
                  background: 'transparent',
                  cursor:
                    mutating || optimisticCompleted.has(todo.id)
                      ? 'not-allowed'
                      : 'pointer',
                  flexShrink: 0,
                  transition: 'border-color 0.15s',
                  padding: 0,
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.borderColor =
                    '#a8c5b0')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.borderColor =
                    '#d0cdc8')
                }
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#2d2d2d',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {todo.title}
                </p>
                {todo.description && (
                  <p
                    style={{
                      margin: '2px 0 0',
                      fontSize: '12px',
                      color: '#9a9a9a',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {todo.description}
                  </p>
                )}
              </div>

              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#9a8a6a',
                  background: '#f5f0e8',
                  borderRadius: '99px',
                  padding: '3px 9px',
                  flexShrink: 0,
                  letterSpacing: '0.02em',
                }}
              >
                +{todo.xpReward} XP
              </span>

              <div style={{ flexShrink: 0 }}>
                <DeleteTodo todoId={todo.id} onDeleted={onTodoMutation} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {done.length > 0 && (
        <>
          <div
            style={{
              padding: '6px 28px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#b0ada8',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: '#f2f0ed',
              borderBottom: '1px solid #eeece9',
            }}
          >
            Completed
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {done.map((todo: any, index: number) => (
              <li
                key={todo.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 28px',
                  borderBottom:
                    index < done.length - 1 ? '1px solid #eeece9' : 'none',
                  opacity: 0.55,
                }}
              >
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: '#a8c5b0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path
                      d="M1 4l3 3 5-6"
                      stroke="#fff"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#2d2d2d',
                      textDecoration: 'line-through',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {todo.title}
                  </p>
                </div>

                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#b0ada8',
                    background: '#eeece9',
                    borderRadius: '99px',
                    padding: '3px 9px',
                    flexShrink: 0,
                  }}
                >
                  +{todo.xpReward} XP
                </span>

                <div style={{ flexShrink: 0 }}>
                  <DeleteTodo todoId={todo.id} onDeleted={onTodoMutation} />
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};
