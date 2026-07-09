'use client';

import { use } from 'react';
import { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import gql from 'graphql-tag';
import { UserRole, Project } from '../../types/types';
import {
  ArrowLeft,
  Mail,
  Shield,
  User as UserIcon,
  FolderKanban,
  Coins,
  ArrowUpRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  email: string;
  userName: string;
  role: UserRole;
};

const GET_USER_PROFILE_AND_PROJECTS: TypedDocumentNode<
  { getUserById: User | null; getProjectsByStudent: Project[] },
  { id: string; studentId: string }
> = gql`
  query GetUserProfileAndProjects($id: ID!, $studentId: ID!) {
    getUserById(id: $id) {
      id
      userName
      email
      role
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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { userId, isLoaded } = useAuth();

  const { data, loading, error } = useQuery(GET_USER_PROFILE_AND_PROJECTS, {
    variables: { id, studentId: id },
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
          Loading profile records...
        </p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="max-w-md mx-auto mt-12 p-4 text-center border rounded bg-yellow-50 text-yellow-700">
        Please sign in to view this dashboard profile.
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

  const user = data?.getUserById;
  const projects = data?.getProjectsByStudent || [];

  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-12 text-center p-8 border border-dashed rounded-xl bg-gray-50">
        <p className="text-gray-500 mb-4">User profile not found.</p>
        <Link
          href="/search-user"
          className="text-sm text-blue-600 hover:underline"
        >
          Return to directory
        </Link>
      </div>
    );
  }

  const isTeacher = user.role === 'TEACHER';

  return (
    <div className="max-w-2xl mx-auto mt-8 p-4 space-y-8">
      <Link
        href="/search-user"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to search</span>
      </Link>

      <div className="border border-gray-100 p-6 rounded-2xl shadow-sm bg-white space-y-6">
        <div className="flex items-center gap-4 border-b pb-5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <UserIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.userName}
              </h1>
              {user.id === userId && (
                <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-green-100 text-green-800">
                  Your Profile
                </span>
              )}
            </div>
            <p className="text-xs font-mono text-gray-400 mt-0.5">
              ID: {user.id}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 text-gray-700">
            <Mail className="h-5 w-5 text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                Email Address
              </p>
              <p className="text-sm font-medium text-gray-900">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-700">
            <Shield className="h-5 w-5 text-gray-400 shrink-0" />
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                System Role
              </p>
              <span className="inline-block mt-0.5 px-2.5 py-0.5 text-xs font-bold rounded-md bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wide">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {!isTeacher && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-gray-700" />
            <h2 className="text-xl font-bold text-gray-900">
              Projects by this User ({projects.length})
            </h2>
          </div>

          <div className="grid gap-4">
            {projects.length > 0 ? (
              projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="p-5 border border-gray-100 rounded-xl bg-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gray-300 hover:shadow-md transition-all group block cursor-pointer"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 text-base group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                        <span>{project.title}</span>
                        <ArrowUpRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                      </h3>
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-blue-100 text-blue-800 uppercase tracking-wide">
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
                This user has not listed any projects yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
