import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Get environment variables - these should be embedded at build time by Next.js
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || ''

// Debug logging
if (typeof window !== 'undefined') {
  console.log('🔍 Supabase Environment Check (Client Side):')
  console.log('  URL:', SUPABASE_URL ? SUPABASE_URL.substring(0, 30) + '...' : 'MISSING')
  console.log('  URL length:', SUPABASE_URL.length)
  console.log('  Key:', SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.substring(0, 20) + '...' : 'MISSING')
  console.log('  Key length:', SUPABASE_ANON_KEY.length)
  console.log('  process.env keys:', Object.keys(process.env).filter(k => k.includes('SUPABASE')))
}

// Validate configuration
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  const errorMsg = `Missing Supabase config. URL: ${SUPABASE_URL ? 'SET' : 'MISSING'}, KEY: ${SUPABASE_ANON_KEY ? 'SET' : 'MISSING'}`
  console.error('❌', errorMsg)
  throw new Error(errorMsg)
}

if (SUPABASE_URL.length === 0 || SUPABASE_ANON_KEY.length === 0) {
  const errorMsg = `Empty Supabase config. URL length: ${SUPABASE_URL.length}, KEY length: ${SUPABASE_ANON_KEY.length}`
  console.error('❌', errorMsg)
  throw new Error(errorMsg)
}

if (!SUPABASE_ANON_KEY.startsWith('eyJ')) {
  console.error('❌ Invalid Supabase key format')
  throw new Error('Invalid Supabase anon key format')
}

// Create client - this will throw if config is invalid
console.log('✅ Creating Supabase client with validated config')
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
console.log('✅ Supabase client created')

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
