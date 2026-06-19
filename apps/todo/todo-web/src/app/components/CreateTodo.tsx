'use client';

import { useMutation } from '@apollo/client/react';
import { ChangeEvent, useState } from 'react';
import { Button, Input } from '@hop-advanced-monorepo/shadcn';
import { CREATE_TODO, GET_TODO } from '../graphql/todo';

interface CreateTodoProps {
  userId: string;
}

interface TodoFormState {
  title: string;
  description: string;
  xpReward: number;
}

type SubmitStatus = 'idle' | 'success' | 'error';

interface CreateTodoData {
  createTodo: {
    __typename: string;
    message: string;
  };
}

export const CreateTodo = ({ userId }: CreateTodoProps) => {
  const [formState, setFormState] = useState<TodoFormState>({
    title: '',
    description: '',
    xpReward: 0,
  });

  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');

  const [createTodo, { loading, error }] = useMutation<CreateTodoData>(
    CREATE_TODO,
    {
      optimisticResponse: {
        createTodo: { __typename: 'Response', message: 'temp' },
      },

      update(cache, result, { variables }) {
        try {
          const isRealResponse =
            result.data?.createTodo &&
            result.data.createTodo.message !== 'temp';
          if (isRealResponse) return;

          const existing = cache.readQuery<{ getTodo: any[] }>({
            query: GET_TODO,
            variables: { userId: variables?.input?.userId },
          });

          if (existing?.getTodo) {
            const tempId = `temp-${variables?.input?.title}-${variables?.input?.userId}`;
            const alreadyExists = existing.getTodo.some(
              (t: any) => t.id === tempId,
            );
            if (alreadyExists) return;

            cache.writeQuery({
              query: GET_TODO,
              variables: { userId: variables?.input?.userId },
              data: {
                getTodo: [
                  ...existing.getTodo,
                  {
                    __typename: 'Todo',
                    id: tempId,
                    title: variables?.input?.title,
                    description: variables?.input?.description || null,
                    xpReward: variables?.input?.xpReward || 0,
                    isCompleted: false,
                  },
                ],
              },
            });
          }
        } catch (err) {
          console.error(err);
        }
      },
      refetchQueries: ['GET_TODO'],
    },
  );

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setSubmitStatus('idle');
    setFormState((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const onSubmit = async () => {
    if (!formState.title.trim()) return;

    const snapshot = { ...formState };
    setFormState({ title: '', description: '', xpReward: 0 });

    try {
      await createTodo({
        variables: {
          input: {
            title: snapshot.title,
            description: snapshot.description,
            xpReward: snapshot.xpReward,
            userId,
          },
        },
      });

      setSubmitStatus('success');
      setTimeout(() => setSubmitStatus('idle'), 2500);
    } catch (err) {
      console.error(err);
      setFormState(snapshot);
      setSubmitStatus('error');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxWidth: '420px',
        padding: '28px',
        background: '#f8f7f5',
        borderRadius: '18px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        fontFamily: 'inherit',
      }}
    >
      <div style={{ marginBottom: '4px' }}>
        <h2
          style={{
            margin: 0,
            fontSize: '17px',
            fontWeight: 600,
            color: '#2d2d2d',
            letterSpacing: '-0.01em',
          }}
        >
          New todo
        </h2>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#9a9a9a' }}>
          Fill in the details below
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label
          style={{ fontSize: '13px', fontWeight: 500, color: '#555' }}
          htmlFor="title"
        >
          Title
        </label>
        <Input
          id="title"
          name="title"
          value={formState.title}
          onChange={handleInputChange}
          placeholder="What needs to be done?"
          style={inputStyle}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label
          style={{ fontSize: '13px', fontWeight: 500, color: '#555' }}
          htmlFor="description"
        >
          Description{' '}
          <span style={{ color: '#bbb', fontWeight: 400, marginLeft: '4px' }}>
            (optional)
          </span>
        </label>
        <Input
          id="description"
          name="description"
          value={formState.description}
          onChange={handleInputChange}
          placeholder="Add more context…"
          style={inputStyle}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label
          style={{ fontSize: '13px', fontWeight: 500, color: '#555' }}
          htmlFor="xpReward"
        >
          XP Reward
        </label>
        <Input
          id="xpReward"
          name="xpReward"
          type="number"
          value={formState.xpReward || ''}
          onChange={handleInputChange}
          placeholder="0"
          style={{ ...inputStyle, width: '120px' }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginTop: '4px',
        }}
      >
        <Button
          onClick={onSubmit}
          disabled={loading || !formState.title.trim()}
          style={{
            borderRadius: '10px',
            padding: '10px 22px',
            fontSize: '14px',
            fontWeight: 500,
            background:
              submitStatus === 'success'
                ? '#d1ead4'
                : loading
                  ? '#e8e6e3'
                  : '#2d2d2d',
            color:
              submitStatus === 'success'
                ? '#2e7d45'
                : loading
                  ? '#aaa'
                  : '#fff',
            border: 'none',
            cursor:
              loading || !formState.title.trim() ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s, color 0.2s, transform 0.1s',
            transform: loading ? 'scale(0.98)' : 'scale(1)',
            boxShadow: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {loading
            ? 'Adding…'
            : submitStatus === 'success'
              ? '✓ Added'
              : 'Add todo'}
        </Button>

        {submitStatus === 'success' && (
          <span
            style={{
              fontSize: '13px',
              color: '#7cbb8a',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            Todo added!
          </span>
        )}
        {submitStatus === 'error' && error && (
          <span style={{ fontSize: '13px', color: '#d08080' }}>
            {error.message}
          </span>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const inputStyle = {
  borderRadius: '10px',
  border: '1.5px solid #e8e6e3',
  background: '#fff',
  padding: '10px 14px',
  fontSize: '14px',
  color: '#2d2d2d',
  outline: 'none',
  transition: 'border-color 0.15s',
  boxShadow: 'none',
};
