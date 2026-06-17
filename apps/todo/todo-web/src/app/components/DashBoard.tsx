import { CircleUserRound, House, Search, SquarePlus } from 'lucide-react';
import Link from 'next/link';
export const DashBoard = () => {
  return (
    <div>
      <div className="fixed bottom-0 flex justify-between w-screen bg-white  px-8 py-4">
        <Link href="/">
          <House />
        </Link>
        <Link href="/create-todo">
          <SquarePlus />
        </Link>
        <Link href="/search-user">
          <Search />
        </Link>
        <Link href="/users">
          <CircleUserRound />
        </Link>
      </div>
    </div>
  );
};
