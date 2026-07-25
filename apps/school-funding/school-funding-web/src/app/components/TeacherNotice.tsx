'use client';

import { useUser } from '@clerk/nextjs';

export function TeacherNotice() {
  const { user, isLoaded } = useUser();

  if (!isLoaded || !user) return null;

  const publicRole = user.publicMetadata?.role as string | undefined;
  const unsafeRole = user.unsafeMetadata?.role as string | undefined;

  const currentRole = (publicRole || unsafeRole || '').toUpperCase();

  if (currentRole === 'TEACHER') {
    return null;
  }

  return (
    <div className="hidden lg:flex items-center gap-2 bg-teal-50/80 border border-teal-200/60 rounded-2xl px-3.5 py-2 text-xs text-teal-800 shadow-sm backdrop-blur-sm max-w-lg">
      <svg
        className="w-4 h-4 text-teal-600 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0 1 18 0z"
        />
      </svg>
      <p className="leading-tight">
        <span className="font-semibold text-teal-900">Teacher Account?</span>{' '}
        Email your address to{' '}
        <a
          href="mailto:o.barkhas4@gmail.com"
          className="font-bold text-teal-700 underline decoration-teal-300 hover:text-teal-900 transition-colors"
        >
          o.barkhas4@gmail.com
        </a>{' '}
        then re-login.
      </p>
    </div>
  );
}
