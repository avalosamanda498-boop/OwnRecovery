import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Get environment variables - Next.js embeds NEXT_PUBLIC_ vars at build time
const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
const SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()

// Validate before creating client
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(`Missing Supabase config. URL: ${!!SUPABASE_URL}, KEY: ${!!SUPABASE_ANON_KEY}`)
}

if (SUPABASE_URL.length === 0 || SUPABASE_ANON_KEY.length === 0) {
  throw new Error(`Empty Supabase config. URL length: ${SUPABASE_URL.length}, KEY length: ${SUPABASE_ANON_KEY.length}`)
}

if (!SUPABASE_ANON_KEY.startsWith('eyJ')) {
  throw new Error('Invalid Supabase anon key format - must start with eyJ')
}

// Debug logging (only on client side)
if (typeof window !== 'undefined') {
  console.log('✅ Supabase config validated:')
  console.log('  URL:', SUPABASE_URL.substring(0, 30) + '...')
  console.log('  Key length:', SUPABASE_ANON_KEY.length)
}

// Create client with explicit type assertions
export const supabase: SupabaseClient = createClient(
  SUPABASE_URL as string,
  SUPABASE_ANON_KEY as string,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
)

// For server-side operations (only used on server side)
export const supabaseAdmin = (() => {
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
})()
