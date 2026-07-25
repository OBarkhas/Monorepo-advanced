'use client';

import { TypedDocumentNode } from '@apollo/client';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import gql from 'graphql-tag';
import { Project } from '../types/types';
import { useQuery } from '@apollo/client/react';
import {
  FolderKanban,
  Coins,
  ArrowUpRight,
  Plus,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { DeleteProjectButton } from './DeleteProject';

const GET_ALL_COMBINED_PROJECTS: TypedDocumentNode<
  { getPublicProjects: Project[]; getProjectsByStudent: Project[] },
  { studentId: string }
> = gql`
  query GetAllCombinedProjects($studentId: ID!) {
    getPublicProjects {
      id
      title
      description
      status
      creatorId
      totalCoinsCollected
    }
    getProjectsByStudent(studentId: $studentId) {
      id
      title
      description
      status
      creatorId
      totalCoinsCollected
      rejectionReason
    }
  }
`;

export default function AllProjectsPage() {
  const { userId, isLoaded } = useAuth();
  const { data, loading, error } = useQuery(GET_ALL_COMBINED_PROJECTS, {
    variables: { studentId: userId || '' },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
  });

  if (!isLoaded || loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="max-w-lg mx-auto mt-16 p-6 text-center glass-dark rounded-3xl text-teal-700 border border-teal-200/50">
        <p className="font-medium">
          Please sign in or sign up to view the project catalog.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-16 p-6 text-center bg-red-50/80 backdrop-blur rounded-3xl text-red-600 border border-red-200/60">
        Error loading projects: {error.message}
      </div>
    );
  }

  const rawPublicProjects = data?.getPublicProjects || [];
  const approvedPublicProjects = rawPublicProjects.filter(
    (p) => p.status === 'APPROVED',
  );

  const myProjects = data?.getProjectsByStudent || [];

  const combined = [...approvedPublicProjects, ...myProjects];
  const uniqueProjects = Array.from(
    new Map(combined.map((item) => [item.id, item])).values(),
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200/50';
      case 'REJECTED':
        return 'bg-red-50 text-red-700 border-red-200/50';
      case 'FUNDED':
        return 'bg-teal-50 text-teal-700 border-teal-200/50';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200/50';
    }
  };

  if (uniqueProjects.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center">
        <div className="p-3 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-3xl w-fit mx-auto mb-4">
          <FolderKanban className="h-8 w-8 text-teal-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          No Projects Yet
        </h2>
        <p className="text-gray-500 mb-6">Be the first to create a project!</p>
        <Link
          href="/create-project"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-2xl font-medium hover:from-teal-500 hover:to-emerald-400 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl hover:shadow-teal-200/50"
        >
          <Plus className="h-4 w-4" />
          Create Project
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-6 space-y-6 p-4 sm:p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-2xl">
            <Sparkles className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">All Projects</h2>
            <p className="text-xs text-gray-500">
              {uniqueProjects.length} project
              {uniqueProjects.length !== 1 && 's'}
            </p>
          </div>
        </div>

        <Link
          href="/create-project"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-2xl text-sm font-medium hover:from-teal-500 hover:to-emerald-400 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg hover:shadow-teal-200/40 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </Link>
      </div>

      <div className="grid gap-4">
        {uniqueProjects.map((project) => (
          <div
            key={project.id}
            className="group bg-white/80 backdrop-blur-xl border border-teal-100/60 rounded-3xl shadow-lg shadow-teal-200/10 hover:shadow-xl hover:shadow-teal-200/20 transition-all duration-300 hover:scale-[1.01] p-6 flex flex-col justify-between gap-4"
          >
            <Link
              href={`/projects/${project.id}`}
              className="block cursor-pointer space-y-3"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-teal-600 transition-colors flex items-center gap-1.5">
                      <span>{project.title}</span>
                      <ArrowUpRight className="h-4 w-4 text-teal-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </h3>
                    {project.creatorId === userId && (
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-teal-100 text-teal-700 border border-teal-200">
                        Mine
                      </span>
                    )}
                  </div>
                </div>

                <span
                  className={`px-3 py-1 text-[10px] font-semibold rounded-full border uppercase tracking-wider shrink-0 ${getStatusStyle(project.status)}`}
                >
                  {project.status}
                </span>
              </div>

              <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 whitespace-pre-wrap">
                {project.description}
              </p>

              <div className="border-t border-teal-100/50 pt-3 flex justify-between items-center text-xs text-gray-500">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 border border-teal-200/40 rounded-xl">
                  <Coins className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="font-bold">
                    {project.totalCoinsCollected || 0} coins
                  </span>
                </div>

                <p className="font-mono text-gray-400">
                  by{' '}
                  {project.creatorId === userId
                    ? 'You'
                    : project.creatorId.slice(0, 8) + '...'}
                </p>
              </div>
            </Link>

            {project.creatorId === userId && (
              <div className="flex justify-end border-t border-teal-100/50 pt-3">
                <DeleteProjectButton projectId={project.id} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
