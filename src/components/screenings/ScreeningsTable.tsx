import { useState, useEffect, useMemo } from 'react'
import { ErrorPatterns } from '@/types/screening-form'
import { useNavigate } from 'react-router-dom'
import { useUpdateStudent } from '@/hooks/students/use-students-mutations'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import ScreeningsTableSkeleton from '@/components/skeletons/ScreeningsTableSkeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, ChevronUp, ChevronDown } from 'lucide-react'
import {
  ResponsiveTable,
  TableHeader,
  TableHead,
  TableBody,
} from '@/components/ui/responsive-table'
import { School, Screening, Student } from '@/types/database'
import { useScreenings, useScreeningsBySchool } from '@/hooks/screenings/use-screenings'
import {
  useDeleteScreening,
  useUpdateSpeechScreening,
} from '@/hooks/screenings/use-screening-mutations'
import { useToast } from '@/hooks/use-toast'
import { SCREENING_RESULTS } from '@/constants/screeningResults'
import { useStudentsBySchool } from '@/hooks/students/use-students'
import { useSchoolGradesBySchool } from '@/hooks/use-school-grades'
import type { SchoolGrade } from '@/api/schoolGrades'
import ScreeningBulkActions from './ScreeningBulkActions'
import ScreeningDetailsModal from '@/components/students/screening-history/ScreeningDetailsModal'
import SendReportsModal from './SendReportsModal'
import DeleteScreeningDialog from './DeleteScreeningDialog'
import ScreeningTableRow from './ScreeningTableRow'
import { useScreeningsFilter } from '@/hooks/screenings/use-screenings-filter'

interface ScreeningsTableProps {
  searchTerm: string
  resultFilter: string
  dateRangeFilter: string
  qualifiesForSpeechProgramFilter: string[]
  vocabularySupportFilter: string
  casFilter: string
  gradeFilter: string
  recommendationsFilter: string
  clinicalNotesFilter: string
  languageComprehensionFilter: string
  priorityRescreenFilter: string
  selectedScreenings: Screening[]
  setSelectedScreenings: (screenings: Screening[]) => void
  onBulkAction: (action: string) => void
  currentSchool: School | null
  deduplicateByStudent?: boolean
}

