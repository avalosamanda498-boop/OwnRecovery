'use server'

import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

const RESOURCE_SELECT =
  'id, title, description, type, url, content, tags, target_audience, created_at, updated_at'

const RESOURCE_TYPES = new Set([
  'article',
  'video',
  'worksheet',
  'meditation',
  'breathing_exercise',
])

const AUDIENCE_TYPES = new Set(['recovery', 'still_using', 'supporter'])

export async function GET(request: Request) {
  const url = new URL(request.url)
  const type = url.searchParams.get('type')?.trim() ?? null
  const tag = url.searchParams.get('tag')?.trim() ?? null
  const audience = url.searchParams.get('audience')?.trim() ?? null
  const query = url.searchParams.get('q')?.trim() ?? null

  if (type && !RESOURCE_TYPES.has(type)) {
    return NextResponse.json({ error: 'Unsupported resource type.' }, { status: 400 })
  }

  if (audience && !AUDIENCE_TYPES.has(audience)) {
    return NextResponse.json({ error: 'Unsupported audience filter.' }, { status: 400 })
  }

  const client = supabaseAdmin ?? supabase
  let builder = client.from('resources').select(RESOURCE_SELECT).order('created_at', { ascending: false })

  if (type) {
    builder = builder.eq('type', type)
  }

  if (tag) {
    builder = builder.contains('tags', [tag])
  }

  if (audience) {
    builder = builder.contains('target_audience', [audience])
  }

  if (query) {
    builder = builder.or(
      `title.ilike.%${query.replace(/%/g, '\\%').replace(/_/g, '\\_')}%,description.ilike.%${query.replace(/%/g, '\\%').replace(/_/g, '\\_')}%`
    )
  }

  const { data, error } = await builder

  if (error) {
    console.error('Error fetching resources', error)
    return NextResponse.json({ error: 'We could not load resources right now.' }, { status: 500 })
  }

  return NextResponse.json({ resources: data ?? [] })
}


