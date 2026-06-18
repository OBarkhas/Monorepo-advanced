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
      <Button onClick={handleCLick}>Back To Users</Button>
    </div>
  );
};
