'use client'

export default function TestEnvPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
      <div className="space-y-4">
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>
          <p className="bg-gray-100 p-2 rounded">
            {supabaseUrl || 'NOT SET'}
          </p>
        </div>
        <div>
          <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>
          <p className="bg-gray-100 p-2 rounded break-all">
            {supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT SET'}
          </p>
        </div>
        <div>
          <strong>URL exists:</strong> {supabaseUrl ? 'YES' : 'NO'}
        </div>
        <div>
          <strong>Key exists:</strong> {supabaseKey ? 'YES' : 'NO'}
        </div>
      </div>
    </div>
  )
}
