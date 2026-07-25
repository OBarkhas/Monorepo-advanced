'use client';

import { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import gql from 'graphql-tag';
import { Project } from '../types/types';
import {
  History,
  Coins,
  ArrowUpRight,
  Sparkles,
  Loader2,
  AlertTriangle,
  MessageSquareX,
  CheckCircle2,
  Clock,
  XCircle,
  FolderKanban,
  Plus,
} from 'lucide-react';

const GET_MY_PROJECT_HISTORY: TypedDocumentNode<
  { getProjectsByStudent: Project[] },
  { studentId: string }
> = gql`
  query GetMyProjectHistory($studentId: ID!) {
    getProjectsByStudent(studentId: $studentId) {
      id
      title
      description
      status
      rejectionReason
      totalCoinsCollected
      createdAt
    }
  }
`;

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

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return <CheckCircle2 className="h-3.5 w-3.5" />;
    case 'PENDING':
      return <Clock className="h-3.5 w-3.5" />;
    case 'REJECTED':
      return <XCircle className="h-3.5 w-3.5" />;
    case 'FUNDED':
      return <CheckCircle2 className="h-3.5 w-3.5" />;
    default:
      return null;
  }
};

export default function ProjectHistoryPage() {
  const { userId, isLoaded } = useAuth();

  const { data, loading, error } = useQuery(GET_MY_PROJECT_HISTORY, {
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
          Please sign in to view your project history.
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

  const myProjects = data?.getProjectsByStudent || [];

  if (myProjects.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center">
        <div className="p-3 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-3xl w-fit mx-auto mb-4">
          <History className="h-8 w-8 text-teal-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          No Projects Yet
        </h2>
        <p className="text-gray-500 mb-6">
          You haven't submitted any projects yet. Create your first one!
        </p>
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

  // Sort by newest first
  const sortedProjects = [...myProjects].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="max-w-3xl mx-auto mt-6 p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-teal-100/50 pb-5">
        <div className="p-2.5 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-2xl shadow-lg shadow-teal-200/30">
          <History className="h-6 w-6 text-teal-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            My Projects
          </h1>
          <p className="text-sm text-gray-500">
            {myProjects.length} project{myProjects.length !== 1 && 's'}{' '}
            submitted •{' '}
            {
              myProjects.filter(
                (p) => p.status === 'APPROVED' || p.status === 'FUNDED',
              ).length
            }{' '}
            approved
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/50 text-center">
          <p className="text-2xl font-bold text-emerald-700">
            {myProjects.filter((p) => p.status === 'APPROVED').length}
          </p>
          <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider mt-0.5">
            Approved
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 text-center">
          <p className="text-2xl font-bold text-amber-700">
            {myProjects.filter((p) => p.status === 'PENDING').length}
          </p>
          <p className="text-[10px] text-amber-600 font-semibold uppercase tracking-wider mt-0.5">
            Pending
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-200/50 text-center">
          <p className="text-2xl font-bold text-red-700">
            {myProjects.filter((p) => p.status === 'REJECTED').length}
          </p>
          <p className="text-[10px] text-red-600 font-semibold uppercase tracking-wider mt-0.5">
            Rejected
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {sortedProjects.map((project) => (
          <div key={project.id}>
            <Link
              href={`/projects/${project.id}`}
              className="block group bg-white/80 backdrop-blur-xl border border-teal-100/60 rounded-3xl p-6 shadow-lg shadow-teal-200/10 hover:shadow-xl hover:shadow-teal-200/20 transition-all duration-300 hover:scale-[1.01] cursor-pointer"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-teal-600 transition-colors flex items-center gap-1.5">
                      <span>{project.title}</span>
                      <ArrowUpRight className="h-4 w-4 text-teal-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </h3>
                    <span
                      className={`px-3 py-1 text-[10px] font-semibold rounded-full border uppercase tracking-wider inline-flex items-center gap-1 shrink-0 ${getStatusStyle(project.status)}`}
                    >
                      {getStatusIcon(project.status)}
                      {project.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </div>

              <div className="border-t border-teal-100/50 pt-3 mt-3 flex justify-between items-center text-xs text-gray-500">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 border border-teal-200/40 rounded-xl">
                  <Coins className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="font-bold">
                    {project.totalCoinsCollected || 0} coins
                  </span>
                </div>
                <p className="font-mono text-gray-400">
                  {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Link>

            {project.status === 'REJECTED' && project.rejectionReason && (
              <div className="mt-2 mx-2 p-4 bg-red-50/80 backdrop-blur border border-red-200/60 rounded-2xl shadow-sm flex items-start gap-3">
                <div className="p-1.5 bg-red-100 rounded-xl shrink-0 mt-0.5">
                  <MessageSquareX className="h-4 w-4 text-red-600" />
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                    <p className="text-xs font-bold text-red-700 uppercase tracking-wider">
                      Rejection Reason
                    </p>
                  </div>
                  <p className="text-sm text-red-700 leading-relaxed">
                    {project.rejectionReason}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
