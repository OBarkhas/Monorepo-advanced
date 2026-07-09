'use client';

import { TypedDocumentNode } from '@apollo/client';
import { useAuth } from '@clerk/nextjs';
import gql from 'graphql-tag';
import { Project } from '../types/types';
import { useQuery } from '@apollo/client/react';
import { Trophy, Crown, Medal, Coins } from 'lucide-react';
import { CreatorName } from './CreatorName';
import Link from 'next/link';

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

export function ProjectLeaderboard() {
  const { userId, isLoaded } = useAuth();

  const { data, loading, error } = useQuery(GET_ALL_COMBINED_PROJECTS, {
    variables: { studentId: userId || '' },
    skip: !userId,
  });

  if (!isLoaded || loading) {
    return (
      <div className="flex justify-center items-center p-6">
        <p className="text-gray-500 animate-pulse">Loading Leaderboard...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="p-4 text-center border rounded bg-yellow-50 text-yellow-700">
        Please sign in to view the Leaderboard.
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded bg-red-50 text-red-500">
        Error loading data: {error.message}
      </div>
    );
  }

  const combined = [
    ...(data?.getPublicProjects || []),
    ...(data?.getProjectsByStudent || []),
  ];

  const uniqueProjects = Array.from(
    new Map(combined.map((item) => [item.id, item])).values(),
  );

  const sortedProjects = uniqueProjects.sort(
    (a, b) => (b.totalCoinsCollected || 0) - (a.totalCoinsCollected || 0),
  );

  if (sortedProjects.length === 0) {
    return (
      <div className="p-4 text-center border rounded bg-gray-50 text-gray-500">
        No projects available for standings.
      </div>
    );
  }

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 text-yellow-600">
            <Crown className="w-6 h-6" />
          </div>
        );
      case 1:
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-200 text-slate-600">
            <Trophy className="w-5 h-5" />
          </div>
        );
      case 2:
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 text-amber-700">
            <Medal className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-500 font-bold text-sm">
            #{index + 1}
          </div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-6 space-y-6">
      <div className="flex items-center gap-3 border-b pb-4">
        <Trophy className="w-8 h-8 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-900">
          Project Leaderboard
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {sortedProjects.map((project, index) => {
          const isTopThree = index < 3;

          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="p-5 border border-gray-100 rounded-xl bg-white shadow-sm flex flex-col justify-between gap-3 hover:border-gray-300 hover:shadow-md transition-all group block cursor-pointer"
            >
              <div
                key={project.id}
                className={`flex items-center justify-between p-4 border rounded-xl shadow-sm transition-all ${
                  isTopThree
                    ? 'bg-gradient-to-r from-white to-gray-50/50 border-gray-300 scale-[1.01]'
                    : 'bg-white border-gray-100'
                }`}
              >
                <div className="flex items-center gap-4">
                  {getRankBadge(index)}

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 text-base md:text-lg">
                        {project.title}
                      </h3>
                      {project.creatorId === userId && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-green-100 text-green-800">
                          Mine
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      By: <CreatorName creatorId={project.creatorId} />
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-blue-50/70 border border-blue-100 px-3 py-1.5 rounded-lg">
                  <Coins className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-blue-700 text-sm md:text-base">
                    {project.totalCoinsCollected || 0}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
