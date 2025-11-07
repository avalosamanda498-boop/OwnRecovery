'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { updateUserProfile } from '@/lib/auth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const stageOptions = [
  "Just exploring",
  "Planning to quit soon",
  "I want to quit but I don't know where to start",
  "I can't stop the cravings",
]

export default function StillUsingOnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [stageOfChange, setStageOfChange] = useState(stageOptions[0])
  const [primarySubstance, setPrimarySubstance] = useState('')
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
        stage_of_change: stageOfChange,
        primary_substance: primarySubstance,
        biggest_challenge: biggestChallenge,
        check_in_time: checkInTime,
        onboarding_completed: true,
      })

      setSuccess('Thanks! Your preferences are saved.')
      router.push('/dashboard')
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">We’re glad you’re here</h1>
          <p className="text-gray-600">
            No judgment—tell us where you are today so we can suggest the most helpful support.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              How would you describe where you are right now?
            </label>
            <div className="grid md:grid-cols-2 gap-3">
              {stageOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStageOfChange(option)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors duration-200 ${
                    stageOfChange === option
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <span className="block text-sm font-semibold text-gray-900">{option}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              What substance are you using most often right now?
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
              What feels hardest for you these days?
            </label>
            <textarea
              className="input-field h-28"
              placeholder="Cravings, stress, sleep, pressure—share anything that feels helpful."
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
              We’ll send gentle encouragement and coping ideas around this time.
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
              You can adjust these anytime in settings.
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

