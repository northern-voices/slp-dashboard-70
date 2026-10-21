import { format } from 'date-fns'
import { ReportBanner, ReportFooter } from './shared/ReportBannerChrome'
import { DYNAMIC_GOAL_SHEET_RATING_OPTIONS } from '@/constants/dynamicGoalSheet'
import type { DynamicGoalSheetSession } from '@/types/database'

interface DynamicGoalSheetReportPage {
  page_number: number
  goal_text: string
  sessions: DynamicGoalSheetSession[]
}

interface DynamicGoalSheetReportData {
  context: {
    student_name: string
    pages: DynamicGoalSheetReportData[]
  }
}
