'use client';

import { useState } from 'react';
import { TypedDocumentNode } from '@apollo/client';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import gql from 'graphql-tag';
import { Project, CreateProjectArgs } from '../types/types';
import { useMutation } from '@apollo/client/react';
import { toast } from 'sonner';
import { Sparkles, Loader2 } from 'lucide-react';

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
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [createProject, { loading, error }] = useMutation(CREATE_PROJECT, {
    refetchQueries: ['GetAllCombinedProjects'],
    onCompleted: (data: any) => {
      toast.success('Project Submitted!', {
        description: `"${data.createProject.title}" is now pending teacher approval.`,
        icon: '🎉',
      });
      setTitle('');
      setDescription('');
      setTimeout(() => {
        router.push('/');
      }, 1800);
    },
    onError: (err) => {
      toast.error('Submission Failed', {
        description: err.message,
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    await createProject({
      variables: {
        title,
        description,
        images: [],
        creatorId: userId,
      },
    });
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-6 w-6 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="max-w-lg mx-auto mt-16 p-6 text-center glass-dark rounded-3xl text-teal-700 border border-teal-200/50">
        <p className="font-medium">Please sign in to create a project.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-12 p-8">
      <div className="text-center mb-8">
        <div className="p-3 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-3xl w-fit mx-auto mb-4 shadow-lg shadow-teal-200/50">
          <Sparkles className="h-8 w-8 text-teal-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          New Project
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Share your idea and start collecting votes
        </p>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-teal-100/60 rounded-3xl p-8 shadow-xl shadow-teal-200/20 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Project Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.g., Science Club Lab Equipment"
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
              placeholder="Describe your project goals, budget, and impact..."
              className="w-full border border-teal-200/60 p-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 text-sm bg-white/60 transition-all resize-none"
              rows={5}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white font-semibold p-3.5 rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-teal-200/50 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Submit Project</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-red-50/80 backdrop-blur text-red-600 border border-red-200/60 rounded-2xl text-sm">
            {error.message}
          </div>
        )}
      </div>
    </div>
  );
}