const ScreeningsTable = ({
  searchTerm,
  resultFilter,
  dateRangeFilter,
  qualifiesForSpeechProgramFilter,
  vocabularySupportFilter,
  casFilter,
  gradeFilter,
  recommendationsFilter,
  clinicalNotesFilter,
  languageComprehensionFilter,
  priorityRescreenFilter,
  selectedScreenings,
  setSelectedScreenings,
  onBulkAction,
  currentSchool,
  deduplicateByStudent,
}: ScreeningsTableProps) => {
  const [selectedScreening, setSelectedScreening] = useState<Screening | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [screeningToDelete, setScreeningToDelete] = useState<Screening | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [updatingScreeningId, setUpdatingScreeningId] = useState<string | null>(null)
  const [updatingProgramId, setUpdatingProgramId] = useState<string | null>(null)
  const [screeningToEmail, setScreeningToEmail] = useState<Screening | null>(null)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [studentsMap, setStudentsMap] = useState<Map<string, Student>>(new Map())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)

  const navigate = useNavigate()

  // If currentSchool is provided, use the school-specific query, otherwise fetch all
  const {
    data: allScreeningsData,
    isLoading: isLoadingAll,
    isFetching: isFetchingAll,
    error: errorAll,
  } = useScreenings()

  const {
    data: schoolScreeningsData,
    isLoading: isLoadingSchool,
    isFetching: isFetchingSchool,
    error: errorSchool,
  } = useScreeningsBySchool(
    currentSchool?.id,
    dateRangeFilter === 'school_year' ? 'school_year' : 'all',
    currentPage,
    pageSize
  )

  const totalCount = schoolScreeningsData?.totalCount ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  // Use mutation hooks
  const { mutate: updateSpeechScreening } = useUpdateSpeechScreening()
  const { mutate: updateStudent } = useUpdateStudent()
  const { toast } = useToast()

  // Fetch students for the school
  const { data: students = [] } = useStudentsBySchool(currentSchool?.id)

  // Fetch grades using React Query
  const { data: grades = [], isLoading: isLoadingGrades } = useSchoolGradesBySchool(
    currentSchool?.id
  )

  // Create grades map from React Query data
  const gradesMap = useMemo(() => {
    const mapping = new Map<string, SchoolGrade>()
    grades.forEach(grade => {
      mapping.set(grade.id, grade)
    })
    return mapping
  }, [grades])

  // Create students map
  useEffect(() => {
    if (!currentSchool?.id) {
      setStudentsMap(new Map())
      return
    }

    const studentsMapping = new Map<string, Student>()
    students.forEach(student => {
      studentsMapping.set(student.id, student)
    })
    setStudentsMap(studentsMapping)
  }, [currentSchool?.id, students])

  const isLoading = currentSchool ? isLoadingSchool : isLoadingAll
  const error = currentSchool ? errorSchool : errorAll

  const schoolScreenings = currentSchool
    ? (schoolScreeningsData?.screenings ?? [])
    : (allScreeningsData ?? [])

  const {
    filteredScreenings,
    sortedScreenings,
    sortField,
    sortOrder,
    handleSort,
    getScreeningGrade,
  } = useScreeningsFilter({
    screenings: schoolScreenings,
    deduplicateByStudent,
    searchTerm,
    resultFilter,
    dateRangeFilter,
    qualifiesForSpeechProgramFilter,
    vocabularySupportFilter,
    casFilter,
    gradeFilter,
    recommendationsFilter,
    clinicalNotesFilter,
    languageComprehensionFilter,
    priorityRescreenFilter,
    studentsMap,
    gradesMap,
    isLoadingGrades,
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [
    searchTerm,
    resultFilter,
    dateRangeFilter,
    gradeFilter,
    sortField,
    sortOrder,
    qualifiesForSpeechProgramFilter,
    vocabularySupportFilter,
    casFilter,
    recommendationsFilter,
    clinicalNotesFilter,
    languageComprehensionFilter,
    priorityRescreenFilter,
  ])

  const paginatedScreenings = sortedScreenings

  const getSortIcon = (field: 'date' | 'name' | 'grade') => {
    if (sortField !== field) return <ChevronUp className='w-4 h-4 opacity-30' />
    if (sortOrder === 'asc') return <ChevronUp className='w-4 h-4' />
    if (sortOrder === 'desc') return <ChevronDown className='w-4 h-4' />
    return <ChevronUp className='w-4 h-4 opacity-30' />
  }

  const getResultBadge = (result?: string) => {
    if (!result) return null

    const config = SCREENING_RESULTS[result as keyof typeof SCREENING_RESULTS]
    if (!config) return null

    return <Badge className={`${config.color} font-medium text-[10px]`}>{config.label}</Badge>
  }

  const getQualificationBadge = (screening: Screening) => {
    const metadata = screening.error_patterns?.screening_metadata
    const consent = screening.error_patterns?.consent

    // Read program status from error_patterns
    const noConsent = consent?.no_consent || false
    const graduated = metadata?.graduated || false
    const paused = metadata?.paused || false
    const sub = metadata?.sub || false
    const qualifies = metadata?.qualifies_for_speech_program || false

    if (noConsent) {
      return <Badge className='bg-red-100 text-gray-800 font-medium text-[10px]'>No Consent</Badge>
    }
    if (graduated) {
      return <Badge className='bg-blue-100 text-blue-800 font-medium text-[10px]'>Graduated</Badge>
    }
    if (paused) {
      return (
        <Badge className='bg-purple-100 text-purple-800 font-medium text-[10px]'>Pause/Away</Badge>
      )
    }
    if (sub) {
      return <Badge className='bg-orange-100 text-orange-800 font-medium text-[10px]'>Sub</Badge>
    }
    if (qualifies) {
      return <Badge className='bg-red-100 text-red-800 font-medium text-[10px]'>Qualifies</Badge>
    }

    // If none of the above, check if they explicitly don't qualify
    if (qualifies === false && !sub && !graduated && !paused && !noConsent) {
      return (
        <Badge className='bg-green-100 text-green-800 font-medium text-[10px]'>
          Not In Program
        </Badge>
      )
    }

    return <Badge className='bg-gray-100 text-gray-800 font-medium text-[10px]'>Not Set</Badge>
  }

  const getProgramValue = (screening: Screening): string => {
    const metadata = screening.error_patterns?.screening_metadata
    const consent = screening.error_patterns?.consent

    if (consent?.no_consent) return 'no_consent'
    if (metadata?.graduated) return 'graduated'
    if (metadata?.paused) return 'paused'
    if (metadata?.sub) return 'sub'
    if (metadata?.qualifies_for_speech_program) return 'qualified'
    if (metadata?.qualifies_for_speech_program === false) return 'not_in_program'

    return 'none'
  }

  const getProgramSelector = (screening: Screening) => {
    // For speech screenings, show editable dropdown
    if (screening.source_table === 'speech') {
      const isThisScreeningUpdating = updatingProgramId === screening.id

      return (
        <Select
          value={getProgramValue(screening)}
          onValueChange={value => handleProgramChange(screening, value as ProgramStatus)}
          disabled={isThisScreeningUpdating}>
          <SelectTrigger className='w-full h-8 p-0 border-none hover:bg-transparent focus:ring-0'>
            <SelectValue placeholder='Select program'>
              <div className='flex items-center gap-2'>
                {isThisScreeningUpdating && (
                  <Loader2 className='w-3 h-3 text-blue-600 animate-spin' />
                )}
                {getQualificationBadge(screening)}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {programOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    // For hearing screenings or when not editable, show badge
    return getQualificationBadge(screening)
  }

  const getResultSelector = (screening: Screening) => {
    // For speech screenings, show editable dropdown
    if (screening.source_table === 'speech') {
      const isThisScreeningUpdating = updatingScreeningId === screening.id

      return (
        <Select
          value={screening.result || ''}
          onValueChange={value => handleResultChange(screening, value)}
          disabled={isThisScreeningUpdating}>
          <SelectTrigger className='w-full h-8 p-0 border-none hover:bg-transparent focus:ring-0'>
            <SelectValue placeholder='Select result'>
              <div className='flex items-center gap-2'>
                {isThisScreeningUpdating && (
                  <Loader2 className='w-3 h-3 text-blue-600 animate-spin' />
                )}
                {screening.result ? (
                  getResultBadge(screening.result)
                ) : (
                  <Badge className='font-medium text-gray-800 bg-gray-100'>Select result</Badge>
                )}
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {resultOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }

    // For hearing screenings or when not editable, show badge
    return getResultBadge(screening.result)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedScreenings(paginatedScreenings)
    } else {
      setSelectedScreenings([])
    }
  }

  const handleSelectScreening = (screening: Screening, checked: boolean) => {
    if (checked) {
      setSelectedScreenings([...selectedScreenings, screening])
    } else {
      setSelectedScreenings(selectedScreenings.filter(s => s.id !== screening.id))
    }
  }

  const handleViewDetails = (screening: Screening) => {
    setSelectedScreening(screening)
    setIsDetailsModalOpen(true)
  }

  const handleEmailReport = (screening: Screening) => {
    setScreeningToEmail(screening)
    setIsEmailModalOpen(true)
  }

  const handleViewStudent = (screening: Screening) => {
    const student = students.find(
      s => s.id === screening.student_id || s.student_id === screening.student_id
    )

    if (!student) {
      toast({
        title: 'Error',
        description: 'Student not found',
        variant: 'destructive',
      })
      return
    }

    if (currentSchool?.id) {
      navigate(`/school/${currentSchool.id}/students/${student.id}`, {
        state: { from: 'screenings' },
      })
    } else {
      navigate(`/students/${student.id}`, {
        state: { from: 'screenings' },
      })
    }
  }

  const handleResultChange = (screening: Screening, newResult: string) => {
    if (screening.source_table === 'speech') {
      setUpdatingScreeningId(screening.id)
      updateSpeechScreening(
        {
          id: screening.id,
          data: { result: newResult },
        },
        {
          onSuccess: () => {
            setUpdatingScreeningId(null)
            toast({
              title: 'Result updated',
              description: `Successfully updated result for ${screening.student_name}`,
              variant: 'default',
            })
          },
          onError: error => {
            setUpdatingScreeningId(null)
            toast({
              title: 'Error updating result',
              description: error.message || 'Failed to update result',
              variant: 'destructive',
            })
          },
        }
      )
    } else {
      // Handle hearing screenings update here if needed
      toast({
        title: 'Not supported',
        description: 'Updating hearing screening results is not yet supported',
        variant: 'destructive',
      })
    }
  }

  type ProgramStatus =
    | 'none'
    | 'qualified'
    | 'not_in_program'
    | 'sub'
    | 'paused'
    | 'graduated'
    | 'no_consent'

  const handleProgramChange = (screening: Screening, newProgram: ProgramStatus) => {
    if (screening.source_table === 'speech') {
      setUpdatingProgramId(screening.id)

      const student = studentsMap.get(screening.student_id)

      if (!student) {
        toast({
          title: 'Error updating program qualification',
          description: 'Student not found',
          variant: 'destructive',
        })
        setUpdatingProgramId(null)
        return
      }

      // Update the screening's error_patterns.screening_metadata
      const currentErrorPatterns = screening.error_patterns || ({} as ErrorPatterns)
      const currentMetadata = currentErrorPatterns.screening_metadata || {}
      const currentConsent = currentErrorPatterns.consent || {}

      const cleanErrorPatterns: Partial<ErrorPatterns> = {
        articulation: currentErrorPatterns.articulation || ({} as ErrorPatterns['articulation']),
        add_areas_of_concern:
          currentErrorPatterns.add_areas_of_concern ||
          ({} as ErrorPatterns['add_areas_of_concern']),
        attendance: currentErrorPatterns.attendance || ({} as ErrorPatterns['attendance']),
        additional_observations: currentErrorPatterns.additional_observations || '',
        consent: {
          ...currentConsent,
          no_consent: newProgram === 'no_consent',
        },
        screening_metadata: {
          ...currentMetadata,
          qualifies_for_speech_program: newProgram === 'qualified',
          sub: newProgram === 'sub',
          graduated: newProgram === 'graduated',
          paused: newProgram === 'paused',
        } as ErrorPatterns['screening_metadata'],
      }

      // Check if this is the most recent screening for the student
      const studentScreenings = schoolScreenings.filter(
        s => s.student_id === screening.student_id && s.source_table === 'speech'
      )
      const mostRecentScreening = studentScreenings.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0]
      const isLatestScreening = mostRecentScreening?.id === screening.id

      // Update the screening first
      updateSpeechScreening(
        {
          id: screening.id,
          data: {
            error_patterns: cleanErrorPatterns as ErrorPatterns,
          },
        },
        {
          onSuccess: () => {
            // Only update the student's program_status if this is the latest screening
            if (isLatestScreening) {
              updateStudent(
                {
                  id: student.id,
                  studentData: { program_status: newProgram },
                },
                {
                  onSuccess: () => {
                    setUpdatingProgramId(null)
                    toast({
                      title: 'Program qualification updated',
                      description: `Successfully updated program qualification for ${screening.student_name}`,
                      variant: 'default',
                    })
                  },
                  onError: error => {
                    setUpdatingProgramId(null)
                    toast({
                      title: 'Warning',
                      description: 'Screening updated but failed to update student program status',
                      variant: 'destructive',
                    })
                  },
                }
              )
            } else {
              // For older screenings, just show success without updating student
              setUpdatingProgramId(null)
              toast({
                title: 'Program qualification updated',
                description: `Successfully updated program qualification for this screening (historical record)`,
                variant: 'default',
              })
            }
          },
          onError: error => {
            setUpdatingProgramId(null)
            toast({
              title: 'Error updating program qualification',
              description: error.message || 'Failed to update program status',
              variant: 'destructive',
            })
          },
        }
      )
    } else {
      // Handle hearing screenings update here if needed
      toast({
        title: 'Not supported',
        description: 'Updating hearing screening program qualification is not yet supported',
        variant: 'destructive',
      })
    }
  }

  // Define the result options
  const resultOptions = [
    { value: 'no_errors', label: 'No Errors' },
    { value: 'age_appropriate', label: 'Age Appropriate' },
    { value: 'monitor', label: 'Monitor' },
    { value: 'mild', label: 'Mild' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'severe', label: 'Severe' },
    { value: 'profound', label: 'Profound' },
    { value: 'complex_needs', label: 'Complex Needs' },
    { value: 'unable_to_screen', label: 'Non-Compliant' },
    { value: 'absent', label: 'Absent' },
    { value: 'non_registered_no_consent', label: 'No Consent' },
    // { value: 'passed', label: 'Passed' },
  ]

  // Define the program qualification options
  const programOptions = [
    { value: 'qualified', label: 'Qualifies' },
    { value: 'not_in_program', label: 'Not In Program' },
    { value: 'sub', label: 'Sub' },
    { value: 'paused', label: 'Pause/Away' },
    // { value: 'not_set', label: 'Not Set' },
    { value: 'graduated', label: 'Graduated' },
    { value: 'no_consent', label: 'Qualifies - No Consent' },
  ]

  const { mutate: deleteScreening, isPending: isDeleting } = useDeleteScreening()

  const handleDelete = (screening: Screening) => {
    setScreeningToDelete(screening)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (screeningToDelete && screeningToDelete.source_table) {
      const deletedStudentName = screeningToDelete.student_name

      setIsDeleteDialogOpen(false)
      setScreeningToDelete(null)

      deleteScreening(
        {
          id: screeningToDelete.id,
          sourceTable: screeningToDelete.source_table,
        },
        {
          onSuccess: () => {
            toast({
              title: 'Screening deleted',
              description: `Successfully deleted screening for ${deletedStudentName}`,
              variant: 'default',
            })
          },
          onError: error => {
            toast({
              title: 'Error deleting screening',
              description: error.message || 'Failed to delete screening',
              variant: 'destructive',
            })
          },
        }
      )
    } else {
      toast({
        title: 'Error',
        description: 'Cannot delete screening: source table not specified',
        variant: 'destructive',
      })
      setIsDeleteDialogOpen(false)
      setScreeningToDelete(null)
    }
  }

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false)
    setScreeningToDelete(null)
  }

  const isAllSelected =
    paginatedScreenings.length > 0 &&
    paginatedScreenings.every(s => selectedScreenings.some(sel => sel.id === s.id))
  const isSomeSelected = selectedScreenings.length > 0

  if (isLoading) {
    return <ScreeningsTableSkeleton />
  }

  // Error state
  if (error) {
    return (
      <div className='space-y-4'>
        <div className='p-8 bg-white border border-gray-200 rounded-lg'>
          <div className='text-center'>
            <p className='mb-2 text-red-600'>Error loading screenings</p>
            <p className='text-sm text-gray-500'>{error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className='space-y-4'>
        {isSomeSelected && (
          <ScreeningBulkActions
            selectedCount={selectedScreenings.length}
            selectedScreenings={selectedScreenings}
            onBulkAction={onBulkAction}
            onClearSelection={() => setSelectedScreenings([])}
          />
        )}

        <div className='flex justify-end mb-3'>
          <span className='inline-flex items-center px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full'>
            {filteredScreenings.length} screening{filteredScreenings.length !== 1 ? 's' : ''} found
          </span>
        </div>

        <div className='overflow-hidden bg-white border border-gray-200 rounded-lg'>
          <ResponsiveTable className='w-full'>
            <TableHeader>
              <tr>
                <TableHead className='w-12'>
                  <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} />
                </TableHead>
                <TableHead className='w-1/4 min-w-[200px]'>
                  <Button
                    variant='ghost'
                    onClick={() => handleSort('name')}
                    className='h-auto p-0 font-medium bg-transparent hover:bg-transparent'>
                    Student
                    <span className='ml-1'>{getSortIcon('name')}</span>
                  </Button>
                </TableHead>
                <TableHead className='w-1/6 min-w-[120px]'>Result</TableHead>
                <TableHead className='w-1/6 min-w-[120px]'>Program</TableHead>
                <TableHead className='w-1/6 min-w-[80px]'>
                  <Button
                    variant='ghost'
                    onClick={() => handleSort('grade')}
                    className='h-auto p-0 font-medium bg-transparent hover:bg-transparent'>
                    Grade
                    <span className='ml-1'>{getSortIcon('grade')}</span>
                  </Button>
                </TableHead>
                <TableHead className='w-1/6 min-w-[100px]'>
                  <Button
                    variant='ghost'
                    onClick={() => handleSort('date')}
                    className='h-auto p-0 font-medium bg-transparent hover:bg-transparent'>
                    Date
                    <span className='ml-1'>{getSortIcon('date')}</span>
                  </Button>
                </TableHead>
                <TableHead className='w-1/6 min-w-[120px] bg-gray-25/80'>Screener</TableHead>
                <TableHead className='w-12'></TableHead>
              </tr>
            </TableHeader>

            <TableBody>
              {paginatedScreenings.map(screening => (
                <ScreeningTableRow
                  key={screening.id}
                  screening={screening}
                  isSelected={selectedScreenings.some(s => s.id === screening.id)}
                  isDeleting={isDeleting}
                  onSelect={handleSelectScreening}
                  onViewDetails={handleViewDetails}
                  onViewStudent={handleViewStudent}
                  onEmailReport={handleEmailReport}
                  onDelete={handleDelete}
                  getScreeningGrade={getScreeningGrade}
                  getResultSelector={getResultSelector}
                  getProgramSelector={getProgramSelector}
                />
              ))}
            </TableBody>
          </ResponsiveTable>

          {filteredScreenings.length === 0 && (
            <div className='py-8 text-center'>
              <p className='text-gray-500'>No screenings found matching your criteria.</p>
            </div>
          )}
        </div>

        {totalCount > 0 && (
          <div className='flex items-center justify-between px-2 py-3'>
            <div className='flex items-center gap-2 text-sm text-gray-600'>
              <span>Rows per page:</span>
              <Select
                value={String(pageSize)}
                onValueChange={val => {
                  setPageSize(Number(val))
                  setCurrentPage(1)
                }}>
                <SelectTrigger className='w-20 h-8'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map(size => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='flex items-center gap-1 text-sm text-gray-600'>
              <span>
                {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalCount)} of{' '}
                {totalCount}
              </span>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}>
                <ChevronUp className='w-4 h-4 rotate-[-90deg]' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}>
                <ChevronDown className='w-4 h-4 rotate-[-90deg]' />
              </Button>
            </div>
          </div>
        )}
      </div>

      <ScreeningDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        screening={selectedScreening}
      />

      <DeleteScreeningDialog
        open={isDeleteDialogOpen}
        screening={screeningToDelete}
        isDeleting={isDeleting}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Send Reports Modal */}
      <SendReportsModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        screening={screeningToEmail}
      />
    </>
  )
}

export default ScreeningsTable
