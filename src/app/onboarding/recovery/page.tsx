'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { updateUserProfile } from '@/lib/auth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function RecoveryOnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [primarySubstance, setPrimarySubstance] = useState('')
  const [sobrietyStartDate, setSobrietyStartDate] = useState('')
  const [biggestChallenge, setBiggestChallenge] = useState('')
  const [checkInTime, setCheckInTime] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        router.push('/auth/login')
        return
      }

      setUserId(user.id)
      setLoading(false)
    }

    loadUser()
  }, [router])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!userId) return
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await updateUserProfile(userId, {
        role: 'recovery',
        primary_substance: primarySubstance,
        sobriety_start_date: sobrietyStartDate || undefined,
        biggest_challenge: biggestChallenge,
        check_in_time: checkInTime,
        onboarding_completed: true,
      })

      setSuccess('Thanks! Your preferences are saved.')
      router.replace('/dashboard/recovery')
    } catch (err: any) {
      setError(err.message || 'Something went wrong while saving your information.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Let’s personalize your support</h1>
          <p className="text-gray-600">
            Answer a few quick questions so we can tailor encouragement, tools, and reminders to your journey.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              What substance are you recovering from?
            </label>
            <Input
              placeholder="e.g. Alcohol, Opioids, Stimulants"
              value={primarySubstance}
              onChange={(e) => setPrimarySubstance(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              When did your current sobriety streak begin? (optional)
            </label>
            <Input
              type="date"
              value={sobrietyStartDate}
              onChange={(e) => setSobrietyStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              What’s the biggest challenge you’re working through right now?
            </label>
            <textarea
              className="input-field h-28"
              placeholder="Triggers, emotions, situations—share as much as you’d like."
              value={biggestChallenge}
              onChange={(e) => setBiggestChallenge(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              When should we check in with you each day?
            </label>
            <Input
              type="time"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
              required
            />
            <p className="text-sm text-gray-500">
              You’ll get gentle reminders and encouragement around this time.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              You’ll be able to update these any time in settings.
            </p>
            <Button type="submit" loading={submitting}>
              Save and Continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

