'use client';

import { CreateUser } from './components/CreateUser';
import { GetUser } from './components/GetUser';

const Page = () => {
  return (
    <div>
      <CreateUser />
      <GetUser />
    </div>
  );
};

export default Page;
