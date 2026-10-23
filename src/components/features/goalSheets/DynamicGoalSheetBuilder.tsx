import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Download, Plus, Trash2 } from 'lucide-react'
import { useCurrentSchool } from '@/hooks/school/useCurrentSchool'
import { useDynamicGoalSheet } from '@/hooks/goalSheets/use-dynamic-goal-sheets'
import {
  useUpdatePageGoalText,
  useDeleteDynamicGoalSheet,
  useAddPage,
} from '@/hooks/goalSheets/use-dynamic-goal-sheets-mutations'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import DynamicGoalSheetPage from './DynamicGoalSheetPage'
import { exportDynamicGoalSheetPdf } from '@/lib/exportDynamicGoalSheetPdf'

interface DynamicGoalSheetBuilderProps {
  sheetId: string
}

const DynamicGoalSheetBuilder = ({ sheetId }: DynamicGoalSheetBuilderProps) => {
  const navigate = useNavigate()
  const { currentSchool } = useCurrentSchool()

  const { data: sheet, isLoading } = useDynamicGoalSheet(sheetId)
  const updatePageGoalText = useUpdatePageGoalText()
  const deleteGoalSheet = useDeleteDynamicGoalSheet()
  const addPage = useAddPage()

  const [goalTextByPageId, setGoalTextByPageId] = useState<Record<string, string>>({})
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  useEffect(() => {
    if (!sheet) return
    setGoalTextByPageId(prev => {
      const next = { ...prev }
      for (const page of sheet.pages) {
        if (!(page.id in next)) next[page.id] = page.goal_text
      }
      return next
    })
  }, [sheet])

  const handleGoalTextBlur = (pageId: string) => {
    const originalPage = sheet?.pages.find(page => page.id === pageId)
    const goalText = goalTextByPageId[pageId]
    if (!originalPage || goalText === undefined || goalText === originalPage.goal_text) return
    updatePageGoalText.mutate({ pageId, goalText })
  }

  const handleExportPdf = async () => {
    if (!sheet) return

    setIsExportingPdf(true)
    try {
      await exportDynamicGoalSheetPdf(sheet)
    } catch (error) {
      console.error('Failed to export PDF:', error)
    } finally {
      setIsExportingPdf(false)
    }
  }

  const handleAddPage = () => {
    if (!sheet) return
    addPage.mutate({ goalSheetId: sheet.id, goalText: '' })
  }

  const handleDelete = () => {
    if (!sheet) return
    deleteGoalSheet.mutate(sheet.id, {
      onSuccess: () => {
        const path = currentSchool
          ? `/school/${currentSchool.id}/speech-screening-reports/dynamic-goal-sheets`
          : '/speech-screening-reports/dynamic-goal-sheets'
        navigate(path)
      },
    })
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <LoadingSpinner size='md' />
      </div>
    )
  }

  if (!sheet) {
    return <p className='text-gray-600'>Goal sheet not found.</p>
  }

  const studentName = `${sheet.student?.first_name ?? ''} ${sheet.student?.last_name ?? ''}`.trim()

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-end gap-2'>
        <Button variant='outline' size='sm' onClick={handleExportPdf} disabled={isExportingPdf}>
          <Download className='w-4 h-4 mr-2' />
          {isExportingPdf ? 'Exporting...' : 'Export PDF'}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant='outline' size='sm' className='text-red-600'>
              <Trash2 className='w-4 h-4 mr-2' />
              Delete Sheet
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this goal sheet?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this goal sheet and all its pages. This action cannot
                be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleteGoalSheet.isPending}
                className='bg-red-600 hover:bg-red-700'>
                {deleteGoalSheet.isPending ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {sheet.pages.map(page => (
        <DynamicGoalSheetPage
          key={page.id}
          studentId={sheet.student_id}
          studentName={studentName}
          pageNumber={page.page_number}
          totalPages={sheet.pages.length}
          sessions={page.sessions}
          goalText={goalTextByPageId[page.id] ?? ''}
          onGoalTextChange={value => setGoalTextByPageId(prev => ({ ...prev, [page.id]: value }))}
          onGoalTextBlur={() => handleGoalTextBlur(page.id)}
        />
      ))}

      <div className='flex justify-center'>
        <Button
          variant='outline'
          size='icon'
          onClick={handleAddPage}
          disabled={addPage.isPending}
          className='w-12 h-12 border-2 rounded-full'
          aria-label='Add new goal sheet page'>
          <Plus className='w-6 h-6' />
        </Button>
      </div>
    </div>
  )
}

export default DynamicGoalSheetBuilder
