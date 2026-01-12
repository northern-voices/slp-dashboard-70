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
  ResponsiveTable,
  ResponsiveTableRow,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/responsive-table'
import { format } from 'date-fns'
import { useHearingScreenings } from '@/hooks/screenings/use-hearing-screenings'
import { useDeleteHearingScreening } from '@/hooks/screenings/use-screening-hearing-mutations'
import { Screening, Student } from '@/types/database'
import { useStudentsBySchool } from '@/hooks/students/use-students'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import HearingScreeningDetailsModal from '@/components/students/screening-history/HearingScreeningDetailsModal'
import SendReportsModal from '@/components/screenings/SendReportsModal'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useToast } from '@/hooks/use-toast'

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

  const isPassedEar = (earResult: string | null | undefined) => {
    if (!earResult) return false
    return (
      earResult.startsWith('Type A ') ||
      earResult.startsWith('Type AS ') ||
      earResult.startsWith('Type AD ')
    )
  }

  // Apply filters
  const filteredScreenings = screenings.filter(screening => {
    const matchesSearch =
      screening.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      screening.screener?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesGrade = gradeFilter === 'all' || screening.grade === gradeFilter

    // Result filter - updated logic
    let matchesResult = true
    if (resultFilter === 'passed') {
      // Passed = both ears have Type A, AS, or AD
      const rightEarPassed = isPassedEar(screening.right_ear_result)
      const leftEarPassed = isPassedEar(screening.left_ear_result)
      matchesResult = screening.result !== 'absent' && rightEarPassed && leftEarPassed
    } else if (resultFilter === 'referred') {
      // Referred = not absent and doesn't meet passed criteria
      const rightEarPassed = isPassedEar(screening.right_ear_result)
      const leftEarPassed = isPassedEar(screening.left_ear_result)
      matchesResult = screening.result !== 'absent' && !(rightEarPassed && leftEarPassed)
    } else if (resultFilter === 'absent') {
      matchesResult = screening.result === 'absent'
    }

    // Referral notes filter
    const matchesReferralNotes =
      referralNotesFilter === 'all' ||
      (referralNotesFilter === 'has_notes' &&
        screening.referral_notes &&
        screening.referral_notes.trim().length > 0)

    // Non-compliant filter
    const matchesNonCompliant =
      nonCompliantFilter === 'all' ||
      (nonCompliantFilter === 'true' && screening.result === 'non_compliant')

    // Complex needs filter
    const matchesComplexNeeds =
      complexNeedsFilter === 'all' ||
      (complexNeedsFilter === 'true' && screening.result === 'complex_needs')

    return (
      matchesSearch &&
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
      setSelectedScreenings(sortedScreenings)
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
    unit: string
  ) => {
    if (result === 'Immeasurable' || value === null || value === undefined) {
      return 'Immeasurable'
    }
    return `${value} ${unit}`
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
                    selectedScreenings.length === sortedScreenings.length &&
                    sortedScreenings.length > 0
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
            {sortedScreenings.length === 0 ? (
              <tr>
                <TableCell colSpan={10} className='text-center py-8 text-gray-500'>
                  No hearing screenings found
                </TableCell>
              </tr>
            ) : (
              sortedScreenings.map(screening => (
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
                              'ml'
                            )}
                          </span>
                        </div>
                        <div className='h-6 w-px bg-gray-300 mx-3'></div>
                        <div className='flex-1'>
                          <Badge
                            className={`text-xs ${getResultBadgeColor(
                              screening.right_ear_volume_result
                            )}`}>
                            {screening.right_ear_volume_result || '-'}
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
                              'ml'
                            )}
                          </span>
                        </div>
                        <div className='h-6 w-px bg-gray-300 mx-3'></div>
                        <div className='flex-1'>
                          <Badge
                            className={`text-xs ${getResultBadgeColor(
                              screening.right_ear_compliance_result
                            )}`}>
                            {screening.right_ear_compliance_result || '-'}
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
                              'daPa'
                            )}
                          </span>
                        </div>
                        <div className='h-6 w-px bg-gray-300 mx-3'></div>
                        <div className='flex-1'>
                          <Badge
                            className={`text-xs ${getResultBadgeColor(
                              screening.right_ear_pressure_result
                            )}`}>
                            {screening.right_ear_pressure_result || '-'}
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
                              'ml'
                            )}
                          </span>
                        </div>
                        <div className='h-6 w-px bg-gray-300 mx-3'></div>
                        <div className='flex-1'>
                          <Badge
                            className={`text-xs ${getResultBadgeColor(
                              screening.left_ear_volume_result
                            )}`}>
                            {screening.left_ear_volume_result || '-'}
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
                              'ml'
                            )}
                          </span>
                        </div>
                        <div className='h-6 w-px bg-gray-300 mx-3'></div>
                        <div className='flex-1'>
                          <Badge
                            className={`text-xs ${getResultBadgeColor(
                              screening.left_ear_compliance_result
                            )}`}>
                            {screening.left_ear_compliance_result || '-'}
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
                              'daPa'
                            )}
                          </span>
                        </div>
                        <div className='h-6 w-px bg-gray-300 mx-3'></div>
                        <div className='flex-1'>
                          <Badge
                            className={`text-xs ${getResultBadgeColor(
                              screening.left_ear_pressure_result
                            )}`}>
                            {screening.left_ear_pressure_result || '-'}
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
