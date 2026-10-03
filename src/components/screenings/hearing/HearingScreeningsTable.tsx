import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Checkbox } from '@/components/ui/checkbox'
import {
  ResponsiveTable,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/responsive-table'
import { useHearingScreenings } from '@/hooks/screenings/use-hearing-screenings'
import {
  useDeleteHearingScreening,
  useUpdateHearingScreening,
} from '@/hooks/screenings/use-screening-hearing-mutations'
import { Screening, Student, ServiceStatus } from '@/types/database'
import { useStudentsBySchool, useSchoolTransfers } from '@/hooks/students/use-students'
import { withDuplicateLabels } from '@/lib/student-duplicate-label'
import { useUpdateStudent } from '@/hooks/students/use-students-mutations'
import { usePauseStudent } from '@/hooks/students/use-pause-student'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import HearingScreeningDetailsModal from '@/components/students/screening-history/HearingScreeningDetailsModal'
import SendReportsModal from '@/components/screenings/SendReportsModal'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useToast } from '@/hooks/use-toast'
import ScreeningBulkActions from '@/components/screenings/ScreeningBulkActions'
import HearingScreeningsPagination from './HearingScreeningsPagination'
import HearingScreeningDeleteDialog from './HearingScreeningDeleteDialog'
import HearingScreeningTableRow from '@/components/screenings/hearing/HearingScreeningTableRow'
import ConsentFormModal from '@/components/students/ConsentFormModal'
import PauseConfirmDialog from '@/components/students/PauseConfirmDialog'
import SortControls, { SortOption } from '@/components/ui/SortControls'
import { matchesDateRangeFilter } from '@/lib/screeningDateRangeFilter'
import { useSchoolGradesBySchool } from '@/hooks/use-school-grades'
import { schoolGradesApi, type SchoolGrade } from '@/api/schoolGrades'
import { GRADE_MAPPING } from '@/constants/app'
import { getCurrentAcademicYear } from '@/lib/academicYear'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface HearingScreeningsTableProps {
  searchTerm: string
  dateRangeFilter: string
  gradeFilter: string
  resultFilter: string
  referralNotesFilter: string
  nonCompliantFilter: string
  complexNeedsFilter: string
  selectedScreenings: Screening[]
  setSelectedScreenings: (screenings: Screening[]) => void
  deduplicateFilter: boolean
}

