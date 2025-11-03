import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy initialization to ensure environment variables are fully loaded
let supabaseClient: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient
  }

  // Get environment variables fresh each time
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim()

  console.log('🔍 Creating Supabase client:')
  console.log('  URL exists:', !!url)
  console.log('  URL length:', url.length)
  console.log('  Key exists:', !!key)
  console.log('  Key length:', key.length)
  
  if (!url || !key || url.length === 0 || key.length === 0) {
    const error = `Supabase config missing: URL=${!!url}, KEY=${!!key}`
    console.error('❌', error)
    throw new Error(error)
  }

  console.log('  URL:', url.substring(0, 30) + '...')
  console.log('  Key starts with:', key.substring(0, 20))
  
  // Verify key format
  if (!key.startsWith('eyJ')) {
    console.error('❌ Invalid key format - should start with "eyJ"')
    throw new Error('Invalid Supabase anon key format')
  }

  console.log('✅ Creating client with valid config')
  supabaseClient = createClient(url, key)
  console.log('✅ Supabase client created successfully')
  
  return supabaseClient
}

// Export a getter that creates client lazily
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient()
    const value = (client as any)[prop]
    if (typeof value === 'function') {
      return value.bind(client)
    }
    return value
  },
})

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
