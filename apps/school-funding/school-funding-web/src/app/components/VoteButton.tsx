'use client';

import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useAuth } from '@clerk/nextjs';
import gql from 'graphql-tag';
import { toast } from 'sonner';
import { Coins, Loader2, ThumbsUp } from 'lucide-react';

const VOTE_PROJECT = gql`
  mutation VoteProject($projectId: ID!, $userId: ID!, $coinAmount: Int!) {
    voteProject(
      projectId: $projectId
      userId: $userId
      coinAmount: $coinAmount
    ) {
      id
      projectId
      coinAmount
    }
  }
`;

interface VoteButtonProps {
  projectId: string;
  creatorId: string;
  onSuccess?: () => void;
}

export function VoteButton({
  projectId,
  creatorId,
  onSuccess,
}: VoteButtonProps) {
  const { userId } = useAuth();
  const [coinAmount, setCoinAmount] = useState<number>(1);

  const [voteProject, { loading }] = useMutation(VOTE_PROJECT, {
    refetchQueries: ['GetAllCombinedProjects', 'GetLeaderboard', 'GetProjectById'],
    onCompleted: (data: any) => {
      toast.success('Vote Cast!', {
        description: `You donated ${data.voteProject.coinAmount} coins to this project.`,
        icon: '🪙',
      });
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      toast.error('Vote Failed', {
        description: err.message,
      });
    },
  });

  const handleVote = async () => {
    if (!userId) {
      toast.error('Not signed in', {
        description: 'Please sign in to vote.',
      });
      return;
    }

    if (userId === creatorId) {
      toast.error('Cannot vote', {
        description: 'You cannot vote for your own project.',
      });
      return;
    }

    await voteProject({
      variables: {
        projectId,
        userId,
        coinAmount: Number(coinAmount),
      },
    });
  };

  const isOwner = userId === creatorId;

  return (
    <div className="p-5 bg-gradient-to-br from-teal-50/80 to-emerald-50/80 backdrop-blur rounded-2xl border border-teal-200/50 space-y-3">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-teal-100 rounded-xl">
          <ThumbsUp className="h-4 w-4 text-teal-600" />
        </div>
        <span className="text-sm font-semibold text-gray-700">
          {isOwner ? 'Your Project' : 'Support this Project'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-500" />
          <input
            type="number"
            min="1"
            disabled={isOwner || loading}
            value={coinAmount}
            onChange={(e) => setCoinAmount(Math.max(1, Number(e.target.value)))}
            className="w-full pl-10 pr-3 py-2.5 border border-teal-200/60 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 bg-white/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <button
          onClick={handleVote}
          disabled={isOwner || loading}
          className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white font-semibold text-sm rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-teal-200/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isOwner ? (
            'Own Project'
          ) : (
            'Donate Coins'
          )}
        </button>
      </div>
    </div>
  );
}
