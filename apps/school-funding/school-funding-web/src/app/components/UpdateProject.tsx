'use client';

import { useState, useEffect } from 'react';
import { TypedDocumentNode } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '@clerk/nextjs';
import gql from 'graphql-tag';

type ProjectStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FUNDED';

type Project = {
  id: string;
  title: string;
  description: string;
  images: string[];
  status: ProjectStatus;
  creatorId: string;
};

type UpdateProjectArgs = {
  id: string;
  title?: string;
  description?: string;
  images?: string[];
  creatorId: string;
};

const GET_PROJECT_BY_ID: TypedDocumentNode<
  { getProjectById: Project | null },
  { id: string }
> = gql`
  query GetProjectById($id: ID!) {
    getProjectById(id: $id) {
      id
      title
      description
      images
      status
      creatorId
    }
  }
`;

const UPDATE_PROJECT: TypedDocumentNode<
  { updateProject: Project },
  UpdateProjectArgs
> = gql`
  mutation UpdateProject(
    $id: ID!
    $title: String
    $description: String
    $images: [String!]
    $creatorId: ID!
  ) {
    updateProject(
      id: $id
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

interface UpdateProjectFormProps {
  projectId: string;
  onSuccess?: () => void;
}

export function UpdateProjectForm({
  projectId,
  onSuccess,
}: UpdateProjectFormProps) {
  const { userId, isLoaded } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { data: queryData, loading: queryLoading } = useQuery(
    GET_PROJECT_BY_ID,
    {
      variables: { id: projectId },
      skip: !userId,
    },
  );

  const [updateProject, { loading: mutationLoading, data: mutationData }] =
    useMutation(UPDATE_PROJECT);

  useEffect(() => {
    if (queryData?.getProjectById) {
      setTitle(queryData.getProjectById.title);
      setDescription(queryData.getProjectById.description);
    }
  }, [queryData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !queryData?.getProjectById) return;

    try {
      setErrorMessage('');
      await updateProject({
        variables: {
          id: projectId,
          title,
          description,
          images: queryData.getProjectById.images,
          creatorId: userId,
        },
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update the project.');
    }
  };

  if (!isLoaded || queryLoading) {
    return <p>Loading...</p>;
  }

  if (!userId) {
    return <p>Please sign in to update this project.</p>;
  }

  const project = queryData?.getProjectById;
  if (!project) {
    return <p>Project not found.</p>;
  }

  return (
    <div className="max-w-md mx-auto mt-6 p-6 border rounded-lg shadow bg-white">
      <h2 className="text-xl font-bold mb-4">Update Project</h2>

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
          disabled={mutationLoading}
          className="w-full bg-blue-600 text-white p-2 rounded disabled:bg-gray-400"
        >
          {mutationLoading ? 'Updating...' : 'Update Project'}
        </button>
      </form>

      {errorMessage && (
        <p className="mt-4 p-2 bg-red-50 text-red-500 border border-red-200 rounded text-sm">
          {errorMessage}
        </p>
      )}

      {mutationData && (
        <p className="mt-4 p-2 bg-green-50 text-green-600 border border-green-200 rounded text-sm">
          Project updated successfully! Status is now{' '}
          {mutationData.updateProject.status}.
        </p>
      )}
    </div>
  );
}
