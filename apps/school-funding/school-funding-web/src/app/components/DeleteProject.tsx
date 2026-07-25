'use client';

import { useState } from 'react';
import { TypedDocumentNode } from '@apollo/client';
import { useAuth } from '@clerk/nextjs';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/client/react';
import { toast } from 'sonner';
import { Trash2, Loader2 } from 'lucide-react';

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
  const [confirming, setConfirming] = useState(false);

  const [deleteProject, { loading }] = useMutation(DELETE_PROJECT, {
    refetchQueries: ['GetAllCombinedProjects', 'GetLeaderboard'],
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
    onCompleted: (data: any) => {
      if (data.deleteProject.success) {
        toast.success('Project Deleted', {
          description: data.deleteProject.message || 'Project removed successfully.',
          icon: '🗑️',
        });
        if (onSuccess) onSuccess();
      }
    },
    onError: (err) => {
      toast.error('Delete Failed', {
        description: err.message,
      });
    },
  });

  const handleDelete = async () => {
    if (!userId) return;

    if (!confirming) {
      setConfirming(true);
      toast('Are you sure?', {
        description: 'This action cannot be undone. Click delete again to confirm.',
        icon: '⚠️',
        duration: 5000,
      });
      setTimeout(() => setConfirming(false), 5000);
      return;
    }

    await deleteProject({
      variables: {
        projectId,
        userId,
      },
    });
    setConfirming(false);
  };

  if (!isLoaded || !userId) {
    return null;
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className={`px-3 py-1.5 rounded-2xl text-xs font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-1.5 ${
        confirming
          ? 'bg-red-600 text-white hover:bg-red-700 shadow-md'
          : 'bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 hover:text-red-600'
      }`}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
      {loading ? 'Deleting...' : confirming ? 'Confirm Delete' : 'Delete'}
    </button>
  );
}
