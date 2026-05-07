import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronUp, ChevronDown } from 'lucide-react'
import {
  ResponsiveTable,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/responsive-table'
import { useHearingScreenings } from '@/hooks/screenings/use-hearing-screenings'
import { useDeleteHearingScreening } from '@/hooks/screenings/use-screening-hearing-mutations'
import { Screening, Student } from '@/types/database'
import { useStudentsBySchool } from '@/hooks/students/use-students'
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
  const [sortField, setSortField] = useState<'date' | 'name' | 'grade' | null>(null)
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

  const { currentSchool } = useOrganization()
  const { toast } = useToast()
  const navigate = useNavigate()

  // Fetch hearing screenings from backend filtered by current school
  const { data: screenings = [], isLoading } = useHearingScreenings(currentSchool?.id)

  // Fetch students for the school
  const { data: students = [] } = useStudentsBySchool(currentSchool?.id)

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

    const matchesDateRange = (() => {
      if (dateRangeFilter === 'all') return true

      const screeningDate = new Date(screening.created_at)
      const now = new Date()

      if (dateRangeFilter === 'today') {
        return screeningDate.toDateString() === now.toDateString()
      }

      if (dateRangeFilter === 'week') {
        const weekAgo = new Date(now)
        weekAgo.setDate(now.getDate() - 7)
        return screeningDate >= weekAgo
      }

      if (dateRangeFilter === 'month') {
        return (
          screeningDate.getMonth() === now.getMonth() &&
          screeningDate.getFullYear() === now.getFullYear()
        )
      }
      if (dateRangeFilter === 'quarter') {
        const quarterAgo = new Date(now)
        quarterAgo.setMonth(now.getMonth() - 3)
        return screeningDate >= quarterAgo
      }
      if (dateRangeFilter === 'school_year') {
        const currentMonth = now.getMonth()
        const currentYear = now.getFullYear()
        const schoolYearStart =
          currentMonth >= 8 ? new Date(currentYear, 8, 1) : new Date(currentYear - 1, 8, 1)
        return screeningDate >= schoolYearStart
      }
      return true
    })()

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

  const handleSort = (field: 'date' | 'name' | 'grade') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : sortOrder === 'desc' ? null : 'asc')
      if (sortOrder === 'desc') {
        setSortField(null)
      }
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
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

  const SortIcon = ({ field }: { field: 'date' | 'name' | 'grade' }) => {
    if (sortField !== field) return null
    return sortOrder === 'asc' ? (
      <ChevronUp className='w-4 h-4 inline ml-1' />
    ) : (
      <ChevronDown className='w-4 h-4 inline ml-1' />
    )
  }

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <LoadingSpinner size='lg' />
      </div>
    )
  }

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

      <div className='flex justify-end mb-3'>
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
              <TableHead
                className='cursor-pointer hover:bg-gray-50'
                onClick={() => handleSort('name')}>
                Student Info
                <SortIcon field='name' />
              </TableHead>
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
    </div>
  )
}

export default HearingScreeningsTable
