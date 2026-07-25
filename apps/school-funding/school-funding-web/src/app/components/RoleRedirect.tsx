'use client';

import { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useAuth } from '@clerk/nextjs';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import gql from 'graphql-tag';
import { UserRole } from '../types/types';
import { Loader2 } from 'lucide-react';

type UserRoleResult = {
  getUserById: {
    id: string;
    role: UserRole;
  } | null;
};

const GET_USER_ROLE: TypedDocumentNode<UserRoleResult, { id: string }> = gql`
  query GetUserRole($id: ID!) {
    getUserById(id: $id) {
      id
      role
    }
  }
`;

export function RoleRedirect() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const { data, loading, error } = useQuery(GET_USER_ROLE, {
    variables: { id: userId || '' },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
  });

  const isChecking = !isLoaded || (userId && loading);

  useEffect(() => {
    if (isChecking) return;

    if (error) {
      console.error('RoleRedirect Error:', error);
      return;
    }

    const user = data?.getUserById;

    if (user) {
      const role = String(user.role || '').toUpperCase();

      if (role === 'TEACHER' && (pathname === '/' || pathname === '')) {
        router.push('/teacher');
      }

      if (role !== 'TEACHER' && pathname.startsWith('/teacher')) {
        router.push('/');
      }
    }
  }, [isChecking, data, error, pathname, router]);

  if (isChecking && (pathname === '/' || pathname.startsWith('/teacher'))) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-teal-50/90 via-white to-emerald-50/90 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-3xl bg-gradient-to-br from-teal-100 to-emerald-100 animate-pulse" />
            <Loader2 className="h-6 w-6 text-teal-600 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-sm font-medium text-teal-700">
            Checking authorization...
          </p>
        </div>
      </div>
    );
  }

  return null;
}
