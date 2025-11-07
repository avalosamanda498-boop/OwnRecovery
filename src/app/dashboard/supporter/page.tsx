'use client'

import Link from 'next/link'

export default function SupporterDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-support-gradient/10 to-primary-50 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="bg-white border border-success-100 rounded-2xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900">Thank you for showing up</h1>
          <p className="mt-2 text-gray-600">
            This dashboard will soon track everyone you’re supporting, share encouragement prompts, and surface resources just for loved ones and allies.
          </p>
        </header>

        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900">Who you’re supporting</h2>
          <p className="mt-2 text-sm text-gray-600">
            We’ll list the people connected to you here, with snapshots of how they’re doing (only what they choose to share), plus gentle reminders to check in.
          </p>
          <div className="mt-4 p-4 rounded-xl border border-dashed border-gray-300 text-sm text-gray-500">
            Connection list coming soon. Have a code? You’ll be able to enter it right here to connect instantly.
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Supporter tools on the way</h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-600 list-disc list-inside">
              <li>Encouragement prompts you can send with one tap.</li>
              <li>When to check in—gentle nudges and milestones.</li>
              <li>Shared resources (articles, groups, crisis lines).</li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Need help yourself?</h2>
            <p className="mt-2 text-sm text-gray-600">
              Caregivers need support too. We’ll surface ally groups, therapist directories, and quick tips for staying grounded while you show up for someone else.
            </p>
            <Link
              href="#"
              className="mt-4 inline-flex items-center justify-center px-5 py-2 rounded-xl bg-success-600 hover:bg-success-700 text-white text-sm font-semibold transition-colors"
            >
              Supporter resources (coming soon)
            </Link>
          </div>
        </section>

        <footer className="text-center text-sm text-gray-500">
          Placeholder dashboard &mdash; more features arriving in the next milestone.
        </footer>
      </div>
    </div>
  )
}

