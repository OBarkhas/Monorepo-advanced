'use client';

import { useMutation } from '@apollo/client/react';
import { ChangeEvent, useState } from 'react';
import { Button, Input } from '@hop-advanced-monorepo/shadcn';
import { CREATE_TODO } from '../graphql/todo';

interface CreateTodoProps {
  userId: string;
}

interface TodoFormState {
  title: string;
  description: string;
  xpReward: number;
}

export const CreateTodo = ({ userId }: CreateTodoProps) => {
  const [formState, setFormState] = useState<TodoFormState>({
    title: '',
    description: '',
    xpReward: 0,
  });

  const [createTodo, { loading, error }] = useMutation(CREATE_TODO, {
    refetchQueries: ['GET_TODO'],
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    setFormState((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const onSubmit = async () => {
    try {
      await createTodo({
        variables: {
          input: {
            title: formState.title,
            description: formState.description,
            xpReward: formState.xpReward,
            userId: userId,
          },
        },
      });

      setFormState({ title: '', description: '', xpReward: 0 });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-md p-4">
      <div>
        <label className="text-sm font-medium block mb-1">Title</label>
        <Input
          name="title"
          value={formState.title}
          onChange={handleInputChange}
          placeholder="Todo title"
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Description</label>
        <Input
          name="description"
          value={formState.description}
          onChange={handleInputChange}
          placeholder="Todo description"
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">XP Reward</label>
        <Input
          name="xpReward"
          type="number"
          value={formState.xpReward || ''}
          onChange={handleInputChange}
          placeholder="100"
        />
      </div>

      <Button onClick={onSubmit} disabled={loading} className="mt-2">
        {loading ? 'Adding...' : 'Add Todo'}
      </Button>

      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
  );
};
