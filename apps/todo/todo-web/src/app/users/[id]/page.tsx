import { BackToUsers } from '../../components/BackToUsers';
import { CreateTodo } from '../../components/CreateTodo';
import { GetTodo } from '../../components/GetTodo';
import { GetUserById } from '../../components/GetUserById';

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

const UserPage = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  const userId = resolvedParams.id;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f2f0ed',
        padding: '32px 24px 64px',
      }}
    >
      <div style={{ maxWidth: '480px', margin: '0 auto 24px' }}>
        <BackToUsers />
      </div>

      <div
        style={{
          maxWidth: '480px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <GetUserById userId={userId} />

        <CreateTodo userId={userId} />

        <GetTodo userId={userId} />
      </div>
    </div>
  );
};

export default UserPage;
