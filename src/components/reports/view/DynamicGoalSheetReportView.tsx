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

const Checkbox = ({ label, checked }: { label: string; checked?: boolean }) => (
  <div className='flex items-start gap-1.6 mb-1'>
    <div
      className={`w-2.5 h-2.5 border border-gray-700 shrink-0 mt-0.5 ${checked ? 'bg-gray-700' : ''}`}
    />
    <span className='text-[11px] leading-tight'>{label}</span>
  </div>
)
