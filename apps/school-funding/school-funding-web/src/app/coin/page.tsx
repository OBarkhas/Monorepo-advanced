'use client';

import { useState, useEffect, useMemo } from 'react';
import { TypedDocumentNode } from '@apollo/client';
import { useMutation, useLazyQuery } from '@apollo/client/react';
import { useAuth } from '@clerk/nextjs';
import gql from 'graphql-tag';
import { toast } from 'sonner';
import {
  Gift,
  Loader2,
  Coins,
  Sparkles,
  User,
  DollarSign,
  Search,
  GraduationCap,
  CheckCircle2,
  Hash,
} from 'lucide-react';
import { UserRole } from '../types/types';

type StudentUser = {
  id: string;
  userName: string;
  email: string;
  role: UserRole;
  age?: number | null;
  coinBalance: number;
};

const AWARD_COINS: TypedDocumentNode<
  {
    awardCoins: {
      id: string;
      userName: string;
      email: string;
      coinBalance: number;
    };
  },
  { teacherId: string; studentId: string; amount: number }
> = gql`
  mutation AwardCoins($teacherId: ID!, $studentId: ID!, $amount: Int!) {
    awardCoins(teacherId: $teacherId, studentId: $studentId, amount: $amount) {
      id
      userName
      email
      coinBalance
    }
  }
`;

