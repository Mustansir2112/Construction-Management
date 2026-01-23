import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
function isValidSupabaseConfig(url?: string, key?: string): boolean {
  return !!(
    url && 
    key && 
    url.startsWith('http') && 
    !url.includes('your_supabase_project_url_here') &&
    !key.includes('your_supabase_anon_key_here') &&
    key.length > 20
  );
}

// Create a function that returns a Supabase client for browser usage
export function createClient() {
  if (!isValidSupabaseConfig(supabaseUrl, supabaseAnonKey)) {
    console.warn('Supabase not configured properly. Some features may not work.');
    // Return a mock client that won't crash the app
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
        signInWithPassword: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured' } })
      },
      from: () => ({
        select: () => ({ data: [], error: null }),
        insert: () => ({ data: null, error: { message: 'Supabase not configured' } }),
        update: () => ({ data: null, error: { message: 'Supabase not configured' } }),
        delete: () => ({ data: null, error: { message: 'Supabase not configured' } })
      })
    } as any;
  }
  return createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!)
}

// Export a default client instance for backward compatibility (only if env vars are valid)
export const supabase = isValidSupabaseConfig(supabaseUrl, supabaseAnonKey)
  ? createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!)
  : null
