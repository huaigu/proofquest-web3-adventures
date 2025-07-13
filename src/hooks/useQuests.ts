/**
 * Quest Management Hooks
 * 
 * React Query hooks for quest CRUD operations with backend integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import apiClient from '@/lib/api'
import { transformers, mergeQuestData, transformQuestToApiRequest } from '@/lib/transformers'
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
      creator: {
        name: "AlphaSeekerDAO",
        avatar: "",
        handle: "@alphaseekerxyz"
      },
      reward: {
        amount: 0.005,
        type: "ETH" as const
      },
      status: "active" as const,
      participants: {
        current: 1247,
        max: 2000
      },
      timeRemaining: "2d 14h",
      questType: "twitter-interaction" as const,
      category: "Social",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
    },
    {
      id: "mock-2",
      title: "Quote Tweet Web3 Innovation Thread",
      creator: {
        name: "TechVanguard",
        avatar: "",
        handle: "@techvanguard"
      },
      reward: {
        amount: 0.01,
        type: "ETH" as const
      },
      status: "active" as const,
      participants: {
        current: 589,
        max: 1000
      },
      timeRemaining: "1d 8h",
      questType: "quote-tweet" as const,
      category: "Content",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
    },
    {
      id: "mock-3",
      title: "Share Your DeFi Experience",
      creator: {
        name: "DeFiEducator",
        avatar: "",
        handle: "@defieducator"
      },
      reward: {
        amount: 0.02,
        type: "ETH" as const
      },
      status: "claiming" as const,
      participants: {
        current: 2500,
        max: 2500
      },
      timeRemaining: "Ended",
      questType: "send-tweet" as const,
      category: "Education",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago (ended)
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
        // Fetch from backend
        const backendResponse = await apiClient.getQuests({
          ...filters,
          ...paginationOptions
        })

        // Get mock data
        const mockData = includeMockData ? getMockQuestData() : []

        // Merge backend and mock data
        const mergedData = mergeQuestData(backendResponse.data, mockData)
        
        // Apply client-side filtering if needed
        let filteredData = mergedData

        if (filters?.search) {
          const searchTerm = filters.search.toLowerCase()
          filteredData = filteredData.filter(quest =>
            quest.title.toLowerCase().includes(searchTerm) ||
            quest.creator.name.toLowerCase().includes(searchTerm) ||
            quest.category.toLowerCase().includes(searchTerm)
          )
        }

        if (filters?.status && filters.status.length > 0) {
          filteredData = filteredData.filter(quest =>
            filters.status!.includes(quest.status)
          )
        }

        if (filters?.questType && filters.questType.length > 0) {
          filteredData = filteredData.filter(quest =>
            filters.questType!.includes(quest.questType)
          )
        }

        if (filters?.rewardType && filters.rewardType.length > 0) {
          filteredData = filteredData.filter(quest =>
            filters.rewardType!.includes(quest.reward.type)
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
        
        // Create quest via API
        const response = await apiClient.createQuest(apiRequest)
        
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
        description: `"${data.title}" has been created and is now live!`,
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

export default useQuests