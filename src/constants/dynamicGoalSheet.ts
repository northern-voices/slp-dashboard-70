import type { DynamicGoalSheetRating } from '@/types/database'

export const DYNAMIC_GOAL_SHEET_RATING_OPTIONS: Array<{
  value: DynamicGoalSheetRating
  label: string
}> = [
  { value: 'not_saying', label: 'Could not say the sound' },
  { value: 'sound_only', label: 'Could say the sound (but not in words)' },
  { value: 'most_words_with_cues', label: 'Could say the sound in most words (with adult cues)' },
  { value: 'most_words_independent', label: 'Could say the sound in most words (no adult help)' },
]
