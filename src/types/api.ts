/**
 * API Request/Response Types
 * 
 * Shared types for frontend-backend communication
 */

// Base API Response
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  statusCode?: number
  details?: any
}

// Error Response
export interface ApiError {
  error: string
  message: string
  statusCode: number
  details?: any
}

// Pagination
export interface PaginationParams {
  limit?: number
  offset?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

// API Configuration
export interface ApiConfig {
  baseUrl: string
  timeout?: number
  retries?: number
}

// Request Options
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  signal?: AbortSignal
}