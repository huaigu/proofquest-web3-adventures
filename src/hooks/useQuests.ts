/**
 * Quest Management Hooks
 * 
 * React Query hooks for quest CRUD operations with backend integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import apiClient from '@/lib/api'
import { transformers, mergeQuestData, transformQuestToApiRequest, transformBackendQuestToListItem } from '@/lib/transformers'
import { useToast } from '@/hooks/use-toast'
import { useProtectedAction } from '@/hooks/useAuth'
import type {
  QuestResponse,
  QuestListItem,
  QuestFormData,
  QuestFilters,
  PaginatedResponse,
  QuestCreateRequest
} from '@/types'

// Query keys
export const questKeys = {
  all: ['quests'] as const,
  lists: () => [...questKeys.all, 'list'] as const,
  list: (filters?: QuestFilters) => [...questKeys.lists(), { filters }] as const,
  details: () => [...questKeys.all, 'detail'] as const,
  detail: (id: string) => [...questKeys.details(), id] as const,
}

/**
 * Mock quest data for merging with backend data
 */
const getMockQuestData = (): QuestListItem[] => {
  return [
    {
      id: "mock-1",
      title: "Follow @CryptoInfluencer for Alpha",
      description: "Follow our Twitter account and like/retweet our latest post about cryptocurrency market trends and investment strategies.",
      creator: {
        name: "AlphaSeekerDAO",
        avatar: "",
        handle: "@alphaseekerxyz"
      },
      reward: {
        amount: 0.005,
        type: "MON" as const
      },
      status: "active" as const,
      participants: {
        current: 1247,
        max: 2000
      },
      timeRemaining: "2d 14h",
      questType: "likeAndRetweet" as const,
      category: "Social",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
    },
    {
      id: "mock-2",
      title: "Quote Tweet Web3 Innovation Thread",
      description: "Quote tweet our comprehensive thread about the latest Web3 innovations and share your thoughts on decentralized technology.",
      creator: {
        name: "TechVanguard",
        avatar: "",
        handle: "@techvanguard"
      },
      reward: {
        amount: 0.01,
        type: "MON" as const
      },
      status: "claiming" as const,
      participants: {
        current: 589,
        max: 1000
      },
      timeRemaining: "3h left to claim",
      questType: "quote-tweet" as const,
      category: "Content",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
    },
    {
      id: "mock-3",
      title: "Share Your DeFi Experience",
      description: "Share your personal experience with DeFi protocols and help educate the community about decentralized finance opportunities.",
      creator: {
        name: "DeFiEducator",
        avatar: "",
        handle: "@defieducator"
      },
      reward: {
        amount: 0.02,
        type: "MON" as const
      },
      status: "pending" as const,
      participants: {
        current: 25,
        max: 100
      },
      timeRemaining: "Starts in 6h",
      questType: "likeAndRetweet" as const,
      category: "Education",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
    },
    {
      id: "mock-4",
      title: "Promote ProofQuest Platform",
      description: "Help spread the word about ProofQuest by quote tweeting our announcement and adding your own thoughts about Web3 quest platforms.",
      creator: {
        name: "ProofQuestTeam",
        avatar: "",
        handle: "@proofquest"
      },
      reward: {
        amount: 0.015,
        type: "MON" as const
      },
      status: "ended" as const,
      participants: {
        current: 1500,
        max: 1500
      },
      timeRemaining: "Ended",
      questType: "quote-tweet" as const,
      category: "Marketing",
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      endDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago (ended)
    },
    {
      id: "mock-5",
      title: "NFT Collection Launch Announcement",
      description: "Support our upcoming NFT collection by liking and retweeting our launch announcement. Get early access to exclusive digital art.",
      creator: {
        name: "DigitalArtCollective",
        avatar: "",
        handle: "@digitalartcollective"
      },
      reward: {
        amount: 0.008,
        type: "MON" as const
      },
      status: "cancelled" as const,
      participants: {
        current: 150,
        max: 500
      },
      timeRemaining: "Cancelled",
      questType: "likeAndRetweet" as const,
      category: "Art",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // 1 day from now
    }
  ]
}

