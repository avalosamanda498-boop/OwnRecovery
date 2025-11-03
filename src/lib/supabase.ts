import { createClient } from '@supabase/supabase-js'

// Next.js environment variables prefixed with NEXT_PUBLIC_ are embedded at build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

// Debug: Check if variables are available
console.log('🔍 Supabase Config Check:')
console.log('URL exists:', !!supabaseUrl)
console.log('URL length:', supabaseUrl?.length || 0)
console.log('Key exists:', !!supabaseAnonKey)
console.log('Key length:', supabaseAnonKey?.length || 0)
console.log('URL value:', supabaseUrl?.substring(0, 30) + '...')

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.length === 0 || supabaseAnonKey.length === 0) {
  console.error('❌ Missing or empty Supabase environment variables!')
  console.error('URL:', supabaseUrl || 'UNDEFINED')
  console.error('Key length:', supabaseAnonKey?.length || 0)
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in Vercel.')
}

// Only create client if we have valid values
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.length === 0 || supabaseAnonKey.length === 0) {
  throw new Error('Supabase configuration is missing. Please check environment variables in Vercel.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For server-side operations
export const supabaseAdmin = createClient(
  supabaseUrl!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
