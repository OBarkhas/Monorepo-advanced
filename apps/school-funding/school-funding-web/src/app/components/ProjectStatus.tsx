'use client';

import { useState } from 'react';
import { TypedDocumentNode } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { useAuth } from '@clerk/nextjs';
import gql from 'graphql-tag';
import { toast } from 'sonner';
import {
  ClipboardCheck,
  Loader2,
  Check,
  X,
  MessageSquareX,
  AlertTriangle,
} from 'lucide-react';

type Project = {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FUNDED';
  creatorId: string;
};

const GET_PENDING_PROJECTS: TypedDocumentNode<{
  getPendingProjects: Project[];
}> = gql`
  query GetPendingProjects {
    getPendingProjects {
      id
      title
      description
      status
      creatorId
    }
  }
`;

const PROJECT_ACTION = gql`
  mutation ProjectAction(
    $id: ID!
    $status: ProjectStatus!
    $reviewedById: ID!
    $rejectionReason: String
  ) {
    projectAction(
      id: $id
      status: $status
      reviewedById: $reviewedById
      rejectionReason: $rejectionReason
    ) {
      id
      status
    }
  }
`;

export default function ProjectStatus() {
  const { userId } = useAuth();

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectProjectId, setRejectProjectId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  const { data, loading, refetch } = useQuery(GET_PENDING_PROJECTS, {
    fetchPolicy: 'cache-and-network',
  });

  const [executeProjectAction, { loading: reviewing }] = useMutation(
    PROJECT_ACTION,
    {
      refetchQueries: [
        'GetAllCombinedProjects',
        'GetPendingProjects',
        'GetMyProjectHistory',
      ],
      onCompleted: (data: any) => {
        const action =
          data.projectAction.status === 'APPROVED' ? 'approved' : 'rejected';
        toast.success(`Project ${action}!`, {
          description: `Status updated to ${data.projectAction.status}.`,
          icon: action === 'approved' ? '✅' : '❌',
        });
        setRejectModalOpen(false);
        setRejectionReason('');
        setRejectError('');
        setRejectProjectId(null);
      },
      onError: (err) => {
        toast.error('Review Failed', {
          description: err.message,
        });
      },
    },
  );

  const openRejectModal = (id: string) => {
    setRejectProjectId(id);
    setRejectionReason('');
    setRejectError('');
    setRejectModalOpen(true);
  };

  const handleApprove = async (id: string) => {
    if (!userId) return;
    await executeProjectAction({
      variables: {
        id,
        status: 'APPROVED',
        reviewedById: userId,
      },
    });
  };

  const handleRejectSubmit = async () => {
    if (!userId || !rejectProjectId) return;

    const trimmed = rejectionReason.trim();
    if (!trimmed) {
      setRejectError('Please provide a reason for rejection.');
      return;
    }

    await executeProjectAction({
      variables: {
        id: rejectProjectId,
        status: 'REJECTED',
        reviewedById: userId,
        rejectionReason: trimmed,
      },
    });
  };

  const closeRejectModal = () => {
    setRejectModalOpen(false);
    setRejectProjectId(null);
    setRejectionReason('');
    setRejectError('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  const pendingProjects = data?.getPendingProjects || [];

  return (
    <div className="max-w-4xl mx-auto mt-6 p-4 sm:p-6 space-y-6">
      {}
      <div className="flex items-center gap-3 border-b border-teal-100/50 pb-5">
        <div className="p-2.5 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-2xl shadow-lg shadow-teal-200/30">
          <ClipboardCheck className="h-6 w-6 text-teal-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Pending Reviews
          </h1>
          <p className="text-sm text-gray-500">
            {pendingProjects.length} project
            {pendingProjects.length !== 1 && 's'} awaiting your decision
          </p>
        </div>
      </div>

      {pendingProjects.length === 0 ? (
        <div className="p-12 text-center bg-white/70 backdrop-blur rounded-3xl border border-teal-100/50 shadow-lg shadow-teal-200/10">
          <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl w-fit mx-auto mb-4">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            All Clear!
          </h3>
          <p className="text-gray-500 text-sm">
            No pending projects to review at the moment.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white/80 backdrop-blur-xl border border-teal-100/60 rounded-3xl p-6 shadow-lg shadow-teal-200/10 hover:shadow-xl hover:shadow-teal-200/20 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-gray-900">
                    {project.title}
                  </h3>
                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200/50 uppercase tracking-wider">
                    Pending
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                  {project.description}
                </p>
              </div>

              <div className="flex gap-2 shrink-0 w-full md:w-auto">
                <button
                  disabled={reviewing}
                  onClick={() => handleApprove(project.id)}
                  className="flex-1 md:flex-none px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-medium text-sm hover:from-emerald-400 hover:to-teal-400 transition-all disabled:opacity-50 shadow-md hover:shadow-lg hover:shadow-emerald-200/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {reviewing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Approve
                </button>
                <button
                  disabled={reviewing}
                  onClick={() => openRejectModal(project.id)}
                  className="flex-1 md:flex-none px-5 py-2.5 bg-white border border-red-200 text-red-600 rounded-2xl font-medium text-sm hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <X className="h-4 w-4" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeRejectModal}
          />

          <div className="relative bg-white rounded-3xl shadow-2xl shadow-black/20 border border-red-100/80 w-full max-w-md mx-4 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 to-rose-400 rounded-t-3xl" />

            <div className="mt-2 space-y-5">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-2xl shrink-0">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Reject Project
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Provide a reason so the student understands why their
                    project was rejected.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => {
                    setRejectionReason(e.target.value);
                    if (rejectError) setRejectError('');
                  }}
                  placeholder="Explain why this project is being rejected..."
                  className={`w-full border ${
                    rejectError
                      ? 'border-red-300 focus:ring-red-500/40'
                      : 'border-red-200/60 focus:ring-red-500/40'
                  } p-3 rounded-2xl focus:outline-none focus:ring-2 focus:border-red-500 text-sm bg-white/60 transition-all resize-none`}
                  rows={4}
                  autoFocus
                />
                {rejectError && (
                  <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1">
                    <MessageSquareX className="h-3.5 w-3.5" />
                    {rejectError}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={closeRejectModal}
                  disabled={reviewing}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-2xl font-medium text-sm hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectSubmit}
                  disabled={reviewing || !rejectionReason.trim()}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-2xl font-medium text-sm hover:from-red-500 hover:to-rose-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg hover:shadow-red-200/40 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {reviewing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  {reviewing ? 'Rejecting...' : 'Confirm Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
