'use client';

import { useState, useEffect } from 'react';
import { TypedDocumentNode } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '@clerk/nextjs';
import gql from 'graphql-tag';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';

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

  const { data: queryData, loading: queryLoading } = useQuery(
    GET_PROJECT_BY_ID,
    {
      variables: { id: projectId },
      skip: !userId,
    },
  );

  const [updateProject, { loading: mutationLoading }] = useMutation(UPDATE_PROJECT, {
    refetchQueries: ['GetAllCombinedProjects', 'GetProjectById'],
    onCompleted: (data: any) => {
      toast.success('Project Updated!', {
        description: `Status: ${data.updateProject.status}`,
        icon: '✅',
      });
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      toast.error('Update Failed', {
        description: err.message,
      });
    },
  });

  useEffect(() => {
    if (queryData?.getProjectById) {
      setTitle(queryData.getProjectById.title);
      setDescription(queryData.getProjectById.description);
    }
  }, [queryData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !queryData?.getProjectById) return;

    await updateProject({
      variables: {
        id: projectId,
        title,
        description,
        images: queryData.getProjectById.images,
        creatorId: userId,
      },
    });
  };

  if (!isLoaded || queryLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-6 w-6 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="p-4 text-center glass-dark rounded-2xl text-teal-700 border border-teal-200/50 text-sm">
        Please sign in to update this project.
      </div>
    );
  }

  const project = queryData?.getProjectById;
  if (!project) {
    return (
      <div className="p-4 text-center glass-dark rounded-2xl text-gray-500 text-sm">
        Project not found.
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-teal-100/60 rounded-3xl p-6 shadow-xl shadow-teal-200/20 space-y-5">
      <h2 className="text-xl font-bold text-gray-900">Update Project</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-teal-200/60 p-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 text-sm bg-white/60 transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-teal-200/60 p-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 text-sm bg-white/60 transition-all resize-none"
            rows={4}
            required
          />
        </div>

        <button
          type="submit"
          disabled={mutationLoading}
          className="w-full bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white font-semibold p-3 rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-teal-200/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
        >
          {mutationLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {mutationLoading ? 'Updating...' : 'Update Project'}
        </button>
      </form>
    </div>
  );
}
