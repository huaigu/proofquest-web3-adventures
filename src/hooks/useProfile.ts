import { useQuery } from '@tanstack/react-query';

interface ProfileData {
  profile: {
    userAddress: string;
    joinDate: string;
    totalEarned: string;
    questsCompleted: number;
    questsCreated: number;
    successRate: number;
    rank: number;
    totalUsers: number;
  };
  quests: {
    active: Array<{
      id: string;
      title: string;
      description: string;
      rewardPerUser: string;
      maxParticipants: number;
      participantCount: number;
      participationProgress: number;
      participationPercentage: number;
      timeRemaining: string;
      userParticipated: boolean;
      status: string;
    }>;
    completed: Array<{
      id: string;
      title: string;
      description: string;
      completedDate: string;
      rewardEarned: string;
      userParticipation: {
        id: string;
        questId: string;
        userAddress: string;
        claimedAmount: string;
        claimedAt: number;
        transactionHash: string;
        blockNumber: number;
        createdAt: number;
      };
    }>;
    created: Array<{
      id: string;
      title: string;
      description: string;
      totalRewards: string;
      maxParticipants: number;
      participantCount: number;
      participationProgress: number;
      participationPercentage: number;
      totalRewardsDistributed: string;
      status: string;
    }>;
  };
  rewards: {
    pending: Array<{
      questId: string;
      questTitle: string;
      amount: string;
      type: string;
      claimable: boolean;
    }>;
    history: Array<{
      questId: string;
      questTitle: string;
      amount: string;
      type: string;
      date: string;
      txHash: string;
    }>;
    vesting: Array<{
      questId: string;
      questTitle: string;
      totalAmount: string;
      vestedAmount: string;
      claimableAmount: string;
      vestingProgress: number;
      timeRemaining: string;
    }>;
  };
  activity: Array<{
    type: 'quest_completed' | 'quest_created' | 'reward_claimed';
    description: string;
    timestamp: number;
    questId?: string;
    amount?: string;
  }>;
}

const fetchProfileData = async (address: string): Promise<ProfileData> => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const response = await fetch(`${apiUrl}/api/profile/${address}/summary`);
  if (!response.ok) {
    throw new Error('Failed to fetch profile data');
  }
  const result = await response.json();
  return result.data;
};

export const useProfile = (address: string | undefined) => {
  return useQuery({
    queryKey: ['profile', address],
    queryFn: () => fetchProfileData(address!),
    enabled: !!address, // Only run query if address is provided
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Data is fresh for 15 seconds
  });
};

// Helper functions to format data
export const formatEthAmount = (weiAmount: string): string => {
  const monAmount = parseFloat(weiAmount) / Math.pow(10, 18);
  if (monAmount >= 1) {
    return `${monAmount.toFixed(2)} MON`;
  } else {
    return `${(monAmount * 1000).toFixed(0)} mMON`;
  }
};

export const formatUserAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    return `${diffDays}d ago`;
  }
};

export const getActivityIcon = (type: string) => {
  switch (type) {
    case 'quest_completed':
    case 'reward_claimed':
      return 'CheckCircle2';
    case 'quest_created':
      return 'Plus';
    default:
      return 'Activity';
  }
};