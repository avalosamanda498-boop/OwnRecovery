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
    title: '5-minute Grounding Breath',
    description:
      'Follow a guided breathing reset to lower stress and cravings. No app install required—just press play and follow along.',
    kind: 'audio',
    url: 'https://open.spotify.com/episode/0mh-grounding', // Placeholder public link
    length: '5 min',
    organization: 'Mindful Recovery Project',
    tags: ['breathing', 'reset', 'quick'],
    audience: ['all'],
    focus: 'cravings',
    formatNote: 'Audio guide',
  },
  {
    id: 'urge-surfing',
    title: 'Urge Surfing Worksheet',
    description:
      'Practice noticing cravings like waves. This printable worksheet walks you through acknowledging, observing, and letting an urge pass without judgment.',
    kind: 'worksheet',
    url: 'https://storage.googleapis.com/recovery-assets/urge-surfing.pdf',
    length: '2 pages',
    organization: 'SAMHSA',
    tags: ['cravings', 'worksheet', 'coping'],
    audience: ['recovery', 'still_using'],
    focus: 'cravings',
    formatNote: 'PDF download',
  },
  {
    id: 'daily-reflect',
    title: 'Daily Reflection Prompts',
    description:
      'A gentle list of reflection prompts you can use for journaling or quick voice notes when you need to name what you’re feeling.',
    kind: 'toolkit',
    url: 'https://storage.googleapis.com/recovery-assets/daily-reflection-prompts.pdf',
    organization: 'Own Recovery',
    tags: ['journaling', 'mindset', 'self-awareness'],
    audience: ['all'],
    focus: 'mindset',
    formatNote: 'Printable prompts',
  },
  {
    id: 'supporter-checklist',
    title: 'Supporter Check-in Guide',
    description:
      'Quick guide for loved ones on how to check in, what questions to ask, and how to listen without judgment.',
    kind: 'toolkit',
    url: 'https://storage.googleapis.com/recovery-assets/supporter-check-in-guide.pdf',
    length: '1 page',
    organization: 'Partnership to End Addiction',
    tags: ['supporter', 'communication', 'listening'],
    audience: ['supporter'],
    focus: 'support',
    formatNote: 'Printable card',
  },
  {
    id: 'sleep-reset',
    title: 'Sleep Reset for Recovery',
    description:
      'Short article covering restorative bedtime habits that help when sleep is disrupted by recovery or stress.',
    kind: 'article',
    url: 'https://www.sleepfoundation.org/sleep-hygiene/recovery-sleep-guide',
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
      'Learn how the stages of change model applies to substance use. Helpful when you are considering change or supporting someone through it.',
    kind: 'article',
    url: 'https://www.healthline.com/health/stages-of-change',
    organization: 'Healthline',
    tags: ['education', 'motivation', 'stages_of_change'],
    audience: ['still_using', 'supporter'],
    focus: 'education',
    formatNote: 'Web article',
  },
  {
    id: 'cope-in-crisis',
    title: 'Crisis & Safety Resources',
    description:
      'Hotlines and text lines offering immediate support across the U.S. Save these numbers if you or someone else needs urgent help.',
    kind: 'hotline',
    url: 'https://www.samhsa.gov/find-help/national-helpline',
    organization: 'SAMHSA',
    tags: ['safety', 'urgent', 'hotline'],
    audience: ['all'],
    focus: 'safety',
    formatNote: '24/7 helplines',
  },
  {
    id: '30day-planner',
    title: '30-Day Recovery Momentum Planner',
    description:
      'Printable calendar that pairs daily prompts with supportive actions. Use it to track check-ins, urges, and energy.',
    kind: 'worksheet',
    url: 'https://storage.googleapis.com/recovery-assets/30-day-momentum-planner.pdf',
    organization: 'SMART Recovery',
    tags: ['planning', 'consistency', 'tracking'],
    audience: ['recovery'],
    focus: 'mindset',
    formatNote: 'Printable planner',
  },
  {
    id: 'supporter-podcast',
    title: 'Holding Space Without Fixing',
    description:
      'Podcast for supporters exploring how to show up with empathy and boundaries while your loved one navigates recovery.',
    kind: 'audio',
    url: 'https://open.spotify.com/episode/supporter-holding-space',
    length: '18 min',
    organization: 'Refuge Recovery',
    tags: ['supporter', 'boundaries', 'listening'],
    audience: ['supporter'],
    focus: 'support',
    formatNote: 'Podcast episode',
  },
  {
    id: 'mindfulness-micro',
    title: 'Micro Mindfulness for Busy Days',
    description:
      'Video walkthrough of three grounding exercises you can do in under two minutes when cravings or stress spike.',
    kind: 'video',
    url: 'https://www.youtube.com/watch?v=micro-mindfulness',
    length: '7 min',
    organization: 'Therapy Aid Coalition',
    tags: ['mindfulness', 'stress', 'quick'],
    audience: ['all'],
    focus: 'cravings',
    formatNote: 'Video',
  },
  {
    id: 'values-card-sort',
    title: 'Values Clarification Card Sort',
    description:
      'Interactive exercise to identify what matters most right now. Use it to guide decisions or motivate change on your terms.',
    kind: 'toolkit',
    url: 'https://storage.googleapis.com/recovery-assets/values-card-sort.pdf',
    organization: 'Hazelden Betty Ford',
    tags: ['motivation', 'self-awareness', 'values'],
    audience: ['still_using', 'recovery'],
    focus: 'mindset',
    formatNote: 'Card sort',
  },
  {
    id: 'community-finder',
    title: 'Find Local Recovery Meetings',
    description:
      'Search tool for in-person and virtual recovery meetings across the U.S., including AA, SMART, and Refuge Recovery.',
    kind: 'toolkit',
    url: 'https://www.recoverydhp.org/find-a-meeting',
    organization: 'Recovery Dharma',
    tags: ['community', 'meetings', 'support'],
    audience: ['recovery', 'supporter'],
    focus: 'support',
    formatNote: 'Search tool',
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


