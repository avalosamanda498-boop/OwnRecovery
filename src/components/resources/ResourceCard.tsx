'use client'

import Link from 'next/link'
import { RESOURCE_KINDS, type ResourceItem, type ResourceKind } from '@/data/resources'

const KIND_LABEL_LOOKUP: Record<ResourceKind, string> = RESOURCE_KINDS.reduce(
  (map, entry) => {
    map[entry.id] = entry.label
    return map
  },
  {} as Record<ResourceKind, string>
)

export function ResourceCard({ resource }: { resource: ResourceItem }) {
  const kindLabel = KIND_LABEL_LOOKUP[resource.kind] ?? 'Resource'

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-primary-200 hover:shadow-md">
      <header className="flex flex-col gap-2">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700">
          {kindLabel}
          {resource.length && <span className="text-primary-500">∙ {resource.length}</span>}
        </span>
        <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>
        <p className="text-sm text-gray-600">{resource.description}</p>
      </header>

      <dl className="grid grid-cols-1 gap-3 text-sm text-gray-600 md:grid-cols-2">
        {resource.organization && (
          <div>
            <dt className="font-medium text-gray-700">Source</dt>
            <dd>{resource.organization}</dd>
          </div>
        )}
        <div>
          <dt className="font-medium text-gray-700">Focus</dt>
          <dd className="capitalize">{resource.focus.replace(/_/g, ' ')}</dd>
        </div>
        {resource.formatNote && (
          <div>
            <dt className="font-medium text-gray-700">Format</dt>
            <dd>{resource.formatNote}</dd>
          </div>
        )}
        <div>
          <dt className="font-medium text-gray-700">Best for</dt>
          <dd className="capitalize">{formatAudience(resource.audience)}</dd>
        </div>
      </dl>

      {resource.tags.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {resource.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-gray-600"
            >
              {tag.replace(/_/g, ' ')}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto">
        <Link
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          Open resource
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  )
}

function formatAudience(audience: ResourceItem['audience']): string {
  if (audience.includes('all')) {
    return 'Everyone'
  }
  if (audience.length === 1) {
    return labelForAudience(audience[0])
  }
  return audience.map(labelForAudience).join(' · ')
}

function labelForAudience(audience: ResourceItem['audience'][number]): string {
  switch (audience) {
    case 'recovery':
      return 'In recovery'
    case 'still_using':
      return 'Thinking about change'
    case 'supporter':
      return 'Supporters & loved ones'
    case 'all':
    default:
      return 'Everyone'
  }
}


