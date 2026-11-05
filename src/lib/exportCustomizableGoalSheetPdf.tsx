import { format } from 'date-fns'
import type { CustomizableGoalSheetWithPages } from '@/types/database'

export const exportCustomizableGoalSheetPdf = async (sheet: CustomizableGoalSheetWithPages) => {
  const [{ pdf }, { default: CustomizableGoalSheetPdf }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/components/reports/pdf/CustomizableGoalSheetPdf'),
  ])

  const studentName = `${sheet.student?.first_name ?? ''} ${sheet.student?.last_name ?? ''}`.trim()

  const blob = await pdf(
    <CustomizableGoalSheetPdf
      data={{
        studentName,
        pages: sheet.pages.map(page => ({
          pageNumber: page.page_number,
          goalText: page.goal_text,
          sessions: page.sessions,
        })),
      }}
    />
  ).toBlob()

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${studentName || 'Student'} - Goal Sheet - ${format(new Date(sheet.created_at), 'MMM d, yyyy')}.pdf`
  link.click()
  URL.revokeObjectURL(url)
}
