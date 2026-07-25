'use client';

import { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import gql from 'graphql-tag';
import { UserRole, Project } from '../types/types';
import {
  User as UserIcon,
  Mail,
  Shield,
  FolderKanban,
  Coins,
  Award,
  ArrowUpRight,
  Sparkles,
  Loader2,
} from 'lucide-react';

type User = {
  id: string;
  email: string;
  userName: string;
  role: UserRole;
  coinBalance: number;
};

const GET_MY_PROFILE_AND_PROJECTS: TypedDocumentNode<
  { getUserById: User | null; getProjectsByStudent: Project[] },
  { id: string; studentId: string }
> = gql`
  query GetMyProfileAndProjects($id: ID!, $studentId: ID!) {
    getUserById(id: $id) {
      id
      userName
      email
      role
      coinBalance
    }
    getProjectsByStudent(studentId: $studentId) {
      id
      title
      description
      status
      rejectionReason
      totalCoinsCollected
    }
  }
`;

export function MyProfile() {
  const { userId, isLoaded } = useAuth();

  const { data, loading, error } = useQuery(GET_MY_PROFILE_AND_PROJECTS, {
    variables: { id: userId || '', studentId: userId || '' },
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
        <p className="font-medium">Please sign in to view your profile.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-16 p-6 text-center bg-red-50/80 backdrop-blur rounded-3xl text-red-600 border border-red-200/60">
        Error: {error.message}
      </div>
    );
  }

  const user = data?.getUserById;
  const myProjects = data?.getProjectsByStudent || [];

  if (!user) {
    return (
      <div className="max-w-lg mx-auto mt-16 p-6 text-center glass-dark rounded-3xl text-teal-700 border border-teal-200/50">
        User records could not be found.
      </div>
    );
  }

  const isTeacher = user.role === 'TEACHER';

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

  return (
    <div className="max-w-3xl mx-auto mt-6 p-4 sm:p-6 space-y-8">
      <div className="bg-white/80 backdrop-blur-xl border border-teal-100/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-teal-200/20 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mt-2">
          <div className="p-4 bg-gradient-to-br from-teal-100 to-emerald-100 text-teal-600 rounded-2xl border border-teal-200/50 shadow-lg shadow-teal-200/30">
            <UserIcon className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {user.userName}
            </h1>
            <p className="text-xs font-mono text-gray-400">
              Account ID: {user.id.slice(0, 16)}...
            </p>
          </div>
        </div>

        {!isTeacher && (
          <div className="grid grid-cols-2 gap-4 mt-6 border-t border-teal-100/50 pt-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 flex items-center gap-3">
              <Coins className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider">
                  Coin Balance
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {user.coinBalance ?? 0}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200/50 flex items-center gap-3">
              <FolderKanban className="h-5 w-5 text-teal-600 shrink-0" />
              <div>
                <p className="text-xs text-teal-600 font-semibold uppercase tracking-wider">
                  My Projects
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {myProjects.length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-teal-100/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-teal-200/20 space-y-5">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
          Account Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-teal-50/40 border border-teal-100/50">
            <Mail className="h-5 w-5 text-teal-500 shrink-0" />
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                Email Address
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-teal-50/40 border border-teal-100/50">
            <Shield className="h-5 w-5 text-teal-500 shrink-0" />
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                Role
              </p>
              <span className="inline-block px-3 py-0.5 mt-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-800 border border-teal-200/50 uppercase tracking-wide">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {!isTeacher && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-teal-600" />
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              My Projects
            </h2>
          </div>

          <div className="grid gap-4">
            {myProjects.length > 0 ? (
              myProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="group bg-white/80 backdrop-blur-xl border border-teal-100/60 rounded-3xl p-6 shadow-lg shadow-teal-200/10 hover:shadow-xl hover:shadow-teal-200/20 transition-all duration-300 hover:scale-[1.01] cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-gray-900 text-base group-hover:text-teal-600 transition-colors flex items-center gap-1.5">
                        <span>{project.title}</span>
                        <ArrowUpRight className="h-4 w-4 text-teal-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                      </h4>
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full border uppercase tracking-wide ${getStatusStyle(project.status)}`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {project.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200/50 shrink-0 self-start sm:self-auto">
                    <Coins className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-bold">
                      {project.totalCoinsCollected || 0}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-12 text-center bg-white/70 backdrop-blur rounded-3xl border border-dashed border-teal-200/50 shadow-lg shadow-teal-200/10">
                <p className="text-gray-400 text-sm">
                  You haven't launched any projects yet.
                </p>
                <Link
                  href="/create-project"
                  className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-2xl text-sm font-medium hover:from-teal-500 hover:to-emerald-400 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Sparkles className="h-4 w-4" />
                  Create Your First Project
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
