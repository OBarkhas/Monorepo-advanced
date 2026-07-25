'use client';

import { use, useState } from 'react';
import { TypedDocumentNode } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import gql from 'graphql-tag';
import { toast } from 'sonner';
import {
  ArrowLeft,
  FolderKanban,
  Coins,
  Calendar,
  ShieldCheck,
  Loader2,
  MessageSquareX,
  AlertTriangle,
  Pencil,
  X,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { ProjectStatus } from '../../types/types';
import { VoteButton } from '../../components/VoteButton';

type ProjectDetail = {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  creatorId: string;
  totalCoinsCollected: number;
  rejectionReason?: string | null;
  createdAt: string;
};

const GET_PROJECT_BY_ID: TypedDocumentNode<
  { getProjectById: ProjectDetail | null },
  { id: string }
> = gql`
  query GetProjectById($id: ID!) {
    getProjectById(id: $id) {
      id
      title
      description
      status
      creatorId
      totalCoinsCollected
      rejectionReason
      createdAt
    }
  }
`;

const UPDATE_PROJECT: TypedDocumentNode<
  { updateProject: ProjectDetail },
  {
    id: string;
    title?: string | null;
    description?: string | null;
    creatorId: string;
  }
> = gql`
  mutation UpdateProject(
    $id: ID!
    $title: String
    $description: String
    $creatorId: ID!
  ) {
    updateProject(
      id: $id
      title: $title
      description: $description
      creatorId: $creatorId
    ) {
      id
      title
      description
      status
      creatorId
      totalCoinsCollected
      rejectionReason
      createdAt
    }
  }
`;

const DELETE_PROJECT = gql`
  mutation DeleteProject($projectId: ID!, $userId: ID!) {
    deleteProject(projectId: $projectId, userId: $userId) {
      success
      message
    }
  }
`;

interface PageProps {
  params: Promise<{ id: string }>;
}

const getStatusColors = (status: string) => {
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

export default function ProjectDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { userId, isLoaded } = useAuth();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_PROJECT_BY_ID, {
    variables: { id },
    skip: !userId,
    fetchPolicy: 'cache-and-network',
  });

  const [updateProject, { loading: updateLoading }] = useMutation(
    UPDATE_PROJECT,
    {
      refetchQueries: ['GetAllCombinedProjects', 'GetMyProjectHistory'],
    },
  );

  const [deleteProject, { loading: deleteLoading }] = useMutation(
    DELETE_PROJECT,
    {
      refetchQueries: ['GetAllCombinedProjects', 'GetLeaderboard'],
      onCompleted: (data: any) => {
        if (data.deleteProject.success) {
          toast.success('Project Deleted', {
            description:
              data.deleteProject.message || 'Project removed successfully.',
            icon: '🗑️',
          });
          router.push('/my-projects');
        }
      },
      onError: (err) => {
        toast.error('Delete Failed', {
          description: err.message,
        });
        setShowDeleteModal(false);
      },
    },
  );

  const isSaving = updateLoading;

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleEditClick = () => {
    const project = data?.getProjectById;
    if (project) {
      setEditTitle(project.title);
      setEditDescription(project.description);
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle('');
    setEditDescription('');
  };

  const handleDeleteConfirm = async () => {
    if (!userId) return;
    await deleteProject({
      variables: { projectId: id, userId },
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      await updateProject({
        variables: {
          id,
          title: editTitle,
          description: editDescription,
          creatorId: userId,
        },
      });

      toast.success('Project Resubmitted!', {
        description: 'Your edited project has been sent back for review.',
        icon: '🔄',
      });

      setIsEditing(false);
      setEditTitle('');
      setEditDescription('');
      refetch();
    } catch (err: any) {
      toast.error('Update Failed', {
        description: err.message || 'Failed to update the project.',
      });
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
        <p className="font-medium">Please sign in to view this project.</p>
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

  const project = data?.getProjectById;

  if (!project) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center p-10 bg-white/70 backdrop-blur rounded-3xl border border-dashed border-teal-200/50 shadow-lg shadow-teal-200/10">
        <p className="text-gray-500 mb-4">Project not found.</p>
        <Link
          href="/"
          className="inline-flex px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-500 text-white rounded-2xl text-sm font-medium hover:from-teal-500 hover:to-emerald-400 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-6 p-4 sm:p-6 space-y-6">
      <button
        onClick={handleBack}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-teal-600 transition-all hover:gap-2.5 cursor-pointer group"
      >
        <div className="p-1 rounded-xl bg-teal-50 group-hover:bg-teal-100 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </div>
        <span>Back</span>
      </button>

      <div className="bg-white/80 backdrop-blur-xl border border-teal-100/60 rounded-3xl p-6 sm:p-8 shadow-xl shadow-teal-200/20 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-teal-100/50 pb-6">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-2xl shadow-lg shadow-teal-200/30 mt-1">
              <FolderKanban className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                {project.title}
              </h1>
              <p className="text-xs font-mono text-gray-400 mt-1">
                ID: {project.id.slice(0, 16)}...
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1.5 text-xs font-bold rounded-full border uppercase tracking-wider self-start ${getStatusColors(project.status)}`}
          >
            {project.status}
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
            Description
          </h3>
          <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50/40 to-emerald-50/30 border border-teal-100/40">
            <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-teal-100/50 pt-6">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50">
            <Coins className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-[10px] text-amber-600 font-semibold uppercase tracking-wider">
                Coins Raised
              </p>
              <p className="text-lg font-bold text-gray-900">
                {project.totalCoinsCollected || 0}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200/50">
            <ShieldCheck className="h-5 w-5 text-teal-600" />
            <div>
              <p className="text-[10px] text-teal-600 font-semibold uppercase tracking-wider">
                Creator
              </p>
              <p className="text-sm font-bold text-gray-900 truncate max-w-[100px]">
                {project.creatorId === userId
                  ? 'You'
                  : project.creatorId.slice(0, 10) + '...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50/80 border border-gray-200/50">
            <Calendar className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                Launched
              </p>
              <p className="text-sm font-bold text-gray-900">
                {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {!isEditing &&
          project.status === 'REJECTED' &&
          project.rejectionReason && (
            <div className="p-5 rounded-2xl bg-red-50/80 backdrop-blur border border-red-200/60 flex items-start gap-3">
              <div className="p-1.5 bg-red-100 rounded-xl shrink-0 mt-0.5">
                <MessageSquareX className="h-5 w-5 text-red-600" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
                  <p className="text-xs font-bold text-red-700 uppercase tracking-wider">
                    Rejection Reason
                  </p>
                </div>
                <p className="text-sm text-red-700 leading-relaxed">
                  {project.rejectionReason}
                </p>
              </div>
            </div>
          )}

        {isEditing && (
          <div className="border-t border-teal-100/50 pt-6 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-100 rounded-xl">
                <Pencil className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Edit Project
                </h3>
                <p className="text-xs text-gray-500">
                  Update your project and resubmit for review
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Project title"
                  className="w-full border border-teal-200/60 p-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 text-sm bg-white/60 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Describe your project..."
                  className="w-full border border-teal-200/60 p-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 text-sm bg-white/60 transition-all resize-none"
                  rows={5}
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-2xl font-medium text-sm hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isSaving || !editTitle.trim() || !editDescription.trim()
                  }
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-2xl font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-emerald-200/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4" />
                  )}
                  {isSaving ? 'Saving...' : 'Save & Resubmit'}
                </button>
              </div>
            </form>
          </div>
        )}

        {!isEditing && (
          <VoteButton projectId={project.id} creatorId={project.creatorId} />
        )}

        {project.creatorId === userId && !isEditing && (
          <div className="border-t border-teal-100/50 pt-4 flex items-center gap-3 justify-end">
            {project.status === 'REJECTED' && (
              <button
                onClick={handleEditClick}
                className="px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-md hover:shadow-lg hover:shadow-emerald-200/40"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit Project
              </button>
            )}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-1.5 bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 hover:text-red-600 shadow-sm"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !deleteLoading && setShowDeleteModal(false)}
          />

          <div className="relative bg-white/95 backdrop-blur-xl border border-red-200/60 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="h-7 w-7 text-red-600" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900">
                  Delete Project
                </h3>
                <p className="text-sm text-gray-500 max-w-xs">
                  Are you sure you want to delete{' '}
                  <span className="font-semibold text-gray-700">
                    "{project.title}"
                  </span>
                  ? This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3 w-full pt-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-2xl font-medium text-sm hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-2xl font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-red-200/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  {deleteLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
