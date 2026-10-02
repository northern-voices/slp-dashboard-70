import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Student } from '@/types/database'
import { LastScreeningInfo } from '@/api/students'
import { formatScreeningInfo } from '@/lib/student-duplicate-label'

interface ExistingStudentMatchesProps {
  matches: Array<Student & { duplicateLabel: string | null }>
  screeningInfo: Record<string, LastScreeningInfo>
  firstName: string
  lastName: string
  onSelectExisting: (student: Student) => void
  onCreateNewAnyway: () => void
}

const ExistingStudentMatches = ({
  matches,
  screeningInfo,
  firstName,
  lastName,
  onSelectExisting,
  onCreateNewAnyway,
}: ExistingStudentMatchesProps) => {
  return (
    <div className='space-y-3'>
      <p className='text-sm text-muted-foreground'>
        {matches.length === 1 ? 'A student' : `${matches.length} students`} named "{firstName}{' '}
        {lastName}" already {matches.length === 1 ? 'exists' : 'exist'} at this school. Make sure
        you're selecting the right profile before adding a new screening.
      </p>

      {matches.map(student => (
        <Card key={student.id} className='p-3 flex items-center justify-between'>
          <div>
            <p className='font-medium'>
              {student.first_name} {student.last_name}
              {student.duplicateLabel && (
                <span className='text-muted-foreground'> ({student.duplicateLabel})</span>
              )}
            </p>
            <p className='text-sm text-muted-foreground'>
              {formatScreeningInfo(screeningInfo[student.id])}
            </p>
          </div>
          <Button type='button' size='sm' onClick={() => onSelectExisting(student)}>
            Select this student
          </Button>
        </Card>
      ))}

      <Button type='button' variant='outline' className='w-full' onClick={onCreateNewAnyway}>
        This is a different student — Create New Profile
      </Button>
    </div>
  )
}

export default ExistingStudentMatches
