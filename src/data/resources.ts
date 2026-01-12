export type ResourceKind =
  | 'article'
  | 'video'
  | 'worksheet'
  | 'audio'
  | 'toolkit'
  | 'hotline'
  | 'meditation'
  | 'breathing_exercise'

export type ResourceAudience = 'recovery' | 'still_using' | 'supporter' | 'all'

export interface ResourceItem {
  id: string
  title: string
  description: string
  kind: ResourceKind
  url: string
  length?: string
  organization?: string
  tags: string[]
  audience: ResourceAudience[]
  focus: 'mindset' | 'cravings' | 'support' | 'sleep' | 'education' | 'safety'
  formatNote?: string
}

export const RESOURCE_LIBRARY: ResourceItem[] = [
  {
    id: 'mindful-minute',
    title: '5-Minute Calm Breathing',
    description:
      'A short guided breathing practice to dial down anxiety and cravings. No account required—press play and breathe along.',
    kind: 'video',
    url: 'https://www.youtube.com/watch?v=inpok4MKVLM',
    length: '5 min',
    organization: 'Headspace & Goodful',
    tags: ['breathing', 'reset', 'mindfulness'],
    audience: ['all'],
    focus: 'cravings',
    formatNote: 'Guided video',
  },
  {
    id: 'urge-surfing',
    title: 'Urge Surfing Worksheet',
    description:
      'Printable worksheet that teaches the urge-surfing technique—notice, breathe, and ride out cravings without acting on them.',
    kind: 'worksheet',
    url: 'https://www.smartrecovery.org/wp-content/uploads/2019/07/Urge-Surfing.pdf',
    length: '2 pages',
    organization: 'SMART Recovery',
    tags: ['cravings', 'worksheet', 'coping'],
    audience: ['recovery', 'still_using'],
    focus: 'cravings',
    formatNote: 'PDF download',
  },
  {
    id: 'daily-reflect',
    title: 'Daily Recovery Reflection Journal',
    description:
      'Guided prompts for morning, midday, and evening check-ins so you can spot triggers early and celebrate small wins.',
    kind: 'toolkit',
    url: 'https://www.smartrecovery.org/wp-content/uploads/2021/05/SMART-Recovery-Planning-Daily-Journal.pdf',
    length: 'Printable journal',
    organization: 'SMART Recovery',
    tags: ['journaling', 'mindset', 'self-awareness'],
    audience: ['all'],
    focus: 'mindset',
    formatNote: 'Printable prompts',
  },
  {
    id: 'supporter-checklist',
    title: 'Supporter Check-in Guide',
    description:
      'A one-page conversation guide for loved ones: what to ask, how to listen, and phrases that keep boundaries supportive.',
    kind: 'toolkit',
    url: 'https://drugfree.org/article/7-cs-for-families/',
    length: '1 page',
    organization: 'Partnership to End Addiction',
    tags: ['supporter', 'communication', 'listening'],
    audience: ['supporter'],
    focus: 'support',
    formatNote: 'Web guide',
  },
  {
    id: 'sleep-reset',
    title: 'Sleep Reset for Recovery',
    description:
      'Evidence-based strategies to rebuild healthy sleep while your body adjusts to recovery or reduced substance use.',
    kind: 'article',
    url: 'https://www.sleepfoundation.org/mental-health/addiction-and-sleep',
    organization: 'Sleep Foundation',
    tags: ['sleep', 'routine', 'wellness'],
    audience: ['recovery', 'still_using'],
    focus: 'sleep',
    formatNote: 'Web article',
  },
  {
    id: 'stages-of-change',
    title: 'Understanding the Stages of Change',
    description:
      'A plain-language walkthrough of the stages-of-change model, helpful for deciding next steps or supporting someone else.',
    kind: 'article',
    url: 'https://www.health.harvard.edu/blog/stages-of-change-20180326',
    organization: 'Harvard Health Publishing',
    tags: ['education', 'motivation', 'stages_of_change'],
    audience: ['still_using', 'supporter'],
    focus: 'education',
    formatNote: 'Web article',
  },
  {
    id: 'twelve-steps',
    title: 'The Twelve Steps of Alcoholics Anonymous',
    description:
      'Read and download the Twelve Steps exactly as shared in AA meetings worldwide, with links to newcomer resources.',
    kind: 'article',
    url: 'https://www.aa.org/the-twelve-steps',
    organization: 'Alcoholics Anonymous',
    tags: ['12_steps', 'aa', 'spiritual', 'recovery_plan'],
    audience: ['recovery', 'still_using', 'supporter'],
    focus: 'education',
    formatNote: 'Web article',
  },
  {
    id: 'cope-in-crisis',
    title: 'Crisis & Safety Resources',
    description:
      'Immediate, confidential support via call, text, or chat. Share with supporters so everyone knows how to get help fast.',
    kind: 'hotline',
    url: 'https://988lifeline.org/',
    organization: '988 Suicide & Crisis Lifeline',
    tags: ['safety', 'urgent', 'hotline'],
    audience: ['all'],
    focus: 'safety',
    formatNote: '24/7 helplines',
  },
  {
    id: '30day-planner',
    title: '30-Day Recovery Momentum Planner',
    description:
      'Daily prompts and checkboxes for cravings, gratitude, self-care, and sober activities to build a month of momentum.',
    kind: 'worksheet',
    url: 'https://www.smartrecovery.org/wp-content/uploads/2020/05/30-Day-Challenge.pdf',
    organization: 'SMART Recovery',
    tags: ['planning', 'consistency', 'tracking'],
    audience: ['recovery'],
    focus: 'mindset',
    formatNote: 'Printable planner',
  },
  {
    id: 'supporter-podcast',
    title: 'Partners in Recovery Podcast',
    description:
      'Stories and skills for families navigating a loved one’s substance use. Learn how to hold boundaries while staying connected.',
    kind: 'audio',
    url: 'https://drugfree.org/podcast/',
    organization: 'Partnership to End Addiction',
    tags: ['supporter', 'boundaries', 'listening'],
    audience: ['supporter'],
    focus: 'support',
    formatNote: 'Podcast series',
  },
  {
    id: 'mindfulness-micro',
    title: '2-Minute Mindfulness Reset',
    description:
      'A two-minute mindfulness practice designed for busy days—perfect between obligations or when urges spike.',
    kind: 'video',
    url: 'https://www.youtube.com/watch?v=ZToicYcHIOU',
    length: '2 min',
    organization: 'Johns Hopkins Mindfulness',
    tags: ['mindfulness', 'stress', 'quick'],
    audience: ['all'],
    focus: 'mindset',
    formatNote: 'Video',
  },
  {
    id: 'values-card-sort',
    title: 'Values Clarification Card Sort',
    description:
      'Identify the personal values you want recovery to protect. Helpful for building motivation or explaining needs to supporters.',
    kind: 'toolkit',
    url: 'https://www.actmindfully.com.au/wp-content/uploads/2019/07/values-card-sort.pdf',
    organization: 'ACT Mindfully',
    tags: ['motivation', 'self-awareness', 'values'],
    audience: ['still_using', 'recovery'],
    focus: 'mindset',
    formatNote: 'Card sort',
  },
  {
    id: 'community-finder',
    title: 'Find Local Recovery Meetings',
    description:
      'Search for in-person or online AA meetings worldwide. Use with SMART, Refuge Recovery, or other mutual-aid communities.',
    kind: 'toolkit',
    url: 'https://www.aa.org/find-aa',
    organization: 'Alcoholics Anonymous',
    tags: ['community', 'meetings', 'support'],
    audience: ['recovery', 'supporter'],
    focus: 'support',
    formatNote: 'Search tool',
  },
  {
    id: 'alanon-intro',
    title: 'Welcome to Al-Anon Family Groups',
    description:
      'Support for family and friends affected by someone’s drinking. Includes newcomer resources and a meeting finder.',
    kind: 'article',
    url: 'https://al-anon.org/newcomers/al-anon-welcome/',
    organization: 'Al-Anon Family Groups',
    tags: ['supporter', 'family', 'community'],
    audience: ['supporter'],
    focus: 'support',
    formatNote: 'Web guide',
  },
]

export const RESOURCE_KINDS: Array<{ id: ResourceKind; label: string }> = [
  { id: 'article', label: 'Articles' },
  { id: 'video', label: 'Videos' },
  { id: 'audio', label: 'Audio' },
  { id: 'worksheet', label: 'Worksheets' },
  { id: 'toolkit', label: 'Toolkits' },
  { id: 'hotline', label: 'Hotlines' },
  { id: 'meditation', label: 'Meditations' },
  { id: 'breathing_exercise', label: 'Breathing exercises' },
]


