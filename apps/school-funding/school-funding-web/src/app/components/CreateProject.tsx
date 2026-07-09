'use client';

import { useState } from 'react';
import { TypedDocumentNode } from '@apollo/client';
import { useAuth } from '@clerk/nextjs';
import gql from 'graphql-tag';
import { Project, CreateProjectArgs } from '../types/types';
import { useMutation } from '@apollo/client/react';

const CREATE_PROJECT: TypedDocumentNode<
  { createProject: Project },
  CreateProjectArgs
> = gql`
  mutation CreateProject(
    $title: String!
    $description: String!
    $images: [String!]
    $creatorId: ID!
  ) {
    createProject(
      title: $title
      description: $description
      images: $images
      creatorId: $creatorId
    ) {
      id
      title
      description
      status
      creatorId
    }
  }
`;

export function CreateProject() {
  const { userId, isLoaded } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [createProject, { loading, error, data }] = useMutation(CREATE_PROJECT);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      await createProject({
        variables: {
          title,
          description,
          images: [],
          creatorId: userId,
        },
      });
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error(err);
    }
  };

  if (!isLoaded) {
    return <p>Loading authentication...</p>;
  }

  if (!userId) {
    return <p>Please sign in to create a project.</p>;
  }

  return (
    <div className="max-w-md mx-auto mt-6 p-6 border rounded-lg shadow bg-white">
      <h2 className="text-xl font-bold mb-4">Create New Project</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2 rounded"
            rows={4}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded disabled:bg-gray-400"
        >
          {loading ? 'Submitting...' : 'Submit Project'}
        </button>
      </form>

      {error && (
        <p className="mt-4 p-2 bg-red-50 text-red-500 border border-red-200 rounded text-sm">
          {error.message}
        </p>
      )}

      {data && (
        <p className="mt-4 p-2 bg-green-50 text-green-600 border border-green-200 rounded text-sm">
          Project "{data.createProject.title}" created successfully!
        </p>
      )}
    </div>
  );
}
