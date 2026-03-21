import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!')
  console.error('Please create a .env.local file with:')
  console.error('VITE_SUPABASE_URL=your-project-url')
  console.error('VITE_SUPABASE_ANON_KEY=your-anon-key')
  
  // In development, provide helpful error
  if (import.meta.env.DEV) {
    throw new Error(
      'Missing Supabase configuration. Please check .env.local file. ' +
      'Copy .env.example to .env.local and fill in your Supabase credentials.'
    )
  }
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'bt_supabase_auth',
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'neurolojik',
    },
  },
})

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Export for testing
export const config = {
  url: supabaseUrl,
  hasConfig: isSupabaseConfigured(),
}

