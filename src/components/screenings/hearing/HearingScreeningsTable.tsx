import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, Mail, Trash2, MoreHorizontal, ChevronUp, ChevronDown, User } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ResponsiveTable,
  ResponsiveTableRow,
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
    if (resultFilter === 'all') return screenings

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
  }, [screenings, resultFilter])

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

  const formatValue = (
    value: number | null | undefined,
    result: string | null | undefined,
    unit: string,
    screeningResult?: string | null
  ) => {
    if (screeningResult === 'absent' || screeningResult === 'non_compliant') return 'N/A'
    if (result === 'Immeasurable') return 'Immeasurable'
    if (value === null || value === undefined) return 'N/A'
    return `${value} ${unit}`
  }

  const formatResultBadge = (
    result: string | null | undefined,
    screeningResult?: string | null
  ): string => {
    if (screeningResult === 'absent' || screeningResult === 'non_compliant') return 'N/A'
    return result || '-'
  }

  const getResultBadgeVariant = (result: string | null | undefined) => {
    if (!result || result === '-') return 'secondary'
    const normalizedResult = result.toLowerCase()
    if (normalizedResult === 'normal') return 'default'
    if (normalizedResult === 'high' || normalizedResult === 'low') return 'outline'
    if (normalizedResult === 'immeasurable') return 'secondary'
    return 'secondary'
  }

  const getResultBadgeColor = (result: string | null | undefined) => {
    if (!result || result === '-') return ''
    const normalizedResult = result.toLowerCase()
    if (normalizedResult === 'normal') return 'bg-green-100 text-green-800 border-green-200'
    if (normalizedResult === 'high' || normalizedResult === 'low')
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    if (normalizedResult === 'immeasurable') return 'bg-gray-100 text-gray-600 border-gray-200'
    return 'bg-gray-100 text-gray-600 border-gray-200'
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
                <ResponsiveTableRow key={screening.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedScreenings.some(s => s.id === screening.id)}
                      onCheckedChange={checked =>
                        handleSelectScreening(screening, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className='py-4'>
                    <div className='space-y-1'>
                      <div className='font-semibold text-sm text-gray-900'>
                        {screening.student_name || 'Unknown Student'}
                      </div>
                      <div className='text-xs text-gray-600'>Grade: {screening.grade || 'N/A'}</div>
                      {screening.result && (
                        <Badge variant='secondary' className='text-xs mt-1'>
                          {screening.result === 'absent' && 'Absent'}
                          {screening.result === 'non_compliant' && 'Non Compliant'}
                          {screening.result === 'complex_needs' && 'Complex Needs'}
                          {screening.result === 'results_uncertain' && 'Results Uncertain'}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='py-4 px-4'>
                    <div className='space-y-0 divide-y divide-gray-200'>
                      <div className='flex items-center py-2'>
                        <div className='flex items-center gap-2 flex-1'>
                          <span className='text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded'>
                            Vol
                          </span>
                          <span className='text-sm font-semibold text-gray-900'>
                            {formatValue(
                              screening.right_volume_db,
                              screening.right_ear_volume_result,
                              'ml',
                              screening.result
                            )}
                          </span>
                        </div>
                        <div className='h-6 w-px bg-gray-300 mx-3'></div>
                        <div className='flex-1'>
                          <Badge
                            className={`text-xs ${getResultBadgeColor(
                              screening.right_ear_volume_result
                            )}`}>
                            {formatResultBadge(screening.right_ear_volume_result, screening.result)}
                          </Badge>
                        </div>
                      </div>

                      <div className='flex items-center py-2'>
                        <div className='flex items-center gap-2 flex-1'>
                          <span className='text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded'>
                            Comp
                          </span>
                          <span className='text-sm font-semibold text-gray-900'>
                            {formatValue(
                              screening.right_compliance,
                              screening.right_ear_compliance_result,
                              'ml',
                              screening.result
                            )}
                          </span>
                        </div>
                        <div className='h-6 w-px bg-gray-300 mx-3'></div>
                        <div className='flex-1'>
                          <Badge
                            className={`text-xs ${getResultBadgeColor(
                              screening.right_ear_compliance_result
                            )}`}>
                            {formatResultBadge(
                              screening.right_ear_compliance_result,
                              screening.result
                            )}
                          </Badge>
                        </div>
                      </div>

                      <div className='flex items-center py-2'>
                        <div className='flex items-center gap-2 flex-1'>
                          <span className='text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded'>
                            Press
                          </span>
                          <span className='text-sm font-semibold text-gray-900'>
                            {formatValue(
                              screening.right_pressure,
                              screening.right_ear_pressure_result,
                              'daPa',
                              screening.result
                            )}
                          </span>
                        </div>
                        <div className='h-6 w-px bg-gray-300 mx-3'></div>
                        <div className='flex-1'>
                          <Badge
                            className={`text-xs ${getResultBadgeColor(
                              screening.right_ear_pressure_result
                            )}`}>
                            {formatResultBadge(
                              screening.right_ear_pressure_result,
                              screening.result
                            )}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='py-4 px-4'>
                    <div className='space-y-0 divide-y divide-gray-200'>
                      <div className='flex items-center py-2'>
                        <div className='flex items-center gap-2 flex-1'>
                          <span className='text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded'>
                            Vol
                          </span>
                          <span className='text-sm font-semibold text-gray-900'>
                            {formatValue(
                              screening.left_volume_db,
                              screening.left_ear_volume_result,
                              'ml',
                              screening.result
                            )}
                          </span>
                        </div>
                        <div className='h-6 w-px bg-gray-300 mx-3'></div>
                        <div className='flex-1'>
                          <Badge
                            className={`text-xs ${getResultBadgeColor(
                              screening.left_ear_volume_result
                            )}`}>
                            {formatResultBadge(screening.left_ear_volume_result, screening.result)}
                          </Badge>
                        </div>
                      </div>

                      <div className='flex items-center py-2'>
                        <div className='flex items-center gap-2 flex-1'>
                          <span className='text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded'>
                            Comp
                          </span>
                          <span className='text-sm font-semibold text-gray-900'>
                            {formatValue(
                              screening.left_compliance,
                              screening.left_ear_compliance_result,
                              'ml',
                              screening.result
                            )}
                          </span>
                        </div>
                        <div className='h-6 w-px bg-gray-300 mx-3'></div>
                        <div className='flex-1'>
                          <Badge
                            className={`text-xs ${getResultBadgeColor(
                              screening.left_ear_compliance_result
                            )}`}>
                            {formatResultBadge(
                              screening.left_ear_compliance_result,
                              screening.result
                            )}
                          </Badge>
                        </div>
                      </div>

                      <div className='flex items-center py-2'>
                        <div className='flex items-center gap-2 flex-1'>
                          <span className='text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded'>
                            Press
                          </span>
                          <span className='text-sm font-semibold text-gray-900'>
                            {formatValue(
                              screening.left_pressure,
                              screening.left_ear_pressure_result,
                              'daPa',
                              screening.result
                            )}
                          </span>
                        </div>
                        <div className='h-6 w-px bg-gray-300 mx-3'></div>
                        <div className='flex-1'>
                          <Badge
                            className={`text-xs ${getResultBadgeColor(
                              screening.left_ear_pressure_result
                            )}`}>
                            {formatResultBadge(
                              screening.left_ear_pressure_result,
                              screening.result
                            )}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='py-4 px-3'>
                    <div className='space-y-3'>
                      {/* Right Ear Result */}
                      <div className='border-l-2 border-gray-300 pl-2 py-1'>
                        <div className='flex items-center gap-1.5 mb-1'>
                          <span className='text-xs font-semibold text-gray-700'>R</span>
                          <span className='text-xs text-gray-500'>Right</span>
                        </div>
                        <div className='text-xs text-gray-600 leading-relaxed'>
                          {screening.right_ear_result || '-'}
                        </div>
                      </div>
                      {/* Left Ear Result */}
                      <div className='border-l-2 border-gray-300 pl-2 py-1'>
                        <div className='flex items-center gap-1.5 mb-1'>
                          <span className='text-xs font-semibold text-gray-700'>L</span>
                          <span className='text-xs text-gray-500'>Left</span>
                        </div>
                        <div className='text-xs text-gray-600 leading-relaxed'>
                          {screening.left_ear_result || '-'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  {/* <TableCell>{screening.screener || 'Unknown Screener'}</TableCell>
                  <TableCell>{format(new Date(screening.created_at), 'MMM d, yyyy')}</TableCell> */}
                  <TableCell className='text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='sm'>
                          <MoreHorizontal className='w-4 h-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => handleViewDetails(screening)}>
                          <Eye className='w-4 h-4 mr-2' />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewStudent(screening)}>
                          <User className='w-4 h-4 mr-2' />
                          View Student
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSendReport(screening)}>
                          <Mail className='w-4 h-4 mr-2' />
                          Send Report
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='text-red-600'
                          onClick={() => handleDeleteClick(screening)}>
                          <Trash2 className='w-4 h-4 mr-2' />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </ResponsiveTableRow>
              ))
            )}
          </TableBody>
        </ResponsiveTable>
      </div>

      {totalCount > 0 && totalPages > 1 && (
        <div className='flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-white rounded-b-lg'>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-gray-600'>Rows per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={val => {
                setPageSize(Number(val))
                setCurrentPage(1)
              }}>
              <SelectTrigger className='w-[70px] h-8'>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value='25'>25</SelectItem>
                <SelectItem value='50'>50</SelectItem>
                <SelectItem value='100'>100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='flex items-center gap-4'>
            <span className='text-sm text-gray-600'>
              {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalCount)} of{' '}
              {totalCount}
            </span>

            <div className='flex gap-1'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}>
                Previous
              </Button>

              <Button
                variant='outline'
                size='sm'
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}>
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

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
      <AlertDialog open={!!screeningToDelete} onOpenChange={handleDeleteCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hearing Screening</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the hearing screening for{' '}
              <strong>{screeningToDelete?.student_name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className='bg-red-600 hover:bg-red-700'>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default HearingScreeningsTable
