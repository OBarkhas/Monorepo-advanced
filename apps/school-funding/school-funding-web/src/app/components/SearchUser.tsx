'use client';

import { useState, useEffect } from 'react';
import { TypedDocumentNode } from '@apollo/client';
import { useLazyQuery } from '@apollo/client/react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import gql from 'graphql-tag';
import { UserRole } from '../types/types';
import { Search, Mail, Shield, ChevronRight } from 'lucide-react';

type User = {
  id: string;
  email: string;
  userName: string;
  role: UserRole;
};

// Reverting back to your valid backend query name
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

  // useLazyQuery keeps the request idle until you trigger it manually
  const [fetchUsers, { data, loading, error, called }] =
    useLazyQuery(GET_USERS);

  useEffect(() => {
    if (searchTerm.trim() && userId) {
      fetchUsers();
    }
  }, [searchTerm, userId, fetchUsers]);

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center p-6">
        <p className="text-gray-500 animate-pulse">Loading auth...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="p-4 text-center border rounded bg-yellow-50 text-yellow-700">
        Please sign in to search users.
      </div>
    );
  }

  // Filter the results on the client side only after they type
  const allUsers = data?.getUsers || [];
  const filteredUsers = allUsers.filter((user) =>
    user.userName.toLowerCase().startsWith(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-xl mx-auto mt-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Search Users</h2>
        <p className="text-sm text-gray-500">
          Type a character to start looking up platform users.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Type a username to start searching..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
        />
      </div>

      <div className="space-y-3">
        {loading && (
          <div className="flex justify-center items-center p-6">
            <p className="text-gray-500 animate-pulse">Searching records...</p>
          </div>
        )}

        {error && (
          <div className="p-4 border rounded bg-red-50 text-red-500">
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
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 rounded-xl bg-white shadow-sm gap-3 hover:border-gray-300 hover:shadow-md transition-all group cursor-pointer block"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 text-base group-hover:text-blue-600 transition-colors">
                    {user.userName}
                  </span>
                  {user.id === userId && (
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-green-100 text-green-800">
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
                    ID: {user.id}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-center">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                  <Shield className="h-3.5 w-3.5" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all hidden sm:block" />
              </div>
            </Link>
          ))}

        {!loading &&
          !error &&
          searchTerm.trim() &&
          called &&
          filteredUsers.length === 0 && (
            <div className="p-8 text-center border border-dashed rounded-xl bg-gray-50 text-gray-400 text-sm">
              No users found matching "{searchTerm}"
            </div>
          )}

        {!searchTerm.trim() && (
          <div className="p-8 text-center border border-dashed rounded-xl bg-gray-50 text-gray-400 text-sm">
            Please enter a keyword to begin your lookup.
          </div>
        )}
      </div>
    </div>
  );
}
