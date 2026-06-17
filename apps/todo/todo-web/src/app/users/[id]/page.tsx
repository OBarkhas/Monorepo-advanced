import { CreateTodo } from '../../components/CreateTodo';
import { GetTodo } from '../../components/GetTodo';

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

const UserPage = async ({ params }: PageProps) => {
  const resolvedParams = await params;
  const userId = resolvedParams.id;

  return (
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
      <h1>Хэрэглэгчийн Хуудас (ID: {userId})</h1>

      <section
        style={{ borderBottom: '1px solid #eee', paddingBottom: '24px' }}
      >
        <h2>Шинэ ажил нэмэх</h2>
        <CreateTodo userId={userId} />
      </section>

      <section>
        <h2>Хийх ажлын жагсаалт</h2>
        <GetTodo userId={userId} />
      </section>
    </div>
  );
};

export default UserPage;
