'use client';

import { TypedDocumentNode } from '@apollo/client';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import gql from 'graphql-tag';
import { Project } from '../types/types';
import { useQuery } from '@apollo/client/react';
import { FolderKanban, Coins, ArrowUpRight, Plus } from 'lucide-react';
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
        <p className="text-gray-500 animate-pulse">
          Loading all platform projects...
        </p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="max-w-md mx-auto mt-12 p-4 text-center border rounded bg-yellow-50 text-yellow-700">
        Please sign in to view the project catalog.
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

  const publicProjects = data?.getPublicProjects || [];
  const myProjects = data?.getProjectsByStudent || [];

  const combined = [...publicProjects, ...myProjects];
  const uniqueProjects = Array.from(
    new Map(combined.map((item) => [item.id, item])).values(),
  );

  if (uniqueProjects.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center p-8 border border-dashed rounded-xl bg-gray-50 text-gray-400">
        No projects found on the server.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-6 space-y-6 p-4">
      <div className="flex justify-between items-center border-b pb-4">
        <div className="flex items-center gap-2.5">
          <FolderKanban className="h-6 w-6 text-gray-700" />
          <h2 className="text-2xl font-bold text-gray-900">All Projects</h2>
        </div>

        <Link
          href="/create-project"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Project</span>
        </Link>
      </div>

      <div className="grid gap-4">
        {uniqueProjects.map((project) => (
          <div
            key={project.id}
            className="border border-gray-100 rounded-xl bg-white shadow-sm hover:border-gray-300 hover:shadow-md transition-all p-5 flex flex-col justify-between gap-4"
          >
            <Link
              href={`/projects/${project.id}`}
              className="group block cursor-pointer space-y-3"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                      <span>{project.title}</span>
                      <ArrowUpRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </h3>
                    {project.creatorId === userId && (
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-green-100 text-green-800">
                        Mine
                      </span>
                    )}
                  </div>
                </div>

                <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wide shrink-0">
                  {project.status}
                </span>
              </div>

              <p className="text-gray-600 text-sm line-clamp-2 whitespace-pre-wrap">
                {project.description}
              </p>

              <div className="border-t pt-3 flex justify-between items-center text-xs text-gray-400">
                <div className="flex items-center gap-1 bg-amber-50/50 text-amber-700 border border-amber-100/60 px-2 py-1 rounded-md">
                  <Coins className="h-3.5 w-3.5 text-amber-600" />
                  <span className="font-bold">
                    {project.totalCoinsCollected || 0}
                  </span>
                </div>

                <p className="font-mono">
                  Creator:{' '}
                  {project.creatorId === userId
                    ? 'You'
                    : project.creatorId.slice(0, 12) + '...'}
                </p>
              </div>
            </Link>

            {project.creatorId === userId && (
              <div className="flex justify-end border-t pt-2">
                <DeleteProjectButton projectId={project.id} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
