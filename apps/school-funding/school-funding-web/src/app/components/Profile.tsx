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
        <p className="text-gray-500 animate-pulse">Loading your profile...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="max-w-md mx-auto mt-6 p-4 text-center border rounded bg-yellow-50 text-yellow-700">
        Please sign in to view your profile page.
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-6 p-4 border rounded bg-red-50 text-red-500">
        Error: {error.message}
      </div>
    );
  }

  const user = data?.getUserById;
  const myProjects = data?.getProjectsByStudent || [];

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-6 p-4 text-center border rounded bg-gray-50 text-gray-500">
        User records could not be found.
      </div>
    );
  }

  const isTeacher = user.role === 'TEACHER';

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4 space-y-8">
      <div className="relative border border-gray-100 rounded-3xl bg-white p-6 shadow-sm overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mt-2">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-2xl border border-blue-100">
            <UserIcon className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-gray-950 tracking-tight">
              {user.userName}
            </h1>
            <p className="text-xs font-mono text-gray-400">
              Account ID: {user.id}
            </p>
          </div>
        </div>

        {!isTeacher && (
          <div className="grid grid-cols-2 gap-4 mt-6 border-t pt-6">
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100 flex items-center gap-3">
              <Coins className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs text-amber-600 font-medium uppercase tracking-wider">
                  Coin Balance
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {user.coinBalance ?? 0}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center gap-3">
              <FolderKanban className="h-5 w-5 text-blue-600 shrink-0" />
              <div>
                <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">
                  My Projects
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {myProjects.length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border border-gray-100 rounded-2xl bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
          Account Specifications
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 border border-gray-50 rounded-xl bg-gray-50/30">
            <Mail className="h-5 w-5 text-gray-400 shrink-0" />
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                Email Contact
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 border border-gray-50 rounded-xl bg-gray-50/30">
            <Shield className="h-5 w-5 text-gray-400 shrink-0" />
            <div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                Workspace Role
              </p>
              <span className="inline-block px-2 py-0.5 mt-0.5 text-xs font-bold rounded bg-blue-100 text-blue-800 uppercase tracking-wide">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {!isTeacher && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-gray-800" />
            <h2 className="text-xl font-bold text-gray-900">
              Track Records & Submissions
            </h2>
          </div>

          <div className="grid gap-4">
            {myProjects.length > 0 ? (
              myProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="p-5 border border-gray-100 rounded-xl bg-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gray-300 hover:shadow-md transition-all group block cursor-pointer"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900 text-base group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                        <span>{project.title}</span>
                        <ArrowUpRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                      </h4>
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wide">
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 whitespace-pre-wrap">
                      {project.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-100 shrink-0 self-start sm:self-auto">
                    <Coins className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-bold">
                      {project.totalCoinsCollected || 0}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center border border-dashed rounded-xl bg-gray-50 text-gray-400 text-sm">
                You haven't launched any student projects yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
