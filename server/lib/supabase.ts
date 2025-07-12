import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.js'

// Get environment variables
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_ANON_KEY')
}

// Create Supabase client with type safety
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false // Server-side, we don't need to persist sessions
  }
})

// Export types for convenience
export type { Database } from '../types/database.js'