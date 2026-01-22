import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a function that returns a Supabase client for browser usage
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Export a default client instance for backward compatibility
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
