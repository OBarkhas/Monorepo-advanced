'use client';

import { useQuery } from '@apollo/client/react';
import { GET_USER_BY_ID } from '../graphql/user';
import { useState, useEffect, useRef } from 'react';

const xpForLevel = (level: number): number => {
  return (100 * level * (level - 1)) / 2;
};

export const GetUserById = ({ userId }: { userId: string }) => {
  const { data, loading, error, refetch } = useQuery(GET_USER_BY_ID, {
    variables: { id: userId },
    skip: !userId,
  });

  const user = data?.getUserById;

  const [showLevelUp, setShowLevelUp] = useState(false);
  const prevLevelRef = useRef<number | null>(null);

  useEffect(() => {
    if (user?.level) {
      if (prevLevelRef.current !== null && user.level > prevLevelRef.current) {
        setShowLevelUp(true);
        const timer = setTimeout(() => setShowLevelUp(false), 4000);
        return () => clearTimeout(timer);
      }
      prevLevelRef.current = user.level;
    }
  }, [user?.level]);

  if (loading)
    return (
      <div style={cardStyle}>
        <p style={{ fontSize: '13px', color: '#9a9a9a', margin: 0 }}>
          Loading…
        </p>
      </div>
    );

  if (error)
    return (
      <div style={cardStyle}>
        <p style={{ fontSize: '13px', color: '#d08080', margin: 0 }}>
          Something went wrong.
        </p>
      </div>
    );

  if (!user)
    return (
      <div style={cardStyle}>
        <p style={{ fontSize: '13px', color: '#bbb', margin: 0 }}>
          User not found.
        </p>
      </div>
    );

  const currentLevelStartXp = xpForLevel(user.level);
  const nextLevelStartXp = xpForLevel(user.level + 1);

  const xpIntoLevel = user.xp - currentLevelStartXp;
  const xpNeeded = nextLevelStartXp - currentLevelStartXp;

  const progress =
    xpNeeded > 0
      ? Math.min(100, Math.max(0, Math.round((xpIntoLevel / xpNeeded) * 100)))
      : 0;

  return (
    <div style={{ position: 'relative', maxWidth: '420px' }}>
      {showLevelUp && (
        <div
          style={{
            position: 'absolute',
            top: '-65px',
            left: 0,
            right: 0,
            background: '#e2f4e5',
            border: '1px solid #a8c5b0',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            animation: 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            zIndex: 10,
          }}
        >
          <span style={{ fontSize: '18px' }}>🎉</span>
          <div>
            <p
              style={{
                margin: 0,
                fontSize: '13px',
                fontWeight: 600,
                color: '#2e7d45',
              }}
            >
              Level Up!
            </p>
            <p
              style={{ margin: '2px 0 0', fontSize: '11px', color: '#599c6b' }}
            >
              Congrats you are now {user.level} level! Keep Going!
            </p>
          </div>
        </div>
      )}

      <div style={cardStyle}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: '#e8e6e3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 700,
                color: '#7a7a7a',
                textTransform: 'uppercase',
                flexShrink: 0,
              }}
            >
              {user.name?.[0] ?? '?'}
            </div>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#2d2d2d',
                  letterSpacing: '-0.02em',
                }}
              >
                {user.name}
              </h1>
              <p
                style={{
                  margin: '2px 0 0',
                  fontSize: '13px',
                  color: '#9a9a9a',
                }}
              >
                Level {user.level}
              </p>
            </div>
          </div>

          <button
            onClick={() => refetch()}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '11px',
              color: '#a8c5b0',
              fontWeight: 600,
              padding: '6px 10px',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'background 0.15s',
              marginTop: '-15px',
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

        <div
          style={{ height: '1px', background: '#eeece9', margin: '20px 0' }}
        />

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={statBox}>
            <span style={statLabel}>Total XP</span>
            <span style={statValue}>{user.xp.toLocaleString()}</span>
          </div>
          <div style={statBox}>
            <span style={statLabel}>Level</span>
            <span style={statValue}>{user.level}</span>
          </div>
          <div style={statBox}>
            <span style={statLabel}>Todos</span>
            <span style={statValue}>{user.todos?.length ?? 0}</span>
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '6px',
            }}
          >
            <span style={{ fontSize: '12px', color: '#9a9a9a' }}>
              Progress to level {user.level + 1}
            </span>
            <span style={{ fontSize: '12px', color: '#9a9a9a' }}>
              {xpIntoLevel} / {xpNeeded} XP
            </span>
          </div>
          <div
            style={{
              height: '7px',
              borderRadius: '99px',
              background: '#e8e6e3',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                borderRadius: '99px',
                background: '#a8c5b0',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

const cardStyle: React.CSSProperties = {
  width: '100%',
  padding: '28px',
  background: '#f8f7f5',
  borderRadius: '18px',
  boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
};

const statBox: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  background: '#fff',
  borderRadius: '12px',
  padding: '12px 14px',
  border: '1px solid #eeece9',
};

const statLabel: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#b0ada8',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};

const statValue: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 700,
  color: '#2d2d2d',
  letterSpacing: '-0.02em',
};
