import { FileSearch } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ResultBadge } from '@/components/caseload/CaseloadBadges'
import { useSpeechScreeningsByStudent } from '@/hooks/screenings'
import { parseDateSafely } from '@/utils/dateUtils'

interface StudentScreeningSheetProps {
  studentId?: string
  studentName: string
}

const StudentScreeningSheet = ({ studentId, studentName }: StudentScreeningSheetProps) => {
  const { data: screenings = [] } = useSpeechScreeningsByStudent(studentId)
  const latestScreening = screenings[0]

  if (!studentId) return null

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant='outline' size='sm'>
          <FileSearch className='w-4 h-4 mr-2' />
          View Screening
        </Button>
      </SheetTrigger>

      <SheetContent className='w-full overflow-y-auto sm:max-w-xl'>
        <SheetHeader>
          <SheetTitle>Speech Screening - {studentName}</SheetTitle>
        </SheetHeader>

        {!latestScreening ? (
          <p className='mt-4 text-sm text-gray-500'>No speech screening on record.</p>
        ) : (
          <div className='mt-4 space-y-4'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-600'>
                {format(parseDateSafely(latestScreening.created_at), 'MMM d, yyyy')}
              </span>
              <ResultBadge result={latestScreening.result} />
            </div>

            {!!latestScreening.error_patterns?.articulation?.soundErrors?.length && (
              <div className='space-y-2'>
                <h4 className='text-sm font-medium text-gray-900'>Sounds in Error</h4>
                <div className='flex flex-wrap gap-2'>
                  {latestScreening.error_patterns.articulation.soundErrors.map(
                    (soundError, index) => (
                      <Badge key={index} variant='outline'>
                        {soundError.sound}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            )}

            {latestScreening.clinical_notes && (
              <div className='space-y-1'>
                <h4 className='text-sm font-medium text-gray-900'>Clinical Notes</h4>
                <p className='p-3 text-sm text-gray-700 rounded-md bg-gray-50'>
                  {latestScreening.clinical_notes}
                </p>
              </div>
            )}

            {latestScreening.progress_notes && (
              <div className='space-y-1'>
                <h4 className='text-sm font-medium text-gray-900'>Progress Notes</h4>
                <p className='p-3 text-sm text-gray-700 rounded-md bg-gray-50'>
                  {latestScreening.progress_notes}
                </p>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default StudentScreeningSheet
