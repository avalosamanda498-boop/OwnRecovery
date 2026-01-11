'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Heart, Brain, Users } from 'lucide-react'
import { getCurrentUser, updateUserRole } from '@/lib/auth'
import { UserRole } from '@/types/database'

export default function RoleSelectionPage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const showWelcome = searchParams?.get('welcome') === '1'

  useEffect(() => {
    // Get current user to check if they already have a role
    getCurrentUser().then((userData) => {
      if (userData?.role) {
        // User already has a role, redirect to dashboard
        router.push('/dashboard')
      } else {
        setUser(userData)
      }
    })
  }, [router])

  const routeMap: Record<UserRole, string> = {
    recovery: 'recovery',
    still_using: 'still-using',
    supporter: 'supporter',
  }

  const handleRoleSelection = async (role: UserRole) => {
    setSelectedRole(role)
    setLoading(true)
    setError('')

    try {
      await updateUserRole(user!.id, role)
      
      // Redirect to appropriate onboarding flow
      router.push(`/onboarding/${routeMap[role]}`)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  const roles = [
    {
      id: 'recovery' as UserRole,
      title: 'In Recovery',
      description: 'I am actively working on my recovery journey and want to track my progress.',
      icon: Heart,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
      borderColor: 'border-primary-200',
      hoverColor: 'hover:border-primary-400',
    },
    {
      id: 'still_using' as UserRole,
      title: 'Thinking About Change',
      description: 'I am still using but curious about recovery and want to explore my options.',
      icon: Brain,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-50',
      borderColor: 'border-secondary-200',
      hoverColor: 'hover:border-secondary-400',
    },
    {
      id: 'supporter' as UserRole,
      title: 'Family & Supporter',
      description: 'I want to support someone in their recovery journey.',
      icon: Users,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
      borderColor: 'border-success-200',
      hoverColor: 'hover:border-success-400',
    },
  ]

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {showWelcome && (
          <div className="mb-6 rounded-2xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-800 shadow-sm">
            <p className="font-semibold text-primary-900">Account ready!</p>
            <p className="mt-1">
              Next, choose the experience that fits you best so we can tailor every check-in.
            </p>
          </div>
        )}

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome, {user.full_name || 'Friend'}!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            To provide you with the most relevant support, please tell us which best describes your situation:
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {roles.map((role) => {
            const Icon = role.icon
            return (
              <div
                key={role.id}
                className={`card cursor-pointer transition-all duration-200 ${role.borderColor} ${role.hoverColor} ${
                  selectedRole === role.id ? 'ring-2 ring-primary-500' : ''
                }`}
                onClick={() => handleRoleSelection(role.id)}
              >
                <div className={`${role.bgColor} rounded-lg p-4 mb-4`}>
                  <Icon className={`w-12 h-12 ${role.color} mx-auto`} />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {role.title}
                </h3>
                
                <p className="text-gray-600 mb-6">
                  {role.description}
                </p>

                {loading && selectedRole === role.id && (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {error && (
          <div className="mt-8 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-center">
            {error}
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Your choice helps us personalize your experience. You can always update this later in your settings.
          </p>
        </div>
      </div>
    </div>
  )
}
