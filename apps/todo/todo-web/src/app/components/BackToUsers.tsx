'use client';
import { Button } from '@hop-advanced-monorepo/shadcn';
import { useRouter } from 'next/navigation';

export const BackToUsers = () => {
  const router = useRouter();
  const handleCLick = () => {
    router.push('/');
  };

  return (
    <div>
      <Button
        onClick={handleCLick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          borderRadius: '10px',
          padding: '8px 16px',
          fontSize: '13px',
          fontWeight: 500,
          color: '#7a7a7a',
          background: '#eceae7',
          border: 'none',
          cursor: 'pointer',
          boxShadow: 'none',
          transition: 'background 0.15s, color 0.15s',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = '#e2e0dc';
          (e.currentTarget as HTMLButtonElement).style.color = '#2d2d2d';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = '#eceae7';
          (e.currentTarget as HTMLButtonElement).style.color = '#7a7a7a';
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          style={{ flexShrink: 0 }}
        >
          <path
            d="M9 11L5 7l4-4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back to users
      </Button>
    </div>
  );
};