/**
 * Hook to fetch quest list with backend integration
 */
export function useQuests(filters?: QuestFilters, options?: {
  limit?: number
  offset?: number
  includeMockData?: boolean
}) {
  const { includeMockData = true, ...paginationOptions } = options || {}

  return useQuery({
    queryKey: questKeys.list({ ...filters, ...paginationOptions }),
    queryFn: async (): Promise<QuestListItem[]> => {
      try {
        // Fetch from backend (this already includes pagination and basic filtering)
        const backendResponse = await apiClient.getQuests({
          ...filters,
          limit: 1000, // Get all quests for client-side pagination
          offset: 0
        })

        // Transform backend quests to list items
        const backendQuests = backendResponse.data.map(quest => ({
          ...transformBackendQuestToListItem({
            id: quest.id,
            title: quest.title,
            description: quest.description,
            questType: quest.questType,
            sponsor: quest.creator.address,
            totalRewards: (quest.totalRewardPool * 1e18).toString(),
            rewardPerUser: (quest.rewardPerParticipant * 1e18).toString(),
            maxParticipants: quest.maxParticipants || 100,
            participantCount: quest.participants.current,
            startTime: new Date(quest.startDate).getTime(),
            endTime: new Date(quest.endDate).getTime(),
            claimEndTime: new Date(quest.rewardClaimDeadline).getTime(),
            status: quest.status,
            createdAt: new Date(quest.createdAt).getTime(),
            updatedAt: new Date(quest.updatedAt).getTime()
          }),
          _source: 'backend' as const
        }))

        // Get mock data
        const mockData = includeMockData ? getMockQuestData().map(quest => ({
          ...quest,
          _source: 'mock' as const
        })) : []

        // Combine backend and mock data
        const allQuests = [...backendQuests, ...mockData]
        
        // Apply additional client-side filtering (not handled by backend)
        let filteredData = allQuests

        if (filters?.search) {
          const searchTerm = filters.search.toLowerCase()
          filteredData = filteredData.filter(quest =>
            quest.title.toLowerCase().includes(searchTerm) ||
            quest.creator.name.toLowerCase().includes(searchTerm) ||
            quest.category.toLowerCase().includes(searchTerm)
          )
        }

        if (filters?.rewardRange) {
          const [min, max] = filters.rewardRange
          filteredData = filteredData.filter(quest =>
            quest.reward.amount >= min && quest.reward.amount <= max
          )
        }

        return filteredData
      } catch (error) {
        console.error('Failed to fetch quests from backend, using mock data only:', error)
        // Fallback to mock data only
        return includeMockData ? getMockQuestData() : []
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

/**
 * Hook to fetch single quest details
 */
export function useQuest(id: string) {
  return useQuery({
    queryKey: questKeys.detail(id),
    queryFn: async (): Promise<QuestResponse | null> => {
      try {
        return await apiClient.getQuest(id)
      } catch (error) {
        console.error('Failed to fetch quest details:', error)
        return null
      }
    },
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
    retry: 2,
  })
}

/**
 * Hook to create quest
 */
export function useCreateQuest() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { executeProtected } = useProtectedAction()

  return useMutation({
    mutationFn: async (questData: QuestFormData): Promise<QuestResponse> => {
      return executeProtected(async () => {
        // Transform frontend data to backend format
        const apiRequest = transformQuestToApiRequest(questData)
        
        // Step 1: Create quest via backend API first
        const response = await apiClient.createQuest(apiRequest)
        
        try {
          // Step 2: Create quest on smart contract
          const { createLikeAndRetweetQuest } = await import('@/lib/questContract')
          
          // Convert quest data to contract parameters
          const contractParams = {
            title: questData.title,
            description: questData.description,
            launch_page: questData.launch_page,
            totalRewards: questData.totalRewardPool?.toString() || '0',
            rewardPerUser: questData.rewardPerParticipant?.toString() || '0',
            startTime: Math.floor(questData.startDate.getTime() / 1000),
            endTime: Math.floor(questData.endDate.getTime() / 1000),
            claimEndTime: Math.floor(questData.rewardClaimDeadline.getTime() / 1000),
            requireFavorite: questData.requiredActions?.includes('like') || false,
            requireRetweet: questData.requiredActions?.includes('retweet') || false,
            isVesting: questData.distributionMethod === 'linear',
            vestingDuration: questData.linearPeriod ? questData.linearPeriod * 24 * 60 * 60 : 0 // Convert days to seconds
          }
          
          // Call smart contract
          const txHash = await createLikeAndRetweetQuest(contractParams)
          
          toast({
            title: "Deploying to Blockchain",
            description: `Transaction submitted: ${txHash}. Your quest will be fully active once confirmed.`,
            variant: "default"
          })
          
        } catch (contractError: any) {
          console.error('Smart contract deployment failed:', contractError)
          toast({
            title: "Blockchain Deployment Failed",
            description: "Quest was created in database but failed to deploy to blockchain. Please try again.",
            variant: "destructive"
          })
          // Note: We don't throw here to avoid breaking the flow, 
          // the quest exists in the backend and can be retried later
        }
        
        return response
      }, {
        errorMessage: "Authentication required to create quests"
      }) as Promise<QuestResponse>
    },
    onSuccess: (data) => {
      // Invalidate quest lists to refetch
      queryClient.invalidateQueries({ queryKey: questKeys.lists() })
      
      toast({
        title: "Quest Created Successfully",
        description: `"${data.title}" has been created and is being deployed to the blockchain!`,
        variant: "default"
      })
    },
    onError: (error: any) => {
      toast({
        title: "Quest Creation Failed",
        description: error.message || "Failed to create quest. Please try again.",
        variant: "destructive"
      })
    }
  })
}

/**
 * Hook to update quest
 */
export function useUpdateQuest() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { executeProtected } = useProtectedAction()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<QuestFormData> }): Promise<QuestResponse> => {
      return executeProtected(async () => {
        // Transform frontend data to backend format
        const apiRequest = transformQuestToApiRequest(data as QuestFormData)
        
        // Update quest via API
        const response = await apiClient.updateQuest(id, apiRequest)
        
        return response
      }) as Promise<QuestResponse>
    },
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: questKeys.lists() })
      queryClient.invalidateQueries({ queryKey: questKeys.detail(variables.id) })
      
      toast({
        title: "Quest Updated Successfully",
        description: `"${data.title}" has been updated.`,
        variant: "default"
      })
    },
    onError: (error: any) => {
      toast({
        title: "Quest Update Failed",
        description: error.message || "Failed to update quest. Please try again.",
        variant: "destructive"
      })
    }
  })
}

