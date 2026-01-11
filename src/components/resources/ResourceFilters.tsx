'use client'

import { useMemo } from 'react'
import { RESOURCE_KINDS, type ResourceAudience, type ResourceKind, type ResourceItem } from '@/data/resources'

interface ResourceFiltersProps {
  availableResources: ResourceItem[]
  selectedKind: ResourceKind | 'all'
  onKindChange: (kind: ResourceKind | 'all') => void
  selectedAudienceMode: 'personalized' | 'all'
  onAudienceModeChange: (mode: 'personalized' | 'all') => void
  searchTerm: string
  onSearchTermChange: (value: string) => void
  selectedTag: string | null
  onTagChange: (tag: string | null) => void
  activeRole: ResourceAudience | null
}

export function ResourceFilters({
  availableResources,
  selectedKind,
  onKindChange,
  selectedAudienceMode,
  onAudienceModeChange,
  searchTerm,
  onSearchTermChange,
  selectedTag,
  onTagChange,
  activeRole,
}: ResourceFiltersProps) {
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>()
    availableResources.forEach((resource) => {
      resource.tags.forEach((tag) => tagSet.add(tag))
    })
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b))
  }, [availableResources])

  return (
    <section className="rounded-3xl border border-primary-100 bg-white/95 p-6 shadow-sm space-y-6">
      <header className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-900">Filter the library</h2>
        <p className="text-sm text-gray-600">
          Use search, tags, and formats to find the right support. We highlight resources based on your current role, and
          you can always browse everything.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onKindChange('all')}
          className={`rounded-full border px-3 py-1.5 text-sm transition ${
            selectedKind === 'all'
              ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-sm'
              : 'border-gray-300 text-gray-600 hover:border-primary-300'
          }`}
        >
          All formats
        </button>
        {RESOURCE_KINDS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => onKindChange(entry.id)}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              selectedKind === entry.id
                ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-sm'
                : 'border-gray-300 text-gray-600 hover:border-primary-300'
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
        <label className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700 focus-within:border-primary-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-200">
          <span className="text-gray-500">Search</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            className="flex-1 bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none"
            placeholder="Try “breathing”, “supporter”, or “sleep”…"
          />
        </label>

        <div className="flex items-center justify-end gap-3 text-sm text-gray-600">
          <span className="font-medium text-gray-700">Audience</span>
          <button
            type="button"
            onClick={() => onAudienceModeChange('personalized')}
            className={`rounded-full border px-3 py-1 transition ${
              selectedAudienceMode === 'personalized'
                ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-sm'
                : 'border-gray-300 text-gray-600 hover:border-primary-300'
            }`}
          >
            Tailored to me
            {activeRole && <span className="ml-1 text-xs uppercase text-primary-500">({labelForAudience(activeRole)})</span>}
          </button>
          <button
            type="button"
            onClick={() => onAudienceModeChange('all')}
            className={`rounded-full border px-3 py-1 transition ${
              selectedAudienceMode === 'all'
                ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-sm'
                : 'border-gray-300 text-gray-600 hover:border-primary-300'
            }`}
          >
            Show everything
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {availableTags.length === 0 ? (
          <p className="text-sm text-gray-600">Tags will appear once we add more resources.</p>
        ) : (
          availableTags.map((tag) => {
            const selected = selectedTag === tag
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onTagChange(selected ? null : tag)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                  selected
                    ? 'border-primary-600 bg-primary-50 text-primary-700'
                    : 'border-gray-300 text-gray-600 hover:border-primary-300'
                }`}
              >
                {tag.replace(/_/g, ' ')}
              </button>
            )
          })
        )}
      </div>
    </section>
  )
}

function labelForAudience(audience: ResourceAudience): string {
  switch (audience) {
    case 'recovery':
      return 'Recovery'
    case 'still_using':
      return 'Thinking of change'
    case 'supporter':
      return 'Supporters'
    case 'all':
    default:
      return 'Everyone'
  }
}


