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
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-950/85 via-[#06162f]/85 to-[#031324] opacity-95" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_25%_15%,rgba(118,75,255,0.22),transparent_55%)]" />
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_35px_90px_-45px_rgba(76,194,255,0.65)] backdrop-blur-2xl">
        <div className="text-center space-y-2">
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-50">
            Join Own Recovery
          </h2>
          <p className="text-sm text-slate-300/90">
            Start your journey to recovery and well-being
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
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                mode === 'phone'
                  ? 'border-neon-cyan/60 bg-neon-cyan/20 text-slate-50 shadow-[0_12px_30px_-20px_rgba(60,242,255,0.75)]'
                  : 'border-white/15 bg-white/5 text-slate-200 hover:border-neon-cyan/40 hover:text-white'
              }`}
            >
              Use phone
            </button>
          </div>
        )}

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-200">
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
                  <label htmlFor="email" className="block text-sm font-medium text-slate-200">
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
                  <label htmlFor="password" className="block text-sm font-medium text-slate-200">
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
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-200">
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
                    <label htmlFor="otp" className="block text-sm font-medium text-slate-200">
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

            <p className="text-xs text-slate-400/90">
              After you create your account, we’ll help you choose whether you’re in recovery, thinking about change, or supporting someone.
            </p>
          </div>

          {phoneAuthEnabled && mode === 'phone' && (
            <p className="text-center text-xs text-slate-400">
              Prefer email instead?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('email')
                  setOtpSent(false)
                  setOtpCode('')
                  setError('')
                }}
                className="text-neon-cyan underline"
              >
                Use email
              </button>
            </p>
          )}

          {error && (
            <div className="rounded-2xl border border-danger-500/40 bg-danger-500/10 px-4 py-3 text-sm text-danger-200">
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
            <p className="text-sm text-slate-300">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-neon-cyan hover:text-white">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
