'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUpWithEmail, signUpWithPhone, verifyPhoneOtp, syncProfileFromSession } from '@/lib/auth'

export default function SignUpPage() {
  const phoneAuthEnabled = useMemo(() => process.env.NEXT_PUBLIC_ENABLE_PHONE_AUTH === 'true', [])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'email' | 'phone'>(phoneAuthEnabled ? 'email' : 'email')
  const [phone, setPhone] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [normalizedPhone, setNormalizedPhone] = useState<string | null>(null)
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'email' || !phoneAuthEnabled) {
        const { user } = await signUpWithEmail(email, password, fullName)

        if (!user) {
          setError('Check your email to complete sign up.')
          return
        }

        await syncProfileFromSession()
        router.replace('/auth/role-selection?welcome=1')
        return
      }

      if (!phoneAuthEnabled) {
        setError('Phone sign up is not available right now.')
        return
      }

      if (!otpSent) {
        const { phone: normalized } = await signUpWithPhone(phone, fullName)
        setNormalizedPhone(normalized)
        setOtpSent(true)
        setLoading(false)
        return
      }

      if (!normalizedPhone) {
        setError('Phone verification session expired. Please request a new code.')
        setOtpSent(false)
        return
      }

      await verifyPhoneOtp(normalizedPhone, otpCode.trim())
      await syncProfileFromSession()
      router.replace('/auth/role-selection?welcome=1')
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Join Own Recovery
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Start your journey to recovery and well-being
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setMode('email')
              setOtpSent(false)
              setError('')
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              mode === 'email'
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white text-primary-600 border border-primary-200'
            }`}
          >
            Use email
          </button>
          {phoneAuthEnabled && (
            <button
              type="button"
              onClick={() => {
                setMode('phone')
                setError('')
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                mode === 'phone'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-primary-600 border border-primary-200'
              }`}
            >
              Use phone
            </button>
          )}
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field mt-1"
                placeholder="Enter your full name"
              />
            </div>

            {mode === 'email' || !phoneAuthEnabled ? (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field mt-1"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field mt-1"
                    placeholder="Create a password"
                    minLength={6}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field mt-1"
                    placeholder="Enter your phone number"
                  />
                </div>
                {otpSent && (
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                      Verification code
                    </label>
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="input-field mt-1"
                      placeholder="Enter the code sent to your phone"
                      required
                    />
                  </div>
                )}
              </>
            )}

            <p className="text-xs text-gray-500">
              After you create your account, we’ll help you choose whether you’re in recovery, thinking about change, or supporting someone.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {mode === 'email'
                ? loading
                  ? 'Creating Account...'
                  : 'Create Account'
                : otpSent
                ? loading
                  ? 'Verifying...'
                  : 'Verify code'
                : loading
                ? 'Sending code...'
                : 'Send code'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary-600 hover:text-primary-500">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
