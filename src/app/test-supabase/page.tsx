'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestSupabasePage() {
  const [status, setStatus] = useState('Loading...')
  const [error, setError] = useState('')

  useEffect(() => {
    async function testConnection() {
      try {
        // Try to get the current session
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          setError(`Error: ${error.message}`)
          setStatus('Connection Failed')
        } else {
          setStatus('Connection Successful!')
        }
      } catch (err: any) {
        setError(`Exception: ${err.message}`)
        setStatus('Connection Failed')
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      <div className="space-y-4">
        <div>
          <strong>Status:</strong> {status}
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

