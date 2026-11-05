import type { CustomizableGoalSheetRating } from '@/types/database'

export const CUSTOMIZABLE_GOAL_SHEET_RATING_OPTIONS: Array<{
  value: CustomizableGoalSheetRating
  label: string
}> = [
  { value: 'not_saying', label: 'Not yet demonstrated - Requires continued support' },
  { value: 'most_words_with_cues', label: 'Emerging' },
  { value: 'most_words_independent', label: 'Achieved' },
]
