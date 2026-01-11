'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  signInWithEmail,
  sendPhoneOtp,
  verifyPhoneOtp,
  syncProfileFromSession,
  getCurrentUser,
} from '@/lib/auth'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const phoneAuthEnabled = useMemo(() => process.env.NEXT_PUBLIC_ENABLE_PHONE_AUTH === 'true', [])
  const [mode, setMode] = useState<'email' | 'phone'>(phoneAuthEnabled ? 'email' : 'email')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [phone, setPhone] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [normalizedPhone, setNormalizedPhone] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'email' || !phoneAuthEnabled) {
        const { user } = await signInWithEmail(email, password)

        if (user) {
          await syncProfileFromSession()
          const userProfile = await getCurrentUser()

          if (userProfile?.user_type === 'admin') {
            router.push('/admin')
          } else if (userProfile?.role) {
            router.push('/dashboard')
          } else {
            router.push('/auth/role-selection')
          }
        }
        return
      }

      if (!phoneAuthEnabled) {
        setError('Phone login is not available right now.')
        return
      }

      if (!otpSent) {
        const { phone: normalized } = await sendPhoneOtp(phone)
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
      const userProfile = await getCurrentUser()

      if (userProfile?.user_type === 'admin') {
        router.push('/admin')
      } else if (userProfile?.role) {
        router.push('/dashboard')
      } else {
        router.push('/auth/role-selection')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to continue your recovery journey
          </p>
        </div>

        {phoneAuthEnabled && (
          <div className="flex items-center justify-center">
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
          </div>
        )}

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {mode === 'email' || !phoneAuthEnabled ? (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
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
                  <div className="relative mt-1">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pr-12"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
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
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="input-field mt-1"
                      placeholder="Enter the code sent to your phone"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {phoneAuthEnabled && mode === 'phone' && (
            <p className="text-center text-xs text-gray-500">
              Prefer email instead?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('email')
                  setOtpSent(false)
                  setOtpCode('')
                  setError('')
                }}
                className="text-primary-600 underline"
              >
                Use email
              </button>
            </p>
          )}

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
                  ? 'Signing In...'
                  : 'Sign In'
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
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-primary-600 hover:text-primary-500">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
