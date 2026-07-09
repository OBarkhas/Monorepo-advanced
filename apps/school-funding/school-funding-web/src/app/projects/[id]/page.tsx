'use client';

import { use } from 'react';
import { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import gql from 'graphql-tag';
import {
  ArrowLeft,
  FolderKanban,
  Coins,
  Calendar,
  ShieldCheck,
} from 'lucide-react';
import { ProjectStatus } from '../../types/types';
import { DeleteProjectButton } from '../../components/DeleteProject';

type ProjectDetail = {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  creatorId: string;
  totalCoinsCollected: number;
  createdAt: string;
};

const GET_PROJECT_BY_ID: TypedDocumentNode<
  { getProjectById: ProjectDetail | null },
  { id: string }
> = gql`
  query GetProjectById($id: ID!) {
    getProjectById(id: $id) {
      id
      title
      description
      status
      creatorId
      totalCoinsCollected
      createdAt
    }
  }
`;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { userId, isLoaded } = useAuth();

  const { data, loading, error } = useQuery(GET_PROJECT_BY_ID, {
    variables: { id },
    skip: !userId,
  });
  const router = useRouter();
  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500 animate-pulse">
          Loading project details...
        </p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="max-w-md mx-auto mt-12 p-4 text-center border rounded bg-yellow-50 text-yellow-700">
        Please sign in to view this project.
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-12 p-4 border rounded bg-red-50 text-red-500">
        Error: {error.message}
      </div>
    );
  }

  const project = data?.getProjectById;

  if (!project) {
    return (
      <div className="max-w-md mx-auto mt-12 text-center p-8 border border-dashed rounded-xl bg-gray-50">
        <p className="text-gray-500 mb-4">Project not found.</p>
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-4 space-y-6">
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </button>

      <div className="border border-gray-100 rounded-2xl shadow-sm bg-white p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b pb-5">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mt-1">
              <FolderKanban className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {project.title}
              </h1>
              <p className="text-xs font-mono text-gray-400 mt-1">
                Project ID: {project.id}
              </p>
            </div>
          </div>

          <span className="px-3 py-1 text-xs font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider self-start">
            {project.status}
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
            Description
          </h3>
          <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap bg-gray-50/50 p-4 border border-gray-50 rounded-xl">
            {project.description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-5">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50/60 border border-amber-100">
            <Coins className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-[10px] text-amber-600 font-medium uppercase tracking-wider">
                Coins Gathered
              </p>
              <p className="text-base font-bold text-gray-900">
                {project.totalCoinsCollected || 0}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <ShieldCheck className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                Creator Reference
              </p>
              <p className="text-xs font-semibold text-gray-900 truncate max-w-[120px]">
                {project.creatorId === userId ? 'You' : project.creatorId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                Launched On
              </p>
              <p className="text-xs font-semibold text-gray-900">
                {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {project.creatorId === userId && (
          <div className="flex justify-end border-t pt-4">
            <DeleteProjectButton
              projectId={project.id}
              onSuccess={() => handleBack()}
            />
          </div>
        )}
      </div>
    </div>
  );
}
