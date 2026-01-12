'use client'

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
  const isExternalLink = /^https?:\/\//i.test(resource.url)

  return (
    <article className="card flex flex-col gap-4 border border-primary-100 bg-white text-gray-700 shadow-sm">
      <header className="flex flex-col gap-2">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-800 shadow-sm">
          {kindLabel}
          {resource.length && <span className="text-primary-600">∙ {resource.length}</span>}
        </span>
        <h3 className="text-lg font-semibold text-gray-900">{resource.title}</h3>
        <p className="text-sm text-gray-700">{resource.description}</p>
      </header>

      <dl className="grid grid-cols-1 gap-3 text-sm text-gray-700 md:grid-cols-2">
        {resource.organization && (
          <div>
            <dt className="font-medium text-gray-900">Source</dt>
            <dd>{resource.organization}</dd>
          </div>
        )}
        <div>
          <dt className="font-medium text-gray-900">Focus</dt>
          <dd className="capitalize text-gray-700">{resource.focus.replace(/_/g, ' ')}</dd>
        </div>
        {resource.formatNote && (
          <div>
            <dt className="font-medium text-gray-900">Format</dt>
            <dd className="text-gray-700">{resource.formatNote}</dd>
          </div>
        )}
        <div>
          <dt className="font-medium text-gray-900">Best for</dt>
          <dd className="capitalize text-gray-700">{formatAudience(resource.audience)}</dd>
        </div>
      </dl>

      {resource.tags.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {resource.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700 shadow-sm"
            >
              {tag.replace(/_/g, ' ')}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto pt-2">
        {isExternalLink ? (
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-600 via-electric-violet to-secondary-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_40px_-25px_rgba(76,194,255,0.65)] transition hover:shadow-[0_20px_45px_-25px_rgba(76,194,255,0.75)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400/70"
          >
            Open resource
            <span aria-hidden="true">↗</span>
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-gray-300 bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-500"
          >
            Link coming soon
          </button>
        )}
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


