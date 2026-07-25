'use client';

import { useState, useEffect } from 'react';
import { TypedDocumentNode } from '@apollo/client';
import { useLazyQuery } from '@apollo/client/react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import gql from 'graphql-tag';
import { UserRole } from '../types/types';
import {
  Search,
  Mail,
  Shield,
  ChevronRight,
  Loader2,
  Users,
} from 'lucide-react';

type User = {
  id: string;
  email: string;
  userName: string;
  role: UserRole;
};

const GET_USERS: TypedDocumentNode<{ getUsers: User[] }, {}> = gql`
  query GetUsers {
    getUsers {
      id
      userName
      email
      role
    }
  }
`;

export function SearchUser() {
  const { userId, isLoaded } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const [fetchUsers, { data, loading, error, called }] = useLazyQuery(
    GET_USERS,
    {
      fetchPolicy: 'cache-and-network',
    },
  );

  useEffect(() => {
    if (searchTerm.trim() && userId) {
      fetchUsers();
    }
  }, [searchTerm, userId, fetchUsers]);

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="max-w-lg mx-auto mt-16 p-6 text-center glass-dark rounded-3xl text-teal-700 border border-teal-200/50">
        <p className="font-medium">Please sign in to search users.</p>
      </div>
    );
  }

  const allUsers = data?.getUsers || [];
  const filteredUsers = allUsers.filter((user) =>
    user.userName.toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-xl mx-auto mt-6 p-4 sm:p-6 space-y-6">
      {}
      <div className="flex items-center gap-3 border-b border-teal-100/50 pb-5">
        <div className="p-2.5 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-2xl shadow-lg shadow-teal-200/30">
          <Users className="h-6 w-6 text-teal-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Search Users
          </h2>
          <p className="text-sm text-gray-500">
            Find and explore platform users
          </p>
        </div>
      </div>

      {}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-400 h-5 w-5 group-focus-within:text-teal-600 transition-colors" />
        <input
          type="text"
          placeholder="Type a username to search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 border border-teal-200/60 rounded-2xl bg-white/80 backdrop-blur focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all text-gray-900 placeholder-gray-400 shadow-sm hover:shadow-md"
        />
      </div>

      <div className="space-y-3">
        {loading && (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-6 w-6 text-teal-500 animate-spin" />
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50/80 backdrop-blur rounded-2xl text-red-600 border border-red-200/60 text-sm">
            Error: {error.message}
          </div>
        )}

        {!loading &&
          !error &&
          searchTerm.trim() &&
          filteredUsers.length > 0 &&
          filteredUsers.map((user) => (
            <Link
              key={user.id}
              href={`/users/${user.id}`}
              className="group bg-white/80 backdrop-blur-xl border border-teal-100/60 rounded-2xl p-4 shadow-lg shadow-teal-200/10 hover:shadow-xl hover:shadow-teal-200/20 transition-all duration-300 hover:scale-[1.01] cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 text-base group-hover:text-teal-600 transition-colors">
                    {user.userName}
                  </span>
                  {user.id === userId && (
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-teal-100 text-teal-700 border border-teal-200">
                      You
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                    <span>{user.email}</span>
                  </div>
                  <div className="text-gray-300 hidden sm:inline">•</div>
                  <div className="text-[11px] font-mono text-gray-400">
                    ID: {user.id.slice(0, 12)}...
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-center">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 text-teal-700 border border-teal-200/50">
                  <Shield className="h-3.5 w-3.5" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 text-teal-300 group-hover:text-teal-500 group-hover:translate-x-0.5 transition-all hidden sm:block" />
              </div>
            </Link>
          ))}

        {!loading &&
          !error &&
          searchTerm.trim() &&
          called &&
          filteredUsers.length === 0 && (
            <div className="p-10 text-center bg-white/70 backdrop-blur rounded-3xl border border-dashed border-teal-200/50">
              <p className="text-gray-400 text-sm">
                No users found matching "{searchTerm}"
              </p>
            </div>
          )}

        {!searchTerm.trim() && (
          <div className="p-10 text-center bg-white/70 backdrop-blur rounded-3xl border border-dashed border-teal-200/50">
            <p className="text-gray-400 text-sm">
              Start typing to search for users
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
