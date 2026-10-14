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
import { Download, Trash2 } from 'lucide-react'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useDynamicGoalSheet } from '@/hooks/goalSheets/use-dynamic-goal-sheets'
import {
  useUpdateGoalText,
  useDeleteDynamicGoalSheet,
} from '@/hooks/goalSheets/use-dynamic-goal-sheets-mutations'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import DynamicGoalSheetSessionCard from './DynamicGoalSheetSessionCard'
import { exportDynamicGoalSheetPdf } from '@/lib/exportDynamicGoalSheetPdf'
import { ReportBanner, ReportFooter } from '@/components/reports/view/shared/ReportBannerChrome'

interface DynamicGoalSheetBuilderProps {
  sheetId: string
}

const DynamicGoalSheetBuilder = ({ sheetId }: DynamicGoalSheetBuilderProps) => {
  const navigate = useNavigate()
  const { currentSchool } = useOrganization()

  const { data: sheet, isLoading } = useDynamicGoalSheet(sheetId)
  const updateGoalText = useUpdateGoalText()
  const deleteGoalSheet = useDeleteDynamicGoalSheet()

  const [goalText, setGoalText] = useState('')
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  useEffect(() => {
    if (sheet) setGoalText(sheet.goal_text)
  }, [sheet])

  const handleGoalTextBlur = () => {
    if (!sheet || goalText === sheet.goal_text) return
    updateGoalText.mutate({ id: sheet.id, goalText })
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
                This will permanently delete this goal sheet and all its sessions. This action
                cannot be undone.
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

      <section className="flex flex-col w-full max-w-4xl mx-auto overflow-hidden bg-white rounded-lg shadow-sm font-['Nunito']">
        <ReportBanner title='Goal Sheet' />

        <div className='flex-1 px-10 pt-5'>
          <p className='mb-3 font-bold text-gray-900'>
            STUDENT: {sheet.student?.first_name} {sheet.student?.last_name}
          </p>

          {sheet.sessions.map((session, index) => (
            <DynamicGoalSheetSessionCard
              key={session.id}
              session={session}
              index={index}
              goalText={goalText}
              onGoalTextChange={setGoalText}
              onGoalTextBlur={handleGoalTextBlur}
            />
          ))}
        </div>

        <ReportFooter brand='NORTHERN VOICES SPEECH SERVICES' />
      </section>
    </div>
  )
}

export default DynamicGoalSheetBuilder
