import { BookOpen, Target, TrendingUp, List } from 'lucide-react'

export const SPEECH_REPORT_OPTIONS = [
  {
    value: 'initial-speech-report',
    label: 'Initial Speech Report',
    description: 'Detailed student assessment and performance overview',
    icon: BookOpen,
  },

  {
    value: 'progress-speech-report',
    label: 'Progress Speech Report',
    description: 'Comprehensive progress summary showing achievements and therapy outcomes',
    icon: TrendingUp,
  },
]

export const SPEECH_GOAL_SHEET_OPTIONS = [
  {
    value: 'initial-goal-sheet',
    label: 'Initial Goal Sheet',
    description: 'Individualized goal tracking sheet with specific objectives and progress metrics',
    icon: Target,
  },
  // {
  //   value: 'progress-goal-sheet',
  //   label: 'Progress Goal Sheet',
  //   description: 'Updated goal tracking sheet reflecting current progress metrics',
  //   icon: List,
  // },
]
