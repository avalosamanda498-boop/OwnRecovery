import { createClient } from '@supabase/supabase-js'

// Next.js environment variables prefixed with NEXT_PUBLIC_ are embedded at build time
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Trim whitespace if values exist
if (supabaseUrl) supabaseUrl = supabaseUrl.trim()
if (supabaseAnonKey) supabaseAnonKey = supabaseAnonKey.trim()

// Debug: Check if variables are available
console.log('🔍 Supabase Config Check:')
console.log('URL exists:', !!supabaseUrl)
console.log('URL length:', supabaseUrl?.length || 0)
console.log('Key exists:', !!supabaseAnonKey)
console.log('Key length:', supabaseAnonKey?.length || 0)
console.log('URL value:', supabaseUrl?.substring(0, 30) + '...')

// Validate values before creating client
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('URL:', supabaseUrl || 'UNDEFINED')
  console.error('Key:', supabaseAnonKey ? 'DEFINED' : 'UNDEFINED')
  throw new Error('Supabase configuration is missing. Please check environment variables in Vercel.')
}

if (supabaseUrl.length === 0 || supabaseAnonKey.length === 0) {
  console.error('❌ Empty Supabase environment variables!')
  console.error('URL length:', supabaseUrl.length)
  console.error('Key length:', supabaseAnonKey.length)
  throw new Error('Supabase configuration is empty. Please check environment variables in Vercel.')
}

// Create client with explicit validation
console.log('✅ Creating Supabase client with valid configuration')
export const supabase = createClient(
  supabaseUrl as string,
  supabaseAnonKey as string
)

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
