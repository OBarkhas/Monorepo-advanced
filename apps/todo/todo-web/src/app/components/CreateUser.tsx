'use client';
import { useMutation } from '@apollo/client/react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@hop-advanced-monorepo/shadcn';
import { ChangeEvent, useState } from 'react';
import { CREATE_USER, GET_USER } from '../graphql/user';

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

interface CreateUserData {
  createUser: {
    __typename: string;
    message: string;
  };
}

export const CreateUser = () => {
  const [userName, setUserName] = useState<string>('');
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');

  const onChangeName = (e: ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
    if (submitStatus !== 'idle') setSubmitStatus('idle');
  };

  const [createUser] = useMutation<CreateUserData>(CREATE_USER, {
    optimisticResponse: {
      createUser: { __typename: 'Response', message: 'temp' },
    },

    update(cache, result, { variables }) {
      try {
        const isRealResponse =
          result.data?.createUser && result.data.createUser.message !== 'temp';
        if (isRealResponse) return;

        const existing = cache.readQuery<{ getUsers: any[] }>({
          query: GET_USER,
        });

        if (existing?.getUsers) {
          const tempId = `temp-${variables?.name}`;
          const alreadyExists = existing.getUsers.some(
            (u: any) => u.id === tempId,
          );
          if (alreadyExists) return;

          cache.writeQuery({
            query: GET_USER,
            data: {
              getUsers: [
                ...existing.getUsers,
                {
                  __typename: 'User',
                  id: tempId,
                  name: variables?.name,
                  xp: 0,
                  level: 1,
                  todos: [],
                },
              ],
            },
          });
        }
      } catch (err) {
        console.error('Cache update error:', err);
      }
    },
    refetchQueries: ['GET_USER'],
  });
  const onSubmit = async () => {
    if (!userName.trim()) return;

    const snapshot = userName;

    setUserName('');
    setSubmitStatus('loading');

    try {
      await createUser({ variables: { name: snapshot } });
      setSubmitStatus('success');
      setTimeout(() => setSubmitStatus('idle'), 2500);
    } catch {
      setUserName(snapshot);
      setSubmitStatus('error');
    }
  };

  return (
    <>
      <Card
        style={{
          maxWidth: '420px',
          background: '#f8f7f5',
          borderRadius: '18px',
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          border: 'none',
        }}
      >
        <CardHeader style={{ paddingBottom: '8px' }}>
          <CardTitle
            style={{
              fontSize: '17px',
              fontWeight: 600,
              color: '#2d2d2d',
              letterSpacing: '-0.01em',
            }}
          >
            Sign up
          </CardTitle>
          <CardDescription
            style={{ fontSize: '13px', color: '#9a9a9a', marginTop: '4px' }}
          >
            Insert your name
          </CardDescription>
        </CardHeader>

        <CardContent
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <Input
            value={userName}
            onChange={onChangeName}
            placeholder="Your name…"
            style={{
              borderRadius: '10px',
              border: '1.5px solid #e8e6e3',
              background: '#fff',
              padding: '10px 14px',
              fontSize: '14px',
              color: '#2d2d2d',
              outline: 'none',
              boxShadow: 'none',
              transition: 'border-color 0.15s',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Button
              onClick={onSubmit}
              disabled={submitStatus === 'loading' || !userName.trim()}
              style={{
                borderRadius: '10px',
                padding: '10px 22px',
                fontSize: '14px',
                fontWeight: 500,
                background:
                  submitStatus === 'success'
                    ? '#d1ead4'
                    : submitStatus === 'loading'
                      ? '#e8e6e3'
                      : '#2d2d2d',
                color:
                  submitStatus === 'success'
                    ? '#2e7d45'
                    : submitStatus === 'loading'
                      ? '#aaa'
                      : '#fff',
                border: 'none',
                cursor:
                  submitStatus === 'loading' || !userName.trim()
                    ? 'not-allowed'
                    : 'pointer',
                transition: 'background 0.2s, color 0.2s, transform 0.1s',
                transform:
                  submitStatus === 'loading' ? 'scale(0.98)' : 'scale(1)',
                boxShadow: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {submitStatus === 'loading'
                ? 'Creating…'
                : submitStatus === 'success'
                  ? '✓ Created'
                  : 'Submit'}
            </Button>

            {submitStatus === 'success' && (
              <span
                style={{
                  fontSize: '13px',
                  color: '#7cbb8a',
                  animation: 'fadeIn 0.2s ease',
                }}
              >
                User created!
              </span>
            )}
            {submitStatus === 'error' && (
              <span style={{ fontSize: '13px', color: '#d08080' }}>
                Something went wrong.
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};
