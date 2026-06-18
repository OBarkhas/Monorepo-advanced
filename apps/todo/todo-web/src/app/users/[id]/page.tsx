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
    <div>
      <BackToUsers />
      <div
        style={{
          padding: '24px',
          maxWidth: '600px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
        }}
      >
        <GetUserById userId={userId} />
        <section
          style={{ borderBottom: '1px solid #eee', paddingBottom: '24px' }}
        >
          <h2>Add new todo</h2>
          <CreateTodo userId={userId} />
        </section>

        <section>
          <h2>Todo list</h2>
          <GetTodo userId={userId} />
        </section>
      </div>
    </div>
  );
};

export default UserPage;
