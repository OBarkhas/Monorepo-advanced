'use client';

import { useQuery } from '@apollo/client/react';
import { GET_USER } from '../graphql/user';
import { DeleteUser } from './DeleteUser';
import { useRouter } from 'next/navigation';

const isOptimistic = (id: string) =>
  id ? String(id).startsWith('temp-') : false;

export const GetUser = () => {
  const { data, loading, error, refetch } = useQuery(GET_USER);
  const router = useRouter();

  const users = [...(data?.getUsers || [])].sort((a: any, b: any) =>
    (a.name || '').localeCompare(b.name || ''),
  );

  const grouped: Record<string, any[]> = users.reduce(
    (acc: Record<string, any[]>, user: any) => {
      const letter = (user.name?.[0] ?? '#').toUpperCase();
      if (!acc[letter]) acc[letter] = [];
      acc[letter].push(user);
      return acc;
    },
    {},
  );

  if (loading)
    return (
      <div
        style={{
          maxWidth: '420px',
          padding: '28px',
          background: '#f8f7f5',
          borderRadius: '18px',
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          fontSize: '13px',
          color: '#9a9a9a',
        }}
      >
        Loading users…
      </div>
    );

  if (error)
    return (
      <div
        style={{
          maxWidth: '420px',
          padding: '28px',
          background: '#f8f7f5',
          borderRadius: '18px',
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          fontSize: '13px',
          color: '#d08080',
        }}
      >
        Something went wrong.
      </div>
    );

  return (
    <div
      style={{
        maxWidth: '420px',
        background: '#f8f7f5',
        borderRadius: '18px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '24px 28px 16px',
          borderBottom: '1px solid #eeece9',
        }}
      >
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
            Users
          </h2>

          <button
            onClick={() => refetch()}
            style={{
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
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#eeece9')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
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

        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#9a9a9a' }}>
          {users.length} {users.length === 1 ? 'user' : 'users'}
        </p>
      </div>

      {users.length === 0 && (
        <div
          style={{
            padding: '32px 28px',
            fontSize: '13px',
            color: '#bbb',
            textAlign: 'center',
          }}
        >
          No users yet.
        </div>
      )}

      {Object.entries(grouped).map(([letter, group]) => (
        <div key={letter}>
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
            {letter}
          </div>

          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {group.map((user: any, index: number) => {
              const pending = isOptimistic(user.id);

              return (
                <li
                  key={user.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '13px 28px',
                    borderBottom:
                      index < group.length - 1 ? '1px solid #eeece9' : 'none',
                    transition: 'background 0.15s',
                    opacity: pending ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!pending)
                      (e.currentTarget as HTMLLIElement).style.background =
                        '#f2f0ed';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLLIElement).style.background =
                      'transparent';
                  }}
                >
                  <div
                    onClick={() => {
                      if (pending) return;
                      router.push(`/users/${user.id}`);
                    }}
                    style={{
                      cursor: pending ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#e8e6e3',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#7a7a7a',
                        flexShrink: 0,
                        textTransform: 'uppercase',
                      }}
                    >
                      {pending ? (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          style={{ animation: 'spin 0.8s linear infinite' }}
                        >
                          <circle
                            cx="7"
                            cy="7"
                            r="5.5"
                            stroke="#c0bdb8"
                            strokeWidth="1.5"
                            strokeDasharray="24"
                            strokeDashoffset="8"
                            strokeLinecap="round"
                          />
                        </svg>
                      ) : (
                        (user.name?.[0] ?? '?')
                      )}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#2d2d2d',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'block',
                        }}
                      >
                        {user.name}
                      </span>
                      {pending && (
                        <span
                          style={{
                            fontSize: '11px',
                            color: '#b0ada8',
                            display: 'block',
                          }}
                        >
                          Saving…
                        </span>
                      )}
                    </div>
                  </div>

                  {!pending && (
                    <div style={{ flexShrink: 0, marginLeft: '12px' }}>
                      <DeleteUser userId={user.id} onDeleted={refetch} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
