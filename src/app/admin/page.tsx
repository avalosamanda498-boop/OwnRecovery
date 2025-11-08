'use client'

import Link from 'next/link'

export default function AdminHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 py-16 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Portal (early access)</h1>
          <p className="mt-2 text-gray-600">
            This workspace will soon include community moderation tools, user management, and engagement
            analytics. For now it serves as a secure landing zone for admin accounts created through the
            temporary registration form.
          </p>
        </header>

        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Coming soon</h2>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
            <li>Approve supporter connection requests and moderate community stories.</li>
            <li>Review crisis flags, escalation history, and helpline usage.</li>
            <li>Track engagement analytics (logins, mood logs, streak progress).</li>
            <li>Manage content libraries (stories, tools, coping resources).</li>
          </ul>
        </section>

        <footer className="text-sm text-gray-500 text-center">
          Need to get back to the app?{' '}
          <Link href="/dashboard" className="text-primary-600 hover:text-primary-500">
            Open user dashboards
          </Link>
        </footer>
      </div>
    </div>
  )
}

