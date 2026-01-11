import type { Resource, UserRole } from '@/types/database'

export type ResourceType = Resource['type']

export interface ResourceFilters {
  type?: ResourceType | 'all'
  tag?: string | null
  audience?: UserRole | 'all'
  search?: string | null
}

export async function fetchResources(filters: ResourceFilters = {}): Promise<Resource[]> {
  const params = new URLSearchParams()

  if (filters.type && filters.type !== 'all') {
    params.set('type', filters.type)
  }

  if (filters.tag) {
    params.set('tag', filters.tag)
  }

  if (filters.audience && filters.audience !== 'all') {
    params.set('audience', filters.audience)
  }

  if (filters.search) {
    params.set('q', filters.search)
  }

  const query = params.toString()
  const response = await fetch(`/api/resources${query ? `?${query}` : ''}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload?.error ?? 'We could not load resources right now.')
  }

  return (payload?.resources as Resource[] | undefined) ?? []
}

export function getResourceTypeLabel(type: ResourceType): string {
  switch (type) {
    case 'article':
      return 'Article'
    case 'video':
      return 'Video'
    case 'worksheet':
      return 'Worksheet'
    case 'meditation':
      return 'Meditation'
    case 'breathing_exercise':
      return 'Breathing Exercise'
    default:
      return type
  }
}


