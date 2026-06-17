'use client';
import { useMutation } from '@apollo/client/react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@hop-advanced-monorepo/shadcn';
import { ChangeEvent, useState } from 'react';
import { CREATE_USER } from '../graphql/user';

export const CreateUser = () => {
  const [userName, setUserName] = useState<string>('');

  const onChangeName = (e: ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
  };

  const [createUser, { data, loading, error }] = useMutation(CREATE_USER);

  const onSubmit = async () => {
    const res = await createUser({
      variables: {
        name: userName,
      },
    });
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Insert your name</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <Input value={userName} onChange={onChangeName} />
        <Button onClick={onSubmit}>Submit</Button>
      </CardContent>
    </Card>
  );
};
