'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { updateUserProfile } from '@/lib/auth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function SupporterOnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [relationship, setRelationship] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [notifyDaily, setNotifyDaily] = useState(true)
  const [notifyMilestones, setNotifyMilestones] = useState(true)
  const [notifySupporterMessages, setNotifySupporterMessages] = useState(true)
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
        support_relationship: relationship,
        onboarding_completed: true,
        pending_support_invite_code: inviteCode.trim() ? inviteCode.trim() : null,
        notification_preferences: {
          daily_reminders: notifyDaily,
          milestone_celebrations: notifyMilestones,
          supporter_messages: notifySupporterMessages,
        },
      })

      setSuccess('Great! We’ll keep you in the loop.')
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thanks for supporting someone you care about</h1>
          <p className="text-gray-600">
            Tell us a bit about your role so we can send thoughtful nudges and resources.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              What’s your relationship to the person you’re supporting?
            </label>
            <Input
              placeholder="e.g. Partner, Parent, Friend, Sponsor"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Invite code (optional)
            </label>
            <Input
              placeholder="Enter the code they shared with you"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              maxLength={10}
            />
            <p className="text-sm text-gray-500">
              We’ll notify them you’d like to connect. They can approve from their dashboard.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">How should we keep you updated?</p>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={notifyDaily}
                onChange={(e) => setNotifyDaily(e.target.checked)}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Daily reminders to check in with them</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={notifyMilestones}
                onChange={(e) => setNotifyMilestones(e.target.checked)}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Milestone celebrations (we’ll cheer together!)</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={notifySupporterMessages}
                onChange={(e) => setNotifySupporterMessages(e.target.checked)}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Alerts when they request encouragement</span>
            </label>
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
              You can change these settings later.
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

