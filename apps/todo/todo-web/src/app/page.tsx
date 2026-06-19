'use client';

import { CreateUser } from './components/CreateUser';
import { GetUser } from './components/GetUser';

const Page = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f2f0ed',
        padding: '48px 24px 64px',
      }}
    >
      <div style={{ maxWidth: '900px', margin: '0 auto 32px' }}>
        <h1
          style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: 700,
            color: '#2d2d2d',
            letterSpacing: '-0.02em',
          }}
        >
          Users
        </h1>
        <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#9a9a9a' }}>
          Create and manage your users
        </p>
      </div>

      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          alignItems: 'start',
        }}
      >
        <CreateUser />
        <GetUser />
      </div>
    </div>
  );
};

export default Page;
