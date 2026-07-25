'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Plus,
  Podium,
  Search,
  User,
  Coins,
  Sparkles,
  ClipboardCheck,
  History,
  Info,
  X,
} from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { TypedDocumentNode } from '@apollo/client';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/client/react';
import { UserRole } from '../types/types';

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

export function SimpleNavigation() {
  const pathname = usePathname();
  const { userId } = useAuth();

  const [showNotice, setShowNotice] = useState<boolean>(false);

  const noticeStorageKey = userId
    ? `hide_teacher_notice_${userId}`
    : 'hide_teacher_notice_guest';

  useEffect(() => {
    if (!userId) return;

    const isDismissed = localStorage.getItem(noticeStorageKey);
    if (!isDismissed) {
      setShowNotice(true);
    } else {
      setShowNotice(false);
    }
  }, [userId, noticeStorageKey]);

  const handleCloseNotice = (neverShowAgain = false) => {
    setShowNotice(false);
    if (neverShowAgain && userId) {
      localStorage.setItem(noticeStorageKey, 'true');
    }
  };

  const { data, loading } = useQuery(GET_USER_ROLE, {
    variables: { id: userId || '' },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
  });

  const isTeacher = data?.getUserById?.role === 'TEACHER';

  const teacherLinks = [
    { name: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
    {
      name: 'Approve Projects',
      href: '/approve-project',
      icon: ClipboardCheck,
    },
    { name: 'Award Coins', href: '/coin', icon: Coins },
  ];

  const studentLinks = [
    { name: 'Home', href: '/', icon: LayoutDashboard },
    { name: 'Create Project', href: '/create-project', icon: Plus },
    { name: 'My Projects', href: '/project-history', icon: History },
    { name: 'Leaderboard', href: '/leaderboard', icon: Podium },
    { name: 'Search Users', href: '/search-user', icon: Search },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const links = isTeacher ? teacherLinks : studentLinks;

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-gradient-to-b from-teal-950 via-teal-900 to-emerald-950 border-r border-teal-800/40 p-6 z-40 shadow-2xl shadow-teal-900/20 flex flex-col justify-between">
      <div>
        {}
        <div className="flex items-center gap-2.5 mt-2 mb-6">
          <div className="p-2 bg-gradient-to-br from-teal-400 to-emerald-400 rounded-2xl shadow-lg shadow-teal-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-tight">
              School Fund
            </h1>
            <p className="text-teal-300/60 text-[10px] font-medium uppercase tracking-wider">
              {isTeacher ? 'Teacher Portal' : 'Student Hub'}
            </p>
          </div>
        </div>

        {!loading && !isTeacher && showNotice && (
          <div className="relative mb-6 p-3.5 rounded-2xl bg-teal-800/40 border border-teal-500/30 text-teal-200 text-xs backdrop-blur-md shadow-lg transition-all animate-fadeIn">
            <button
              onClick={() => handleCloseNotice(false)}
              className="absolute top-2.5 right-2.5 text-teal-300/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1.5 font-semibold text-emerald-400 mb-1 pr-5">
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>Teacher Account?</span>
            </div>

            <p className="text-[11px] text-teal-300/80 leading-snug mb-2.5">
              Email your address to{' '}
              <a
                href="mailto:o.barkhas4@gmail.com"
                className="text-emerald-300 underline font-medium hover:text-white"
              >
                o.barkhas4@gmail.com
              </a>{' '}
              then re-login.
            </p>

            <button
              onClick={() => handleCloseNotice(true)}
              className="text-[10px] text-teal-400/80 hover:text-emerald-300 underline font-medium transition-colors"
            >
              Don't show again
            </button>
          </div>
        )}

        <nav className="flex flex-col gap-1.5">
          {loading && userId ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-11 bg-white/5 rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : (
            links.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-500/30 to-emerald-500/20 text-white shadow-lg shadow-teal-500/10 border border-teal-400/20'
                      : 'text-teal-200/70 hover:bg-white/5 hover:text-white hover:translate-x-0.5'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 ${isActive ? 'text-emerald-400' : ''}`}
                  />
                  <span>{link.name}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                  )}
                </Link>
              );
            })
          )}
        </nav>
      </div>

      <div className="p-4 rounded-2xl bg-white/5 border border-teal-700/20">
        <p className="text-[10px] text-teal-300/40 uppercase tracking-wider font-medium">
          Platform Status
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse" />
          <span className="text-xs text-teal-200/60">All Systems Active</span>
        </div>
      </div>
    </aside>
  );
}
