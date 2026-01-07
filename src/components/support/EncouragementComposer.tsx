'use client'

import { useEffect, useState } from 'react'
import type { ConnectionSummary } from '@/lib/connections'
import { sendEncouragement } from '@/lib/supportMessages'

const PRESET_MESSAGES = [
  { id: 'proud', text: 'We are so proud of you. Keep breathing and taking it moment by moment.' },
  { id: 'checkin', text: 'Just checking in—remember you can lean on me any time today.' },
  { id: 'ground', text: 'Try a quick grounding exercise and a glass of water. You’ve got this.' },
  { id: 'celebrate', text: 'Celebrating your honesty today. Every check-in is a win.' },
]

const PRESET_EMOJIS = ['🙌', '❤️', '💪', '🌟', '🌱', '🤝'] as const

interface EncouragementComposerProps {
  connections: ConnectionSummary[]
  onSent?: () => void
}

export function EncouragementComposer({ connections, onSent }: EncouragementComposerProps) {
  const [selectedRecoveryUserId, setSelectedRecoveryUserId] = useState<string>(
    connections[0]?.recovery_user_id ?? ''
  )
  const [message, setMessage] = useState('')
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [emoji, setEmoji] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (selectedRecoveryUserId) {
      const stillExists = connections.some((connection) => connection.recovery_user_id === selectedRecoveryUserId)
      if (!stillExists) {
        setSelectedRecoveryUserId(connections[0]?.recovery_user_id ?? '')
      }
    } else if (connections[0]) {
      setSelectedRecoveryUserId(connections[0].recovery_user_id)
    }
  }, [connections, selectedRecoveryUserId])

  if (connections.length === 0) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Send encouragement</h2>
        <p className="mt-2 text-sm text-gray-600">
          You’ll be able to send quick encouragement once someone invites you into their support circle.
        </p>
      </section>
    )
  }

  const handleSelectConnection = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRecoveryUserId(event.target.value)
  }

  const handlePresetSelect = (presetId: string, text: string) => {
    setSelectedPreset(presetId)
    setMessage(text)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedRecoveryUserId) {
      setError('Please choose who you want to encourage.')
      return
    }

    setStatus('sending')
    setError(null)

    try {
      await sendEncouragement({
        recovery_user_id: selectedRecoveryUserId,
        message,
        emoji,
      })
      setStatus('success')
      setMessage('')
      setSelectedPreset(null)
      setEmoji(null)
      onSent?.()
      setTimeout(() => setStatus('idle'), 2500)
    } catch (err: any) {
      setError(err.message ?? 'We could not send that encouragement.')
      setStatus('error')
    }
  }

  return (
    <section className="rounded-2xl border border-success-100 bg-white p-6 shadow-sm">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Send encouragement</h2>
            {status === 'success' && <span className="text-sm font-medium text-success-600">Sent</span>}
          </div>
          <p className="text-sm text-gray-600">
            Encouragement stays gentle. Your friend sees this message and any emoji you include—nothing more.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Who should receive this?
            <select
              value={selectedRecoveryUserId}
              onChange={handleSelectConnection}
              className="input-field"
            >
              {connections.map((connection) => (
                <option key={connection.id} value={connection.recovery_user_id}>
                  {connection.partner.prefers_anonymous
                    ? 'Anonymous friend'
                    : connection.partner.display_name || 'Recovery partner'}
                </option>
              ))}
            </select>
          </label>

          <div className="text-sm text-gray-600">
            <p className="font-semibold text-gray-900">Add a supportive emoji</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRESET_EMOJIS.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${
                    emoji === item
                      ? 'border-success-500 bg-success-50 text-success-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-success-200'
                  }`}
                  onClick={() => setEmoji((prev) => (prev === item ? null : item))}
                >
                  <span className="text-xl">{item}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-900">Choose a preset or write your own</p>
          <div className="grid gap-2 md:grid-cols-2">
            {PRESET_MESSAGES.map((preset) => (
              <button
                key={preset.id}
                type="button"
                className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                  selectedPreset === preset.id
                    ? 'border-success-400 bg-success-50 text-success-800 shadow-sm'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-success-200'
                }`}
                onClick={() => handlePresetSelect(preset.id, preset.text)}
              >
                {preset.text}
              </button>
            ))}
          </div>
        </div>

        <label className="block text-sm text-gray-700">
          Or add/edit your own words (200 characters max)
          <textarea
            className="input-field mt-1"
            rows={3}
            value={message}
            maxLength={200}
            onChange={(event) => {
              setMessage(event.target.value)
              setSelectedPreset(null)
            }}
            placeholder="Write a short note of support..."
            required
          />
          <span className="mt-1 block text-xs text-gray-500">{message.length}/200 characters</span>
        </label>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        )}

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Messages stay in the app so nothing catches them off guard. We recommend following up with a personal check-in.
          </p>
          <button
            type="submit"
            disabled={status === 'sending'}
            className="inline-flex items-center gap-2 rounded-full bg-success-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-success-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === 'sending' ? 'Sending…' : 'Send encouragement'}
          </button>
        </div>
      </form>
    </section>
  )
}

