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
      iconGlow: 'from-primary-400/60 via-electric-violet/50 to-secondary-400/60',
      ringColor: 'ring-primary-400/60',
    },
    {
      id: 'still_using' as UserRole,
      title: 'Thinking About Change',
      description: 'I am still using but curious about recovery and want to explore my options.',
      icon: Brain,
      iconGlow: 'from-secondary-400/60 via-neon-cyan/50 to-primary-400/60',
      ringColor: 'ring-secondary-400/60',
    },
    {
      id: 'supporter' as UserRole,
      title: 'Family & Supporter',
      description: 'I want to support someone in their recovery journey.',
      icon: Users,
      iconGlow: 'from-success-400/60 via-neon-cyan/50 to-secondary-400/60',
      ringColor: 'ring-success-400/60',
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
    <div className="relative min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-950/85 via-[#06162f]/85 to-[#041029] opacity-95" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(108,62,248,0.22),transparent_55%)]" />
      <div className="mx-auto max-w-4xl space-y-10">
        {showWelcome && (
          <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-slate-200 shadow-[0_35px_90px_-45px_rgba(79,172,254,0.55)] backdrop-blur-2xl">
            <p className="font-semibold text-slate-50">Account ready!</p>
            <p className="mt-1 text-slate-300/90">
              Next, choose the experience that fits you best so we can tailor every check-in.
            </p>
          </div>
        )}

        <div className="mb-12 text-center space-y-3">
          <h1 className="text-4xl font-semibold text-slate-50">
            Welcome, {user.full_name || 'Friend'}!
          </h1>
          <p className="mx-auto max-w-2xl text-base text-slate-300/90">
            To provide you with the most relevant support, please tell us which best describes your situation:
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {roles.map((role) => {
            const Icon = role.icon
            return (
              <div
                key={role.id}
                className={`relative cursor-pointer overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_-50px_rgba(76,194,255,0.8)] transition-all duration-300 backdrop-blur-2xl hover:-translate-y-1 hover:border-neon-cyan/40 ${
                  selectedRole === role.id ? `${role.ringColor} ring-2` : ''
                }`}
                onClick={() => handleRoleSelection(role.id)}
              >
                <div className={`mb-4 rounded-2xl bg-gradient-to-br ${role.iconGlow} px-4 py-5 shadow-[0_25px_50px_-30px_rgba(76,194,255,0.8)]`}>
                  <Icon className="mx-auto h-12 w-12 text-white drop-shadow-[0_10px_25px_rgba(255,255,255,0.35)]" />
                </div>
                
                <h3 className="mb-3 text-xl font-semibold text-slate-50">
                  {role.title}
                </h3>
                
                <p className="mb-6 text-sm text-slate-300/90">
                  {role.description}
                </p>

                {loading && selectedRole === role.id && (
                  <div className="flex items-center justify-center text-neon-cyan">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-current"></div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {error && (
          <div className="mt-8 rounded-2xl border border-danger-500/40 bg-danger-500/10 px-4 py-3 text-center text-sm text-danger-200">
            {error}
          </div>
        )}

        <div className="mt-12 text-center">
          <p className="text-sm text-slate-400/90">
            Your choice helps us personalize your experience. You can always update this later in your settings.
          </p>
        </div>
      </div>
    </div>
  )
}
