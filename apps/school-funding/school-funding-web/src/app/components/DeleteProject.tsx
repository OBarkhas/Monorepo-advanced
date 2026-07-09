'use client';

import { useState } from 'react';
import { TypedDocumentNode } from '@apollo/client';
import { useAuth } from '@clerk/nextjs';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/client/react';

type Response = {
  success: boolean;
  message: string;
};

type DeleteProjectArgs = {
  projectId: string;
  userId: string;
};

const DELETE_PROJECT: TypedDocumentNode<
  { deleteProject: Response },
  DeleteProjectArgs
> = gql`
  mutation DeleteProject($projectId: ID!, $userId: ID!) {
    deleteProject(projectId: $projectId, userId: $userId) {
      success
      message
    }
  }
`;

interface DeleteProjectButtonProps {
  projectId: string;
  onSuccess?: () => void;
}

export function DeleteProjectButton({
  projectId,
  onSuccess,
}: DeleteProjectButtonProps) {
  const { userId, isLoaded } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');

  const [deleteProject, { loading }] = useMutation(DELETE_PROJECT, {
    update(cache, { data }) {
      if (data?.deleteProject.success) {
        cache.modify({
          fields: {
            getPublicProjects(existingProjects = [], { readField }) {
              return existingProjects.filter(
                (projectRef: any) => readField('id', projectRef) !== projectId,
              );
            },
            getProjectsByStudent(existingProjects = [], { readField }) {
              return existingProjects.filter(
                (projectRef: any) => readField('id', projectRef) !== projectId,
              );
            },
          },
        });
      }
    },
  });

  const handleDelete = async () => {
    if (!userId) return;

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this project?',
    );
    if (!confirmDelete) return;

    try {
      setErrorMessage('');
      const res = await deleteProject({
        variables: {
          projectId,
          userId,
        },
      });

      if (res.data?.deleteProject.success && onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete the project.');
    }
  };

  if (!isLoaded || !userId) {
    return null;
  }

  return (
    <div className="inline-block">
      <button
        onClick={handleDelete}
        disabled={loading}
        className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 disabled:bg-gray-400 transition"
      >
        {loading ? 'Deleting...' : 'Delete Project'}
      </button>

      {errorMessage && (
        <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
      )}
    </div>
  );
}
