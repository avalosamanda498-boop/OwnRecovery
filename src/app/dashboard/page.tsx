'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

export default function DashboardIndexPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    async function resolveDestination() {
      const user = await getCurrentUser()

      if (!user) {
        router.replace('/auth/login')
        return
      }

      if (user.user_type === 'admin') {
        router.replace('/admin')
        return
      }

      if (!user.role) {
        router.replace('/auth/role-selection')
        return
      }

      const base = '/dashboard'
      switch (user.role) {
        case 'recovery':
          router.replace(`${base}/recovery`)
          break
        case 'still_using':
          router.replace(`${base}/still-using`)
          break
        case 'supporter':
          router.replace(`${base}/supporter`)
          break
        default:
          router.replace('/auth/role-selection')
          break
      }
    }

    resolveDestination().finally(() => setChecking(false))
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
        <p className="text-sm text-gray-600">Preparing your dashboard…</p>
      </div>
    </div>
  )
}