const GET_USERS: TypedDocumentNode<{ getUsers: StudentUser[] }, {}> = gql`
  query GetUsers {
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

export default function AwardCoinsPage() {
  const { userId, isLoaded } = useAuth();

  const [studentId, setStudentId] = useState<string>('');
  const [amount, setAmount] = useState<number>(10);
  const [selectedStudent, setSelectedStudent] = useState<StudentUser | null>(
    null,
  );

  const [searchTerm, setSearchTerm] = useState('');

  const [fetchUsers, { data, loading: usersLoading, error: usersError }] =
    useLazyQuery(GET_USERS, {
      fetchPolicy: 'cache-and-network',
    });

  const [awardCoins, { loading: awarding }] = useMutation(AWARD_COINS, {
    refetchQueries: ['GetUserRole', 'GetMyProfileAndProjects'],
    onCompleted: (d: {
      awardCoins: { userName: string; coinBalance: number };
    }) => {
      toast.success('Coins Awarded!', {
        description: `+${amount} coins given to ${d.awardCoins.userName}. New balance: ${d.awardCoins.coinBalance}`,
        icon: '🪙',
      });
      setStudentId('');
      setAmount(10);
      setSelectedStudent(null);
    },
    onError: (error) => {
      toast.error('Award Failed', {
        description: error.message,
      });
    },
  });

  useEffect(() => {
    if (userId) {
      fetchUsers();
    }
  }, [userId, fetchUsers]);

  const students = useMemo<StudentUser[]>(() => {
    const allUsers = data?.getUsers || [];
    return allUsers.filter((u) => u.role === UserRole.STUDENT);
  }, [data]);

  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;
    const term = searchTerm.toLowerCase();
    return students.filter(
      (s) =>
        s.userName.toLowerCase().includes(term) ||
        s.id.toLowerCase().includes(term),
    );
  }, [students, searchTerm]);

  const handleSelectStudent = (student: StudentUser) => {
    setSelectedStudent(student);
    setStudentId(student.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error('Not authenticated', {
        description: 'Please sign in as a teacher.',
      });
      return;
    }

    if (!studentId.trim()) {
      toast.error('Missing student ID', {
        description: 'Please select a student or enter a student ID.',
      });
      return;
    }

    if (amount <= 0) {
      toast.error('Invalid amount', {
        description: 'Coin amount must be greater than 0.',
      });
      return;
    }

    await awardCoins({
      variables: {
        teacherId: userId,
        studentId: studentId.trim(),
        amount: Number(amount),
      },
    });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-teal-50/40 via-white to-emerald-50/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-teal-50/40 via-white to-emerald-50/30 flex items-center justify-center p-4">
        <div className="max-w-md p-6 text-center bg-white/80 backdrop-blur-xl rounded-3xl text-teal-700 border border-teal-200/50 shadow-xl">
          <p className="font-medium">
            Please sign in as a teacher to award coins.
          </p>
        </div>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-teal-50/40 via-white to-emerald-50/30 p-4 sm:p-6 lg:p-8">
      {}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-3xl shadow-lg shadow-teal-200/50">
            <Gift className="h-8 w-8 text-teal-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Award Coins
            </h1>
            <p className="text-gray-500 mt-0.5 text-sm">
              Select a student and reward them with coins
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {}
        <div className="bg-white/80 backdrop-blur-xl border border-teal-100/60 rounded-3xl shadow-xl shadow-teal-200/20 overflow-hidden flex flex-col">
          {}
          <div className="p-5 border-b border-teal-100/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-teal-600" />
                <h2 className="text-lg font-bold text-gray-900">
                  Select Student
                </h2>
              </div>
              {selectedStudent && (
                <span className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-medium border border-emerald-200/50">
                  {students.length} students
                </span>
              )}
            </div>
          </div>

          <div className="p-4 border-b border-teal-100/30">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-400 group-focus-within:text-teal-600 transition-colors" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-teal-200/60 rounded-2xl bg-white/70 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all text-sm text-gray-900 placeholder-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-96 p-3 space-y-1.5">
            {usersLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 text-teal-500 animate-spin" />
              </div>
            )}

            {usersError && (
              <div className="p-4 mx-2 bg-red-50/80 backdrop-blur rounded-2xl text-red-600 border border-red-200/60 text-sm">
                Error loading students: {usersError.message}
              </div>
            )}

            {!usersLoading && !usersError && filteredStudents.length === 0 && (
              <div className="py-12 text-center">
                <User className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">
                  {searchTerm
                    ? `No students matching "${searchTerm}"`
                    : 'No students found'}
                </p>
              </div>
            )}

            {!usersLoading &&
              !usersError &&
              filteredStudents.map((student) => {
                const isSelected = selectedStudent?.id === student.id;
                const hue = nameToHue(student.userName);

                return (
                  <button
                    key={student.id}
                    onClick={() => handleSelectStudent(student)}
                    className={`w-full text-left p-3 rounded-2xl transition-all duration-200 cursor-pointer flex items-center gap-3 group ${
                      isSelected
                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-400 shadow-md shadow-emerald-200/40 scale-[1.02]'
                        : 'bg-white/60 border-2 border-transparent hover:border-teal-200/60 hover:bg-teal-50/40 hover:shadow-sm'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm"
                      style={{
                        backgroundColor: `hsl(${hue}, 55%, 55%)`,
                      }}
                    >
                      {getInitials(student.userName)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold text-sm truncate ${
                            isSelected ? 'text-emerald-800' : 'text-gray-800'
                          }`}
                        >
                          {student.userName}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          {student.id.slice(0, 10)}…
                        </span>
                        {student.age != null && (
                          <span className="text-xs text-teal-600 flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            Grade {student.age}
                          </span>
                        )}
                        <span className="text-xs text-amber-600 flex items-center gap-1">
                          <Coins className="h-3 w-3" />
                          {student.coinBalance}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono uppercase tracking-wider text-teal-500 bg-teal-50 px-2 py-1 rounded-lg border border-teal-200/40 shrink-0 group-hover:bg-teal-100/50 transition-colors">
                      Student
                    </span>
                  </button>
                );
              })}
          </div>

          {selectedStudent && (
            <div className="p-3 border-t border-teal-100/50 bg-gradient-to-r from-emerald-50/60 to-teal-50/60">
              <div className="flex items-center gap-2 text-sm text-emerald-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="font-medium">{selectedStudent.userName}</span>
                <span className="text-emerald-400">•</span>
                <span className="text-xs text-emerald-500 font-mono">
                  {selectedStudent.id.slice(0, 12)}…
                </span>
                <button
                  onClick={() => {
                    setSelectedStudent(null);
                    setStudentId('');
                  }}
                  className="ml-auto text-xs text-teal-500 hover:text-teal-700 hover:underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="bg-white/80 backdrop-blur-xl border border-teal-100/60 rounded-3xl p-6 shadow-xl shadow-teal-200/20 space-y-5">
            <div className="text-center pb-1">
              <div className="p-2 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-2xl w-fit mx-auto mb-3 shadow-md">
                <Gift className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Award Coins</h3>
              <p className="text-xs text-gray-500">Enter amount and submit</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <User className="h-4 w-4 text-teal-500" />
                    <span>Student ID</span>
                    {selectedStudent && (
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-normal border border-emerald-200/50 ml-auto">
                        Auto-filled ✓
                      </span>
                    )}
                  </div>
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => {
                    setStudentId(e.target.value);
                    // Deselect if manually editing
                    if (
                      selectedStudent &&
                      e.target.value !== selectedStudent.id
                    ) {
                      setSelectedStudent(null);
                    }
                  }}
                  placeholder="Select a student from the list..."
                  className="w-full px-4 py-3 border border-teal-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 text-sm bg-white/60 transition-all disabled:opacity-70"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    <span>Coin Amount</span>
                  </div>
                </label>
                <div className="relative">
                  <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="10"
                    className="w-full pl-10 pr-4 py-3 border border-teal-200/60 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 text-sm bg-white/60 transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={awarding || !studentId.trim()}
                className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-teal-200/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                {awarding ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Award Coins</span>
                  </>
                )}
              </button>
            </form>

            {selectedStudent && (
              <div className="p-3 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200/50 text-xs text-gray-600 space-y-1">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-teal-500" />
                  <span className="font-medium text-gray-700">
                    {selectedStudent.userName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Coins className="h-3.5 w-3.5 text-amber-500" />
                  <span>
                    Current balance:{' '}
                    <span className="font-semibold text-amber-700">
                      {selectedStudent.coinBalance} coins
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="h-3.5 w-3.5 text-gray-400" />
                  <span className="font-mono text-gray-400">
                    ID: {selectedStudent.id}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
