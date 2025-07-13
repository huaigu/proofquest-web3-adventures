/**
 * API Client
 * 
 * HTTP client with authentication and error handling
 */

import type {
  ApiResponse,
  ApiError,
  ApiConfig,
  RequestOptions,
  PaginatedResponse,
  NonceRequest,
  NonceResponse,
  SignInRequest,
  AuthResponse,
  QuestCreateRequest,
  QuestResponse,
  QuestFilters,
  User,
  UserUpdateRequest,
  QuestParticipation
} from '@/types'

class ApiClient {
  private baseUrl: string
  private timeout: number
  private retries: number
  private token: string | null = null

  constructor(config: ApiConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '') // Remove trailing slash
    this.timeout = config.timeout || 10000
    this.retries = config.retries || 3
    
    // Load token from localStorage on initialization
    this.loadToken()
  }

  // Token Management
  setToken(token: string | null) {
    this.token = token
    if (token) {
      localStorage.setItem('auth_token', token)
    } else {
      localStorage.removeItem('auth_token')
    }
  }

  getToken(): string | null {
    return this.token
  }

  private loadToken() {
    this.token = localStorage.getItem('auth_token')
  }

  // Base Request Method
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const controller = new AbortController()
    
    // Set timeout
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)
    
    const config: RequestInit = {
      method: options.method || 'GET',
      headers: {
        ...options.headers,
      },
      signal: options.signal || controller.signal,
    }

    // Add authentication header
    if (this.token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${this.token}`
      }
    }

    // Add body and content-type for non-GET requests with body
    if (options.body && config.method !== 'GET') {
      config.headers = {
        ...config.headers,
        'Content-Type': 'application/json'
      }
      config.body = typeof options.body === 'string' 
        ? options.body 
        : JSON.stringify(options.body)
    }

    let lastError: Error
    
    // Retry logic
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const response = await fetch(url, config)
        clearTimeout(timeoutId)
        
        // Handle HTTP errors
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const apiError: ApiError = {
            error: errorData.error || 'HTTP Error',
            message: errorData.message || `HTTP ${response.status}`,
            statusCode: response.status,
            details: errorData.details
          }
          
          // Handle authentication errors
          if (response.status === 401) {
            this.setToken(null)
            throw new Error('Authentication required')
          }
          
          throw new Error(apiError.message)
        }

        // Parse JSON response
        const data = await response.json()
        return data as T
        
      } catch (error: any) {
        lastError = error
        
        // Don't retry on authentication errors or user cancellation
        if (error.name === 'AbortError' || error.message === 'Authentication required') {
          throw error
        }
        
        // Don't retry on last attempt
        if (attempt === this.retries) {
          break
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }
    
    clearTimeout(timeoutId)
    throw lastError!
  }

  // GET request
  async get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  // POST request
  async post<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body })
  }

  // PUT request
  async put<T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body })
  }

  // DELETE request
  async delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }

  // Authentication API
  async requestNonce(data: NonceRequest): Promise<NonceResponse> {
    return this.post<NonceResponse>('/api/auth/nonce', data)
  }

  async signIn(data: SignInRequest): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/api/auth/signin', data)
    if (response.success && response.token) {
      this.setToken(response.token)
    }
    return response
  }

  async verifyToken(): Promise<AuthResponse> {
    return this.get<AuthResponse>('/api/auth/verify')
  }

  async refreshToken(): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/api/auth/refresh', {})
    if (response.success && response.token) {
      this.setToken(response.token)
    }
    return response
  }

  async signOut(): Promise<void> {
    try {
      await this.post('/api/auth/signout', {})
    } finally {
      this.setToken(null)
    }
  }

  // Quest API
  async createQuest(data: QuestCreateRequest): Promise<QuestResponse> {
    return this.post<QuestResponse>('/api/quests', data)
  }

  async getQuests(filters?: QuestFilters & { limit?: number; offset?: number }): Promise<PaginatedResponse<QuestResponse>> {
    const searchParams = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v.toString()))
          } else {
            searchParams.append(key, value.toString())
          }
        }
      })
    }
    
    const query = searchParams.toString()
    const endpoint = query ? `/api/quests?${query}` : '/api/quests'
    
    return this.get<PaginatedResponse<QuestResponse>>(endpoint)
  }

  async getQuest(id: string): Promise<QuestResponse> {
    return this.get<QuestResponse>(`/api/quests/${id}`)
  }

  async updateQuest(id: string, data: Partial<QuestCreateRequest>): Promise<QuestResponse> {
    return this.put<QuestResponse>(`/api/quests/${id}`, data)
  }

  async deleteQuest(id: string): Promise<void> {
    return this.delete(`/api/quests/${id}`)
  }

  // Quest Participation API
  async participateInQuest(questId: string): Promise<QuestParticipation> {
    return this.post<QuestParticipation>('/api/participations', { questId })
  }

  async getMyParticipations(): Promise<QuestParticipation[]> {
    return this.get<QuestParticipation[]>('/api/participations/me')
  }

  async getQuestParticipations(questId: string): Promise<QuestParticipation[]> {
    return this.get<QuestParticipation[]>(`/api/participations/quest/${questId}`)
  }

  async submitQuestProof(participationId: string, proofData: any): Promise<QuestParticipation> {
    return this.put<QuestParticipation>(`/api/participations/${participationId}`, {
      submissionData: proofData,
      status: 'completed'
    })
  }

  // User API
  async getUser(address: string): Promise<User> {
    return this.get<User>(`/api/users/${address}`)
  }

  async updateUser(address: string, data: UserUpdateRequest): Promise<User> {
    return this.put<User>(`/api/users/${address}`, data)
  }

  async deleteUser(address: string): Promise<void> {
    return this.delete(`/api/users/${address}`)
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.get('/health')
  }
}

// Create default API client instance
const apiClient = new ApiClient({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 10000,
  retries: 3
})

export default apiClient
export { ApiClient }