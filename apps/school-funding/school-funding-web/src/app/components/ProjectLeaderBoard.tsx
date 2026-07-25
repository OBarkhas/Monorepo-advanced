'use client';

import { TypedDocumentNode } from '@apollo/client';
import { useAuth } from '@clerk/nextjs';
import gql from 'graphql-tag';
import { Project, WeeklyWinner } from '../types/types';
import { useQuery } from '@apollo/client/react';
import {
  Trophy,
  Crown,
  Medal,
  Coins,
  Sparkles,
  Loader2,
  History,
  Users,
} from 'lucide-react';
import { CreatorName } from './CreatorName';
import Link from 'next/link';

const GET_LEADERBOARD: TypedDocumentNode<{ getLeaderboard: Project[] }> = gql`
  query GetLeaderboard {
    getLeaderboard {
      id
      title
      description
      status
      creatorId
      totalCoinsCollected
    }
  }
`;

const GET_PREVIOUS_WEEK_WINNERS: TypedDocumentNode<{
  getPreviousWeekWinners: WeeklyWinner[];
}> = gql`
  query GetPreviousWeekWinners {
    getPreviousWeekWinners {
      id
      rank
      projectId
      projectTitle
      creatorId
      coinsCollected
      weekLabel
    }
  }
`;

function PreviousWinnersCard() {
  const { data, loading, error } = useQuery(GET_PREVIOUS_WEEK_WINNERS, {
    fetchPolicy: 'cache-and-network',
  });

  const winners = data?.getPreviousWeekWinners || [];

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-xl border border-teal-100/60 rounded-3xl p-5 shadow-xl shadow-teal-200/20">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-amber-100 rounded-xl">
            <History className="w-4 h-4 text-amber-700" />
          </div>
          <h3 className="font-bold text-gray-800 text-sm">
            Previous Week Winners
          </h3>
        </div>
        <div className="space-y-2.5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 bg-gray-100/60 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/80 backdrop-blur-xl border border-teal-100/60 rounded-3xl p-5 shadow-xl shadow-teal-200/20">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-amber-100 rounded-xl">
            <History className="w-4 h-4 text-amber-700" />
          </div>
          <h3 className="font-bold text-gray-800 text-sm">
            Previous Week Winners
          </h3>
        </div>
        <p className="text-xs ">Please wait until next week </p>
        <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 shadow-sm">
          <div className="p-1.5 bg-amber-100 rounded-xl shrink-0">
            <Sparkles className="w-4 h-4 text-amber-700 animate-pulse" />
          </div>
          <p className="text-xs font-semibold text-amber-900 leading-snug">
            Every week active projects refresh on the Leaderboard
          </p>
        </div>
      </div>
    );
  }

  if (winners.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-xl border border-teal-100/60 rounded-3xl p-5 shadow-xl shadow-teal-200/20">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-amber-100 rounded-xl">
            <History className="w-4 h-4 text-amber-700" />
          </div>
          <h3 className="font-bold text-gray-800 text-sm">
            Previous Week Winners
          </h3>
        </div>
        <div className="text-center py-6">
          <div className="p-2 bg-teal-50 rounded-2xl w-fit mx-auto mb-3">
            <Sparkles className="w-5 h-5 text-teal-400" />
          </div>
          <p className="text-sm font-medium text-gray-600">
            First week in progress!
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Winners will appear here after Sunday reset.
          </p>
        </div>
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-yellow-300 to-amber-400 text-white shadow-md shadow-yellow-200/50 shrink-0">
            <Crown className="w-4 h-4" />
          </div>
        );
      case 2:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-md shadow-slate-200/50 shrink-0">
            <Trophy className="w-3.5 h-3.5" />
          </div>
        );
      case 3:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-amber-300 to-orange-400 text-white shadow-md shadow-amber-200/50 shrink-0">
            <Medal className="w-3.5 h-3.5" />
          </div>
        );
      default:
        return null;
    }
  };

  const medalColors = [
    'border-yellow-200 bg-yellow-50/50',
    'border-slate-200 bg-slate-50/50',
    'border-amber-200 bg-amber-50/50',
  ];

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-teal-100/60 rounded-3xl p-5 shadow-xl shadow-teal-200/20">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-amber-100 rounded-xl">
          <History className="w-4 h-4 text-amber-700" />
        </div>
        <h3 className="font-bold text-gray-800 text-sm">
          Previous Week Winners
        </h3>
      </div>

      {winners[0]?.weekLabel && (
        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-3 -mt-2">
          {winners[0].weekLabel}
        </p>
      )}

      <div className="space-y-2.5">
        {winners.map((winner) => (
          <Link
            key={winner.id}
            href={`/projects/${winner.projectId}`}
            className={`flex items-center gap-3 p-3 rounded-2xl border ${medalColors[winner.rank - 1] || 'border-teal-100 bg-white'} hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer group`}
          >
            {getRankIcon(winner.rank)}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-900 truncate group-hover:text-teal-700 transition-colors">
                {winner.projectTitle}
              </p>
              <p className="text-[11px] text-gray-500 flex items-center gap-1">
                <Users className="w-3 h-3" />
                <CreatorName creatorId={winner.creatorId} />
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 px-2.5 py-1.5 rounded-xl">
              <Coins className="w-3 h-3 text-amber-600" />
              <span className="font-bold text-amber-700 text-xs">
                {winner.coinsCollected}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function ProjectLeaderboard() {
  const { userId, isLoaded } = useAuth();

  const { data, loading, error } = useQuery(GET_LEADERBOARD, {
    fetchPolicy: 'cache-and-network',
  });

  if (!isLoaded || loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-16 p-6 text-center bg-red-50/80 backdrop-blur rounded-3xl text-red-600 border border-red-200/60">
        Error loading data: {error.message}
      </div>
    );
  }

  const approvedProjects = (data?.getLeaderboard || []).filter(
    (project) => project.status === 'APPROVED' || project.status === 'FUNDED',
  );

  const sortedProjects = [...approvedProjects].sort(
    (a, b) => (b.totalCoinsCollected || 0) - (a.totalCoinsCollected || 0),
  );

  if (sortedProjects.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center">
        <div className="p-3 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-3xl w-fit mx-auto mb-4">
          <Trophy className="h-8 w-8 text-teal-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          No Projects Yet
        </h2>
        <p className="text-gray-500">
          No approved projects available for rankings yet.
        </p>
      </div>
    );
  }

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-300 to-amber-400 text-white shadow-lg shadow-yellow-200/50">
            <Crown className="w-6 h-6" />
          </div>
        );
      case 1:
        return (
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-lg shadow-slate-200/50">
            <Trophy className="w-5 h-5" />
          </div>
        );
      case 2:
        return (
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 to-orange-400 text-white shadow-lg shadow-amber-200/50">
            <Medal className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 font-bold text-sm border border-teal-200/50">
            #{index + 1}
          </div>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-6 p-4 sm:p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0 space-y-6">
          <div className="text-center sm:text-left flex sm:items-center gap-3 border-b border-teal-100/50 pb-5">
            <div className="p-2.5 bg-gradient-to-br from-yellow-200 to-amber-300 rounded-2xl shadow-lg shadow-yellow-200/30 hidden sm:block">
              <Trophy className="w-7 h-7 text-amber-800" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Leaderboard
              </h2>
              <p className="text-sm text-gray-500">
                Top funded projects ranked by coins collected
              </p>
            </div>
          </div>

          {sortedProjects.length >= 3 && (
            <div className="grid grid-cols-3 gap-3">
              {[1, 0, 2].map((pos) => {
                const project = sortedProjects[pos];
                if (!project) return null;
                const labels = ['2nd', '1st', '3rd'];
                const colors = [
                  'from-slate-100 to-slate-200 border-slate-300',
                  'from-yellow-50 to-amber-100 border-yellow-300',
                  'from-amber-50 to-orange-100 border-amber-300',
                ];
                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className={`p-4 rounded-2xl bg-gradient-to-b ${colors[pos]} border shadow-sm hover:shadow-lg hover:scale-[1.03] transition-all duration-300 text-center cursor-pointer group`}
                  >
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                      {labels[pos]}
                    </p>
                    <p className="font-bold text-sm text-gray-900 truncate group-hover:text-teal-700 transition-colors">
                      {project.title}
                    </p>
                    <div className="flex items-center justify-center gap-1 mt-2 text-teal-700">
                      <Coins className="h-3.5 w-3.5" />
                      <span className="font-bold text-sm">
                        {project.totalCoinsCollected || 0}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            {sortedProjects.map((project, index) => {
              const isTopThree = index < 3;

              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className={`p-4 rounded-2xl border flex items-center justify-between transition-all duration-300 group hover:scale-[1.01] cursor-pointer ${
                    isTopThree
                      ? 'bg-white shadow-md hover:shadow-xl border-teal-200/60 hover:border-teal-300'
                      : 'bg-white/70 backdrop-blur border-teal-100/50 hover:border-teal-200/80 shadow-sm hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {getRankBadge(index)}

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-base md:text-lg group-hover:text-teal-700 transition-colors">
                          {project.title}
                        </h3>
                        {userId && project.creatorId === userId && (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-teal-100 text-teal-700 border border-teal-200">
                            Mine
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        By: <CreatorName creatorId={project.creatorId} />
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/50 px-3 py-2 rounded-xl">
                    <Coins className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-teal-700 text-sm md:text-base">
                      {project.totalCoinsCollected || 0}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="w-full lg:w-80 shrink-0">
          <div className="lg:sticky lg:top-24">
            <PreviousWinnersCard />
          </div>
        </div>
      </div>
    </div>
  );
}
