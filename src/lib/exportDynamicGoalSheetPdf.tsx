import type { DynamicGoalSheetWithSessions } from '@/types/database'

export const exportDynamicGoalSheetPdf = async (sheet: DynamicGoalSheetWithSessions) => {
  const [{ pdf }, { default: DynamicGoalSheetPdf }] = await Promise.all([
    import('@react-pdf/renderer'),
    import('@/components/reports/pdf/DynamicGoalSheetPdf'),
  ])

  const studentName = `${sheet.student?.first_name ?? ''} ${sheet.student?.last_name ?? ''}`.trim()

  const blob = await pdf(
    <DynamicGoalSheetPdf
      data={{ studentName, goalText: sheet.goal_text, sessions: sheet.sessions }}
    />
  ).toBlob()

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${studentName || 'Student'} - Dynamic Goal Sheet.pdf`
  link.click()
  URL.revokeObjectURL(url)
}