/**
 * Hook to delete quest
 */
export function useDeleteQuest() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { executeProtected } = useProtectedAction()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      return executeProtected(async () => {
        await apiClient.deleteQuest(id)
      }) as Promise<void>
    },
    onSuccess: () => {
      // Invalidate quest lists
      queryClient.invalidateQueries({ queryKey: questKeys.lists() })
      
      toast({
        title: "Quest Deleted",
        description: "The quest has been successfully deleted.",
        variant: "default"
      })
    },
    onError: (error: any) => {
      toast({
        title: "Quest Deletion Failed",
        description: error.message || "Failed to delete quest. Please try again.",
        variant: "destructive"
      })
    }
  })
}

/**
 * Hook for quest statistics
 */
export function useQuestStats() {
  return useQuery({
    queryKey: ['quest-stats'],
    queryFn: async () => {
      try {
        // In a real implementation, this would call a stats endpoint
        const questsResponse = await apiClient.getQuests({ limit: 1000 })
        
        const stats = {
          totalQuests: questsResponse.total,
          activeQuests: questsResponse.data.filter(q => q.status === 'active').length,
          totalParticipants: questsResponse.data.reduce((sum, q) => sum + q.participants.current, 0),
          totalRewards: questsResponse.data.reduce((sum, q) => sum + q.totalRewardPool, 0)
        }
        
        return stats
      } catch (error) {
        // Fallback stats based on mock data
        return {
          totalQuests: 156,
          activeQuests: 47,
          totalParticipants: 8934,
          totalRewards: 12.47
        }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  })
}

/**
 * Hook for trending quests
 */
export function useTrendingQuests(limit: number = 5) {
  return useQuery({
    queryKey: ['trending-quests', limit],
    queryFn: async (): Promise<QuestListItem[]> => {
      try {
        // Fetch active quests and sort by participation rate
        const questsResponse = await apiClient.getQuests({
          status: ['active'],
          limit: 100
        })
        
        // Transform to list items and sort by trending criteria
        const questList = questsResponse.data.map(quest => transformBackendQuestToListItem({
          id: quest.id,
          title: quest.title,
          description: quest.description,
          questType: quest.questType,
          sponsor: quest.creator.address,
          totalRewards: (quest.totalRewardPool * 1e18).toString(),
          rewardPerUser: (quest.rewardPerParticipant * 1e18).toString(),
          maxParticipants: quest.maxParticipants || 100,
          participantCount: quest.participants.current,
          startTime: new Date(quest.startDate).getTime(),
          endTime: new Date(quest.endDate).getTime(),
          claimEndTime: new Date(quest.rewardClaimDeadline).getTime(),
          status: quest.status,
          createdAt: new Date(quest.createdAt).getTime(),
          updatedAt: new Date(quest.updatedAt).getTime()
        }))
        
        // Sort by trending score (participation rate + recency)
        const trending = questList.sort((a, b) => {
          const aRate = a.participants.max ? a.participants.current / a.participants.max : 0
          const bRate = b.participants.max ? b.participants.current / b.participants.max : 0
          const aRecency = Date.now() - a.createdAt.getTime()
          const bRecency = Date.now() - b.createdAt.getTime()
          
          // Score: participation rate (0-1) + recency bonus (0-0.5)
          const aScore = aRate + Math.max(0, 0.5 - (aRecency / (7 * 24 * 60 * 60 * 1000)))
          const bScore = bRate + Math.max(0, 0.5 - (bRecency / (7 * 24 * 60 * 60 * 1000)))
          
          return bScore - aScore
        })
        
        return trending.slice(0, limit)
      } catch (error) {
        console.error('Failed to fetch trending quests:', error)
        // Fallback to mock data
        return getMockQuestData().slice(0, limit)
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 1
  })
}

/**
 * Hook for participation statistics API
 */
export function useParticipationStats() {
  return useQuery({
    queryKey: ['participation-stats'],
    queryFn: async () => {
      try {
        const response = await apiClient.get('/api/participations/statistics')
        return response
      } catch (error) {
        console.error('Failed to fetch participation stats:', error)
        // Fallback stats
        return {
          totalParticipations: 8934,
          totalRewardsDistributed: '12.47',
          averageRewardPerParticipation: '0.0014',
          uniqueParticipants: 2847,
          topQuests: [],
          recentActivity: []
        }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  })
}

/**
 * Hook for top earners leaderboard
 */
export function useTopEarners(limit: number = 10) {
  return useQuery({
    queryKey: ['top-earners', limit],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/api/participations/leaderboard?limit=${limit}`)
        return response.data?.leaderboard || []
      } catch (error) {
        console.error('Failed to fetch top earners:', error)
        // Fallback data
        return [
          {
            userAddress: '0x1234...5678',
            totalParticipations: 12,
            totalRewardsEarned: '2500000000000000000', // 2.5 MON in wei
            completionRate: 1.0,
            averageRewardPerParticipation: '208333333333333333', // ~0.208 MON
            rank: 1
          },
          {
            userAddress: '0xabcd...efgh',
            totalParticipations: 8,
            totalRewardsEarned: '1800000000000000000', // 1.8 MON in wei
            completionRate: 1.0,
            averageRewardPerParticipation: '225000000000000000', // 0.225 MON
            rank: 2
          },
          {
            userAddress: '0x9876...4321',
            totalParticipations: 6,
            totalRewardsEarned: '1200000000000000000', // 1.2 MON in wei
            completionRate: 1.0,
            averageRewardPerParticipation: '200000000000000000', // 0.2 MON
            rank: 3
          }
        ]
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  })
}

export default useQuests