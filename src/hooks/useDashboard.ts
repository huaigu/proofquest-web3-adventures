import { useQuery } from '@tanstack/react-query';

interface DashboardData {
  statistics: {
    totalQuests: number;
    totalUsers: number;
    totalRewards: string;
    completedQuests: number;
    successRate: number;
    averageCompletionRate: number;
  };
  trendingQuests: Array<{
    id: string;
    title: string;
    description: string;
    totalRewards: string;
    rewardPerUser: string;
    maxParticipants: number;
    participantCount: number;
    participationProgress: number;
    participationPercentage: number;
    remainingRewards: string;
    timeRemaining: string;
    status: string;
  }>;
  topEarners: Array<{
    userAddress: string;
    totalRewardsEarned: string;
    totalParticipations: number;
    completionRate: number;
    rank: number;
  }>;
  recentActivity: Array<{
    type: 'quest_completed' | 'quest_created' | 'reward_claimed';
    questId: string;
    userAddress: string;
    amount?: string;
    timestamp: number;
    questTitle?: string;
  }>;
}

const fetchDashboardData = async (): Promise<DashboardData> => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  const response = await fetch(`${apiUrl}/api/dashboard/summary`);
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard data');
  }
  const result = await response.json();
  return result.data;
};

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: fetchDashboardData,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 15000, // Data is fresh for 15 seconds
  });
};

// Helper functions to format data
export const formatEthAmount = (weiAmount: string): string => {
  const ethAmount = parseFloat(weiAmount) / Math.pow(10, 18);
  if (ethAmount >= 1) {
    return `${ethAmount.toFixed(2)} ETH`;
  } else {
    return `${(ethAmount * 1000).toFixed(0)} mETH`;
  }
};

export const formatUserAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
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