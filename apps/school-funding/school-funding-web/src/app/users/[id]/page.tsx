'use client';

import { use, useMemo } from 'react';
import { TypedDocumentNode } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import gql from 'graphql-tag';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Shield,
  FolderKanban,
  Coins,
  ArrowUpRight,
  Loader2,
  Calendar,
  Trophy,
  CheckCircle2,
  Clock,
  XCircle,
  GraduationCap,
  Award,
  Hash,
  Sparkles,
} from 'lucide-react';
import { UserRole, Project, CoinTransaction } from '../../types/types';

type FullUser = {
  id: string;
  email: string;
  userName: string;
  role: UserRole;
  age?: number | null;
  coinBalance: number;
  createdAt: string;
};

type StudentUser = {
  id: string;
  userName: string;
  email: string;
  role: UserRole;
  age?: number | null;
  coinBalance: number;
};

const GET_USER_PROFILE_AND_PROJECTS: TypedDocumentNode<
  {
    getUserById: FullUser | null;
    getProjectsByStudent: Project[];
    getCoinAwardsByStudent: CoinTransaction[];
  },
  { id: string; studentId: string }
> = gql`
  query GetUserProfileAndProjects($id: ID!, $studentId: ID!) {
    getUserById(id: $id) {
      id
      userName
      email
      role
      age
      coinBalance
      createdAt
    }
    getProjectsByStudent(studentId: $studentId) {
      id
      title
      description
      status
      rejectionReason
      totalCoinsCollected
      createdAt
    }
    getCoinAwardsByStudent(studentId: $studentId) {
      id
      userId
      amount
      type
      referenceId
      createdAt
    }
  }
`;

const GET_ALL_USERS_FOR_TEACHER: TypedDocumentNode<
  { getUsers: StudentUser[] },
  {}
> = gql`
  query GetAllUsersForTeacher {
    getUsers {
      id
      userName
      email
      role
      age
      coinBalance
    }
  }
`;

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join('');
}

function nameToHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  const { data, loading, error } = useQuery(GET_USER_PROFILE_AND_PROJECTS, {
    variables: { id, studentId: id },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
  });

  const { data: usersData, loading: usersLoading } = useQuery(
    GET_ALL_USERS_FOR_TEACHER,
    {
      skip: !userId || data?.getUserById?.role !== 'TEACHER',
      fetchPolicy: 'cache-and-network',
    },
  );

  const user = data?.getUserById;
  const projects = data?.getProjectsByStudent || [];
  const coinAwards = data?.getCoinAwardsByStudent || [];
  const isTeacher = user?.role === 'TEACHER';
  const isOwnProfile = userId === id;

  const projectStats = useMemo(() => {
    const total = projects.length;
    const approved = projects.filter(
      (p) => p.status === 'APPROVED' || p.status === 'FUNDED',
    ).length;
    const pending = projects.filter((p) => p.status === 'PENDING').length;
    const rejected = projects.filter((p) => p.status === 'REJECTED').length;
    return { total, approved, pending, rejected };
  }, [projects]);

  const coinStats = useMemo(() => {
    const awardsReceived = coinAwards
      .filter((t) => t.type === 'AWARD')
      .reduce((sum, t) => sum + t.amount, 0);
    const votesCast = coinAwards
      .filter((t) => t.type === 'VOTE')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return { awardsReceived, votesCast };
  }, [coinAwards]);

  const students = useMemo(() => {
    const all = usersData?.getUsers || [];
    return all.filter((u) => u.role === UserRole.STUDENT);
  }, [usersData]);

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/search-user');
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="max-w-lg mx-auto mt-16 p-6 text-center glass-dark rounded-3xl text-teal-700 border border-teal-200/50">
        <p className="font-medium">Please sign in to view this profile.</p>
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

  if (!user) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center p-10 bg-white/70 backdrop-blur rounded-3xl border border-dashed border-teal-200/50 shadow-lg shadow-teal-200/10">
        <p className="text-gray-500 mb-4">User profile not found.</p>
        <Link
          href="/search-user"
          className="inline-flex px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-2xl text-sm font-medium hover:from-teal-500 hover:to-emerald-400 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Back to Directory
        </Link>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto mt-6 p-4 sm:p-6 space-y-8">
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 transition-all hover:gap-2.5 cursor-pointer group"
      >
        <div className="p-1 rounded-xl bg-teal-50 group-hover:bg-teal-100 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </div>
        <span>Back to directory</span>
      </button>

      <div className="bg-white/80 backdrop-blur-xl border border-teal-100/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-teal-200/20 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mt-2">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shrink-0"
            style={{
              backgroundColor: `hsl(${nameToHue(user.userName)}, 55%, 55%)`,
            }}
          >
            {getInitials(user.userName)}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                {user.userName}
              </h1>
              {isOwnProfile && (
                <span className="px-2.5 py-0.5 text-[10px] font-medium rounded-full bg-teal-100 text-teal-700 border border-teal-200 whitespace-nowrap">
                  You
                </span>
              )}
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-800 border border-teal-200/50 uppercase tracking-wide whitespace-nowrap">
                {user.role}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
              <span className="font-mono flex items-center gap-1">
                <Hash className="h-3 w-3" />
                {user.id.slice(0, 16)}...
              </span>
              {user.age != null && (
                <span className="flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" />
                  Age {user.age}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Joined {formatDate(user.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 border-t border-teal-100/50 pt-6">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-xl">
              <Coins className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] text-amber-600 font-semibold uppercase tracking-wider">
                Coin Balance
              </p>
              <p className="text-xl font-bold text-gray-900">
                {user.coinBalance ?? 0}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200/50 flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-xl">
              <FolderKanban className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="text-[10px] text-teal-600 font-semibold uppercase tracking-wider">
                {isTeacher ? 'Students' : 'Projects'}
              </p>
              <p className="text-xl font-bold text-gray-900">
                {isTeacher ? students.length : projectStats.total}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200/50 flex items-center gap-3">
            <div className="p-2 bg-violet-100 rounded-xl">
              <Trophy className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-[10px] text-violet-600 font-semibold uppercase tracking-wider">
                {isTeacher ? 'Coins Awarded' : 'Awards Received'}
              </p>
              <p className="text-xl font-bold text-gray-900">
                {isTeacher ? '—' : coinStats.awardsReceived}
              </p>
            </div>
          </div>
        </div>

        {!isTeacher && projectStats.total > 0 && (
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-teal-100/50">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Breakdown:
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/50 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3 w-3" />
              {projectStats.approved} Approved
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/50 text-xs font-semibold text-amber-700">
              <Clock className="h-3 w-3" />
              {projectStats.pending} Pending
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200/50 text-xs font-semibold text-red-700">
              <XCircle className="h-3 w-3" />
              {projectStats.rejected} Rejected
            </span>
          </div>
        )}
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-teal-100/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-teal-200/20 space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-100 rounded-xl">
            <Shield className="h-4 w-4 text-teal-600" />
          </div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
            Account Details
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-teal-50/40 border border-teal-100/50">
            <Mail className="h-5 w-5 text-teal-500 shrink-0" />
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                Email Address
              </p>
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-teal-50/40 border border-teal-100/50">
            <Calendar className="h-5 w-5 text-teal-500 shrink-0" />
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                Member Since
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {isTeacher ? (
        /* ── TEACHER VIEW: Student Directory ────────────────────── */
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-xl">
              <GraduationCap className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                Students
              </h2>
              <p className="text-xs text-gray-500">
                {students.length} student{students.length !== 1 && 's'} on the
                platform
              </p>
            </div>
          </div>

          {usersLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 text-teal-500 animate-spin" />
            </div>
          ) : students.length > 0 ? (
            <div className="grid gap-3">
              {students.map((student) => {
                const hue = nameToHue(student.userName);
                return (
                  <Link
                    key={student.id}
                    href={`/users/${student.id}`}
                    className="group bg-white/80 backdrop-blur-xl border border-teal-100/60 rounded-2xl p-4 shadow-md shadow-teal-200/10 hover:shadow-lg hover:shadow-teal-200/20 transition-all duration-300 hover:scale-[1.01] cursor-pointer flex items-center gap-4"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm"
                      style={{ backgroundColor: `hsl(${hue}, 55%, 55%)` }}
                    >
                      {getInitials(student.userName)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm group-hover:text-teal-600 transition-colors truncate">
                          {student.userName}
                        </span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-teal-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                        <span className="font-mono">
                          {student.id.slice(0, 10)}…
                        </span>
                        {student.age != null && <span>Age {student.age}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50">
                      <Coins className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-bold text-gray-900">
                        {student.coinBalance}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="p-10 text-center bg-white/70 backdrop-blur rounded-3xl border border-dashed border-teal-200/50">
              <GraduationCap className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">
                No students registered on the platform yet.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* ── STUDENT VIEW: Projects List ──────────────────────────── */
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-xl">
              <Award className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                Projects
              </h2>
              <p className="text-xs text-gray-500">
                {projectStats.total} project{projectStats.total !== 1 && 's'}{' '}
                created
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {projects.length > 0 ? (
              projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="group bg-white/80 backdrop-blur-xl border border-teal-100/60 rounded-3xl p-5 shadow-lg shadow-teal-200/10 hover:shadow-xl hover:shadow-teal-200/20 transition-all duration-300 hover:scale-[1.01] cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-base group-hover:text-teal-600 transition-colors flex items-center gap-1.5">
                        <span className="truncate max-w-[200px] sm:max-w-xs">
                          {project.title}
                        </span>
                        <ArrowUpRight className="h-4 w-4 text-teal-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-full border uppercase tracking-wide shrink-0 ${getStatusStyle(project.status)}`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
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
              <div className="p-10 text-center bg-white/70 backdrop-blur rounded-3xl border border-dashed border-teal-200/50 shadow-lg shadow-teal-200/10">
                <Sparkles className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">
                  This user hasn't created any projects yet.
                </p>
                {isOwnProfile && (
                  <Link
                    href="/create-project"
                    className="inline-flex items-center gap-1.5 mt-4 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-2xl text-sm font-medium hover:from-teal-500 hover:to-emerald-400 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                  >
                    <Sparkles className="h-4 w-4" />
                    Create Your First Project
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
