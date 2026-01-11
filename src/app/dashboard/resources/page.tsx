'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  RESOURCE_KINDS,
  RESOURCE_LIBRARY,
  type ResourceAudience,
  type ResourceItem,
  type ResourceKind,
} from '@/data/resources'
import { ResourceCard } from '@/components/resources/ResourceCard'
import { ResourceFilters } from '@/components/resources/ResourceFilters'
import { getCurrentUser, type AuthUser } from '@/lib/auth'
import { fetchResources } from '@/lib/resources'
import type { Resource } from '@/types/database'

type FilteredKind = ResourceKind | 'all'

export default function ResourceLibraryPage() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [kind, setKind] = useState<FilteredKind>('all')
  const [audienceMode, setAudienceMode] = useState<'personalized' | 'all'>('personalized')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [remoteResources, setRemoteResources] = useState<ResourceItem[] | null>(null)
  const [resourceError, setResourceError] = useState<string | null>(null)
  const [resourceLoading, setResourceLoading] = useState(true)

  useEffect(() => {
    getCurrentUser()
      .then((profile) => setUser(profile))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadResources() {
      setResourceLoading(true)
      try {
        const records = await fetchResources()
        if (cancelled) return
        if (records.length > 0) {
          setRemoteResources(records.map(adaptResourceRecord))
        } else {
          setRemoteResources([])
        }
        setResourceError(null)
      } catch (error: any) {
        if (cancelled) return
        console.error('Error loading resource library', error)
        setResourceError(error?.message ?? 'We could not reach the resource library. Showing our curated starter set.')
        setRemoteResources(null)
      } finally {
        if (!cancelled) {
          setResourceLoading(false)
        }
      }
    }

    loadResources()
    return () => {
      cancelled = true
    }
  }, [])

  const activeAudience: ResourceAudience | null = useMemo(() => mapRoleToAudience(user?.role ?? null), [user?.role])

  useEffect(() => {
    if (!activeAudience) {
      setAudienceMode('all')
    }
  }, [activeAudience])

  const sourceResources = useMemo(() => {
    if (remoteResources && remoteResources.length > 0) {
      return remoteResources
    }
    return RESOURCE_LIBRARY
  }, [remoteResources])

  const baseResources = useMemo(() => {
    if (audienceMode === 'personalized' && activeAudience) {
      return sourceResources.filter((resource) => matchesAudience(resource, activeAudience))
    }
    return sourceResources
  }, [audienceMode, activeAudience, sourceResources])

  const filteredResources = useMemo(() => {
    return baseResources.filter((resource) => {
      if (kind !== 'all' && resource.kind !== kind) {
        return false
      }
      if (selectedTag && !resource.tags.includes(selectedTag)) {
        return false
      }
      if (searchTerm.trim().length > 0) {
        const term = searchTerm.trim().toLowerCase()
        const haystack = [resource.title, resource.description, resource.organization, ...resource.tags].join(' ')
        if (!haystack.toLowerCase().includes(term)) {
          return false
        }
      }
      return true
    })
  }, [baseResources, kind, selectedTag, searchTerm])

  const recommendedResources = useMemo(() => {
    if (audienceMode === 'all' && baseResources.length === sourceResources.length) {
      return []
    }
    const priorityOrder: ResourceKind[] = ['article', 'audio', 'video', 'worksheet', 'toolkit', 'hotline']
    return [...baseResources]
      .sort((a, b) => priorityOrder.indexOf(a.kind) - priorityOrder.indexOf(b.kind))
      .slice(0, 3)
  }, [audienceMode, baseResources, sourceResources])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="rounded-2xl border border-primary-200 bg-white/95 p-8 text-center shadow-lg">
          <h1 className="text-2xl font-semibold text-gray-900">Sign in to explore the library</h1>
          <p className="mt-2 text-sm text-gray-600">Resources are curated based on your recovery path and preferences.</p>
          <Link
            href="/auth/login"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700"
          >
            Go to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="rounded-3xl border border-primary-100 bg-white/95 p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <p className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700">
                Library beta
              </p>
              <h1 className="text-3xl font-bold text-gray-900">Resource hub curated for your journey</h1>
              <p className="text-sm text-gray-600">
                Explore exercises, articles, and supportive tools chosen to keep our AI advisory in the loop and humans in
                control. Everything here is ready to use and respects anonymous mode.
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-100"
              >
                Back to dashboard
              </Link>
              <Link
                href="/dashboard/settings"
                className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 shadow-sm transition hover:bg-primary-100"
              >
                Privacy &amp; data controls
              </Link>
            </div>
          </div>
          {activeAudience && (
            <p className="mt-4 rounded-2xl border border-primary-100 bg-primary-50/70 px-4 py-3 text-sm text-primary-700">
              We’re prioritizing resources for{' '}
              <span className="font-semibold capitalize">{labelForAudience(activeAudience)}</span>. Switch to “Show
              everything” to browse the full library.
            </p>
          )}
        </header>

        {resourceLoading && (
          <div className="rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 text-sm text-gray-600 shadow-sm">
            Loading saved resources…
          </div>
        )}

        {resourceError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 shadow-sm">
            {resourceError}
          </div>
        )}

        <ResourceFilters
          availableResources={baseResources}
          selectedKind={kind}
          onKindChange={(value) => setKind(value)}
          selectedAudienceMode={audienceMode}
          onAudienceModeChange={(mode) => {
            setAudienceMode(mode)
            if (mode === 'personalized' && !activeAudience) {
              setAudienceMode('all')
            }
          }}
          searchTerm={searchTerm}
          onSearchTermChange={(value) => setSearchTerm(value)}
          selectedTag={selectedTag}
          onTagChange={(tag) => setSelectedTag(tag)}
          activeRole={activeAudience}
        />

        {recommendedResources.length > 0 && (
          <section className="space-y-4 rounded-3xl border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-primary-100/40 p-6 shadow-sm">
            <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Quick picks for today</h2>
                <p className="text-sm text-gray-600">
                  Based on your role, these are three resources members reach for most often. They stay anonymous and
                  respect your privacy selections.
                </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700">
                Tailored suggestions
              </span>
            </header>
            <div className="grid gap-4 md:grid-cols-3">
              {recommendedResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          </section>
        )}

        <section className="space-y-4">
          <header>
            <h2 className="text-lg font-semibold text-gray-900">
              {kind === 'all'
                ? 'All available resources'
                : `Resources filtered by ${RESOURCE_KINDS.find((entry) => entry.id === kind)?.label ?? 'format'}`}
            </h2>
            <p className="text-sm text-gray-600">
              {filteredResources.length} item{filteredResources.length === 1 ? '' : 's'} match your filters.
            </p>
          </header>

          {filteredResources.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white/90 p-6 text-sm text-gray-600">
              We don’t have a resource that matches those filters yet. Try clearing the tag or searching a broader term.
              You can also{' '}
              <a
                className="text-primary-600 underline"
                href="mailto:hello@ownrecovery.app?subject=Resource%20suggestion"
              >
                suggest a resource
              </a>{' '}
              and we’ll add it to the queue.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function mapRoleToAudience(role: AuthUser['role']): ResourceAudience | null {
  switch (role) {
    case 'recovery':
      return 'recovery'
    case 'still_using':
      return 'still_using'
    case 'supporter':
      return 'supporter'
    default:
      return null
  }
}

function matchesAudience(resource: ResourceItem, audience: ResourceAudience): boolean {
  return resource.audience.includes('all') || resource.audience.includes(audience)
}

function labelForAudience(audience: ResourceAudience): string {
  switch (audience) {
    case 'recovery':
      return 'recovery members'
    case 'still_using':
      return 'people exploring change'
    case 'supporter':
      return 'supporters & loved ones'
    case 'all':
    default:
      return 'everyone'
  }
}

function adaptResourceRecord(record: Resource): ResourceItem {
  const kind = mapResourceType(record.type)
  const tags = Array.isArray(record.tags) ? record.tags.filter((tag): tag is string => typeof tag === 'string') : []
  const audience = sanitizeAudienceList(record.target_audience)

  return {
    id: record.id,
    title: record.title,
    description: record.description,
    kind,
    url: record.url ?? '#',
    tags,
    audience,
    focus: inferFocus(tags),
    formatNote: formatNoteForType(kind),
    organization: undefined,
    length: undefined,
  }
}

function mapResourceType(type: Resource['type']): ResourceKind {
  switch (type) {
    case 'article':
    case 'video':
    case 'worksheet':
      return type
    case 'meditation':
      return 'meditation'
    case 'breathing_exercise':
      return 'breathing_exercise'
    default:
      return 'toolkit'
  }
}

function sanitizeAudienceList(audiences: Resource['target_audience'] | undefined): ResourceAudience[] {
  if (!Array.isArray(audiences) || audiences.length === 0) {
    return ['all']
  }

  const mapped = audiences.reduce<ResourceAudience[]>((list, entry) => {
    if (entry === 'recovery' || entry === 'still_using' || entry === 'supporter') {
      list.push(entry)
    }
    return list
  }, [])

  return mapped.length > 0 ? mapped : ['all']
}

function inferFocus(tags: string[]): ResourceItem['focus'] {
  const normalized = tags.map((tag) => tag.toLowerCase())
  if (normalized.some((tag) => tag.includes('crav') || tag.includes('urge'))) {
    return 'cravings'
  }
  if (normalized.some((tag) => tag.includes('sleep'))) {
    return 'sleep'
  }
  if (normalized.some((tag) => tag.includes('support') || tag.includes('family'))) {
    return 'support'
  }
  if (normalized.some((tag) => tag.includes('safety') || tag.includes('crisis'))) {
    return 'safety'
  }
  if (normalized.some((tag) => tag.includes('mind') || tag.includes('meditation') || tag.includes('breath'))) {
    return 'mindset'
  }
  return 'education'
}

function formatNoteForType(kind: ResourceKind): string | undefined {
  switch (kind) {
    case 'breathing_exercise':
      return 'Breathing exercise'
    case 'meditation':
      return 'Guided meditation'
    case 'hotline':
      return '24/7 hotline'
    case 'audio':
      return 'Audio guide'
    default:
      return undefined
  }
}