const HearingScreeningsTable = ({
  searchTerm,
  dateRangeFilter,
  gradeFilter,
  resultFilter,
  referralNotesFilter,
  nonCompliantFilter,
  complexNeedsFilter,
  selectedScreenings,
  setSelectedScreenings,
  deduplicateFilter,
}: HearingScreeningsTableProps) => {
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)
  const [selectedScreening, setSelectedScreening] = useState<Screening | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [screeningToDelete, setScreeningToDelete] = useState<Screening | null>(null)
  const [screeningToEmail, setScreeningToEmail] = useState<Screening | null>(null)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [studentsMap, setStudentsMap] = useState<Map<string, Student>>(new Map())
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [consentStudent, setConsentStudent] = useState<Student | null>(null)
  const [updatingGradeId, setUpdatingGradeId] = useState<string | null>(null)
  const [optimisticGrade, setOptimisticGrade] = useState<{
    screeningId: string
    gradeLevel: string
  } | null>(null)

  const { currentSchool } = useOrganization()
  const { toast } = useToast()
  const navigate = useNavigate()

  // Fetch hearing screenings from backend filtered by current school
  const { data: screenings = [], isLoading } = useHearingScreenings(currentSchool?.id)

  // Fetch students for the school
  const { data: students = [] } = useStudentsBySchool(currentSchool?.id)

  const { data: schoolTransfers = [] } = useSchoolTransfers(currentSchool?.id ?? '')

  const transferStudentById = useMemo(() => {
    const map = new Map<string, (typeof schoolTransfers)[0]>()
    const sorted = [...schoolTransfers].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    sorted.forEach(transfer => {
      if (!map.has(transfer.student_id)) {
        map.set(transfer.student_id, transfer)
      }
    })

    return map
  }, [schoolTransfers])

  const studentsById = useMemo(() => {
    const map = new Map<string, Student & { duplicateLabel: string | null }>()
    withDuplicateLabels(students).forEach(student => {
      map.set(student.id, student)
      if (student.student_id) map.set(student.student_id, student)
    })

    return map
  }, [students])

  const { data: grades = [], isLoading: isLoadingGrades } = useSchoolGradesBySchool(
    currentSchool?.id
  )

  const gradesMap = useMemo(() => {
    const map = new Map<string, SchoolGrade>()
    grades.forEach(grade => {
      map.set(grade.id, grade)
    })
    return map
  }, [grades])

  const { mutate: updateStudent } = useUpdateStudent()
  const { mutate: updateHearingScreening } = useUpdateHearingScreening()

  const getScreeningGrade = (screening: Screening): string => {
    if (screening.grade) return screening.grade

    const student = studentsById.get(screening.student_id)
    if (student?.current_grade_id) {
      if (isLoadingGrades) return '...'
      const grade = gradesMap.get(student.current_grade_id)
      if (grade) return grade.grade_level
    }

    return 'N/A'
  }

  const getDisplayGrade = (screening: Screening): string => {
    if (optimisticGrade?.screeningId === screening.id) return optimisticGrade.gradeLevel
    return getScreeningGrade(screening)
  }

  const getGradeValue = (screening: Screening): string => {
    const grade = getDisplayGrade(screening)
    return grade === 'N/A' || grade === '...' ? '' : grade
  }

  const handleGradeChange = (screening: Screening, newGradeLevel: string) => {
    const student = studentsById.get(screening.student_id)

    if (!student) {
      toast({ title: 'Error updating grade', description: 'Student not found', variant: 'destructive' })
      return
    }

    setUpdatingGradeId(screening.id)
    setOptimisticGrade({ screeningId: screening.id, gradeLevel: newGradeLevel })

    schoolGradesApi
      .getOrCreateGrade(
        screening.school_id,
        newGradeLevel,
        screening.academic_year || getCurrentAcademicYear()
      )
      .then(resolvedGrade => {
        updateHearingScreening(
          { id: screening.id, data: { grade_id: resolvedGrade.id } },
          {
            onSuccess: () => {
              const studentScreenings = screenings.filter(
                s => s.student_id === screening.student_id
              )
              const mostRecentScreening = studentScreenings.sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              )[0]
              const isLatestScreening = mostRecentScreening?.id === screening.id

              if (isLatestScreening && resolvedGrade.academic_year === getCurrentAcademicYear()) {
                updateStudent(
                  { id: student.id, studentData: { current_grade_id: resolvedGrade.id } },
                  {
                    onSuccess: () => {
                      setUpdatingGradeId(null)
                      toast({
                        title: 'Grade updated',
                        description: `Successfully updated grade for ${screening.student_name}`,
                        variant: 'default',
                      })
                    },
                    onError: () => {
                      setUpdatingGradeId(null)
                      setOptimisticGrade(null)
                      toast({
                        title: 'Warning',
                        description: 'Screening updated but failed to update student grade',
                        variant: 'destructive',
                      })
                    },
                  }
                )
              } else {
                setUpdatingGradeId(null)
                toast({
                  title: 'Grade updated',
                  description: 'Successfully updated grade for this screening (historical record)',
                  variant: 'default',
                })
              }
            },
            onError: error => {
              setUpdatingGradeId(null)
              setOptimisticGrade(null)
              toast({
                title: 'Error updating grade',
                description: error.message || 'Failed to update grade',
                variant: 'destructive',
              })
            },
          }
        )
      })
      .catch(error => {
        setUpdatingGradeId(null)
        setOptimisticGrade(null)
        toast({
          title: 'Error updating grade',
          description: error.message || 'Failed to resolve grade',
          variant: 'destructive',
        })
      })
  }

  const getGradeSelector = (screening: Screening) => {
    const transferRecord = transferStudentById.get(screening.student_id)
    const isTransferredOut =
      transferRecord?.from_school_id === currentSchool?.id ||
      (!transferRecord && !!currentSchool?.id && screening.school_id !== currentSchool?.id)

    const grade = getDisplayGrade(screening)
    const isLoadingGrade = grade === '...'

    if (isTransferredOut) {
      return (
        <span className='text-xs text-gray-600'>
          {isLoadingGrade ? '' : grade === 'N/A' ? '-' : grade}
        </span>
      )
    }

    const isThisScreeningUpdating = updatingGradeId === screening.id

    return (
      <Select
        value={getGradeValue(screening) || undefined}
        onValueChange={value => handleGradeChange(screening, value)}
        disabled={isThisScreeningUpdating || isLoadingGrade}>
        <SelectTrigger className='w-auto h-6 px-1 py-0 text-xs border-none hover:bg-transparent focus:ring-0'>
          <SelectValue placeholder='Select grade'>
            <div className='flex items-center gap-1'>
              {isThisScreeningUpdating && (
                <Loader2 className='w-3 h-3 text-blue-600 animate-spin' />
              )}
              <span className='text-xs text-gray-600'>
                Grade: {isLoadingGrade ? '' : grade === 'N/A' ? 'Select grade' : grade}
              </span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {GRADE_MAPPING.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.display}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  const handleStatusChange = (screening: Screening, newStatus: ServiceStatus) => {
    const student = studentsById.get(screening.student_id)

    if (!student) {
      toast({
        title: 'Error',
        description: 'Student not found',
        variant: 'destructive',
      })
      return
    }

    updateStudent(
      { id: student.id, studentData: { service_status: newStatus === 'none' ? null : newStatus } },
      {
        onSuccess: () => toast({ title: 'Status updated' }),
        onError: () => {
          toast({
            title: 'Error updating status',
            description: 'Failed to update student status',
            variant: 'destructive',
          })
        },
      }
    )
  }

  const {
    pauseTarget: pauseConfirmScreening,
    pauseStudentName,
    pauseReason,
    setPauseReason,
    requestPause: handlePause,
    resumeItem: handleResume,
    confirmPause: handleConfirmPause,
    cancelPause: handleCancelPause,
    isSaving: isSavingPause,
  } = usePauseStudent<Screening>({
    getStudentId: screening => screening.student_id,
    getStudentName: screening => screening.student_name,
    onStatusChange: handleStatusChange,
  })

  // Delete mutation
  const deleteScreeningMutation = useDeleteHearingScreening()

  // Create students map
  useEffect(() => {
    if (!currentSchool?.id) {
      setStudentsMap(new Map())
      return
    }

    // Create students map - map by UUID only
    const studentsMapping = new Map<string, Student>()
    students.forEach(student => {
      studentsMapping.set(student.id, student)
    })
    setStudentsMap(studentsMapping)
  }, [currentSchool?.id, students])

  useEffect(() => {
    setCurrentPage(1)
  }, [
    searchTerm,
    dateRangeFilter,
    gradeFilter,
    resultFilter,
    referralNotesFilter,
    nonCompliantFilter,
    complexNeedsFilter,
    deduplicateFilter,
  ])

  const isPassedEar = (earResult: string | null | undefined) => {
    if (!earResult) return false
    return (
      earResult.startsWith('Type A ') ||
      earResult.startsWith('Type AS ') ||
      earResult.startsWith('Type AD ')
    )
  }

  // When a result filter is active, only show the latest screening per student
  const screeningsToFilter = useMemo(() => {
    if (!deduplicateFilter) return screenings

    const latestByStudent = new Map<string, Screening>()
    screenings.forEach(screening => {
      const studentId = screening.student_id
      if (!studentId) return

      const existing = latestByStudent.get(studentId)
      if (!existing || new Date(screening.created_at) > new Date(existing.created_at)) {
        latestByStudent.set(studentId, screening)
      }
    })

    return Array.from(latestByStudent.values())
  }, [screenings, deduplicateFilter])

  // Apply filters
  const filteredScreenings = screeningsToFilter.filter(screening => {
    const matchesSearch =
      screening.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      screening.screener?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesGrade = gradeFilter === 'all' || screening.grade === gradeFilter

    const matchesDateRange = matchesDateRangeFilter(new Date(screening.created_at), dateRangeFilter)

    // Result filter
    let matchesResult = true
    if (resultFilter === 'passed') {
      const rightEarPassed = isPassedEar(screening.right_ear_result)
      const leftEarPassed = isPassedEar(screening.left_ear_result)
      matchesResult = screening.result !== 'absent' && rightEarPassed && leftEarPassed
    } else if (resultFilter === 'referred') {
      const rightEarPassed = isPassedEar(screening.right_ear_result)
      const leftEarPassed = isPassedEar(screening.left_ear_result)
      matchesResult = screening.result !== 'absent' && !(rightEarPassed && leftEarPassed)
    } else if (resultFilter === 'absent') {
      matchesResult = screening.result === 'absent'
    }

    const matchesReferralNotes =
      referralNotesFilter === 'all' ||
      (referralNotesFilter === 'has_notes' &&
        screening.referral_notes &&
        screening.referral_notes.trim().length > 0)

    const matchesNonCompliant =
      nonCompliantFilter === 'all' ||
      (nonCompliantFilter === 'true' && screening.result === 'non_compliant')

    const matchesComplexNeeds =
      complexNeedsFilter === 'all' ||
      (complexNeedsFilter === 'true' && screening.result === 'complex_needs')

    return (
      matchesSearch &&
      matchesDateRange &&
      matchesGrade &&
      matchesResult &&
      matchesReferralNotes &&
      matchesNonCompliant &&
      matchesComplexNeeds
    )
  })

  // Apply sorting
  const sortedScreenings = [...filteredScreenings].sort((a, b) => {
    if (!sortField || !sortOrder) return 0

    let comparison = 0
    switch (sortField) {
      case 'date':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        break
      case 'name':
        comparison = (a.student_name || '').localeCompare(b.student_name || '')
        break
      case 'grade':
        comparison = (a.grade || '').localeCompare(b.grade || '')
        break
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })

  const totalCount = sortedScreenings.length
  const totalPages = Math.ceil(totalCount / pageSize)
  const paginatedScreenings = sortedScreenings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

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

  const handleSendReport = (screening: Screening) => {
    setScreeningToEmail(screening)
    setIsEmailModalOpen(true)
  }

  const handleViewStudent = (screening: Screening) => {
    // Find student by comparing screening.student_id with both student.id and student.student_id
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

    // Navigate using student.id (UUID)
    if (currentSchool?.id) {
      navigate(`/school/${currentSchool.id}/students/${student.id}`, {
        state: { from: 'hearing-screenings' },
      })
    } else {
      navigate(`/students/${student.id}`, {
        state: { from: 'hearing-screenings' },
      })
    }
  }

  const handleDeleteClick = (screening: Screening) => {
    setScreeningToDelete(screening)
  }

  const handleDeleteConfirm = async () => {
    if (!screeningToDelete) return

    try {
      await deleteScreeningMutation.mutateAsync(screeningToDelete.id)
      toast({
        title: 'Success',
        description: 'Hearing screening deleted successfully',
      })
      setScreeningToDelete(null)
      // Remove from selected screenings if it was selected
      setSelectedScreenings(selectedScreenings.filter(s => s.id !== screeningToDelete.id))
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete hearing screening. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleBulkAction = (action: string) => {}

  const handleDeleteCancel = () => {
    setScreeningToDelete(null)
  }

  const handleAddConsent = (screening: Screening) => {
    const student = students.find(
      student => student.id === screening.student_id || student.student_id === screening.student_id
    )

    if (!student) {
      toast({
        title: 'Error',
        description: 'Student not found',
        variant: 'destructive',
      })

      return
    }

    setConsentStudent(student)
  }

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <LoadingSpinner size='lg' />
      </div>
    )
  }

  const sortOptions: SortOption[] = [
    { label: 'Student Name', value: 'name', defaultDirection: 'asc' },
    { label: 'Grade', value: 'grade', defaultDirection: 'asc' },
    { label: 'Date', value: 'date', defaultDirection: 'desc' },
  ]

  return (
    <div className='space-y-4'>
      {selectedScreenings.length > 0 && (
        <ScreeningBulkActions
          selectedCount={selectedScreenings.length}
          selectedScreenings={selectedScreenings.map(s => ({
            ...s,
            source_table: 'hearing',
          }))}
          onBulkAction={handleBulkAction}
          onClearSelection={() => setSelectedScreenings([])}
        />
      )}

      <div className='flex items-center justify-between mb-3 gap-2 flex-wrap'>
        <SortControls
          sortField={sortField}
          setSortField={setSortField}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          options={sortOptions}
        />

        <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800'>
          {sortedScreenings.length} screening{sortedScreenings.length !== 1 ? 's' : ''} found
        </span>
      </div>

      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <ResponsiveTable>
          <TableHeader>
            <tr>
              <TableHead className='w-12'>
                <Checkbox
                  checked={
                    selectedScreenings.length === paginatedScreenings.length &&
                    paginatedScreenings.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>

              <TableHead>Student Info</TableHead>

              <TableHead className='min-w-[220px]'>Right Ear</TableHead>

              <TableHead className='min-w-[220px]'>Left Ear</TableHead>

              <TableHead className='w-[200px]'>Results</TableHead>

              {/* <TableHead>Screener</TableHead>
              <TableHead
                className='cursor-pointer hover:bg-gray-50'
                onClick={() => handleSort('date')}>
                Date
                <SortIcon field='date' />
              </TableHead> */}

              <TableHead className='text-right'></TableHead>
            </tr>
          </TableHeader>

          <TableBody>
            {paginatedScreenings.length === 0 ? (
              <tr>
                <TableCell colSpan={10} className='text-center py-8 text-gray-500'>
                  No hearing screenings found
                </TableCell>
              </tr>
            ) : (
              paginatedScreenings.map(screening => (
                <HearingScreeningTableRow
                  key={screening.id}
                  screening={screening}
                  isSelected={selectedScreenings.some(s => s.id === screening.id)}
                  onSelect={handleSelectScreening}
                  onViewDetails={handleViewDetails}
                  onViewStudent={handleViewStudent}
                  onSendReport={handleSendReport}
                  onDelete={handleDeleteClick}
                  onAddConsent={handleAddConsent}
                  onResume={handleResume}
                  onPause={handlePause}
                  getGradeSelector={getGradeSelector}
                  isPaused={studentsById.get(screening.student_id)?.service_status === 'paused'}
                  transferRecord={transferStudentById.get(screening.student_id)}
                  currentSchoolId={currentSchool?.id ?? ''}
                  duplicateLabel={studentsById.get(screening.student_id)?.duplicateLabel ?? null}
                />
              ))
            )}
          </TableBody>
        </ResponsiveTable>
      </div>

      <HearingScreeningsPagination
        currentPage={currentPage}
        totalCount={totalCount}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={size => {
          setPageSize(size)
          setCurrentPage(1)
        }}
      />

      {/* Hearing Screening Details Modal */}
      <HearingScreeningDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        screening={selectedScreening}
      />

      {/* Send Reports Modal */}
      <SendReportsModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        screening={screeningToEmail}
      />

      {/* Delete Confirmation Dialog */}
      <HearingScreeningDeleteDialog
        screening={screeningToDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {consentStudent && (
        <ConsentFormModal
          isOpen={true}
          onClose={() => setConsentStudent(null)}
          student={consentStudent}
        />
      )}

      <PauseConfirmDialog
        open={!!pauseConfirmScreening}
        studentName={pauseStudentName}
        reason={pauseReason}
        onReasonChange={setPauseReason}
        onConfirm={handleConfirmPause}
        onCancel={handleCancelPause}
        isSaving={isSavingPause}
      />
    </div>
  )
}

export default HearingScreeningsTable
