import { BookOpen, Target, TrendingUp, List, PenLine } from 'lucide-react'

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
    label: 'Goal Sheet',
    description:
      "Standardized goal sheets using student's most recent speech screen results and the cycles approach to guide speech therapy",
    icon: Target,
  },
  {
    value: 'customizable-goal-sheet',
    label: 'Customizable Goal Sheet',
    description:
      "Customizable goal sheets that allows the SLP to create and modify goals based on student's specific needs",
    icon: PenLine,
  },
  // {
  //   value: 'progress-goal-sheet',
  //   label: 'Progress Goal Sheet',
  //   description: 'Updated goal tracking sheet reflecting current progress metrics',
  //   icon: List,
  // },
]
