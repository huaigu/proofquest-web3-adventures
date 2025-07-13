/**
 * Type Definitions Export
 * 
 * Central export for all type definitions
 */

// API Types
export * from './api'
export * from './auth'
export * from './quest'
export * from './user'

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

// Common Status Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface AsyncState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
  lastUpdated?: Date
}