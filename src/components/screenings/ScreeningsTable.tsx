import React, { useState } from 'react'
import { useUpdateStudent } from '@/hooks/students/use-students-mutations'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Eye,
  Download,
  Trash2,
  MoreHorizontal,
  Loader2,
  ChevronUp,
  ChevronDown,
  Mail,
  Plus,
  List,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ResponsiveTable,
  ResponsiveTableRow,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/responsive-table'
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
import { format } from 'date-fns'
import { parseDateSafely } from '@/utils/dateUtils'
import ScreeningBulkActions from './ScreeningBulkActions'
import ScreeningDetailsModal from '@/components/students/screening-history/ScreeningDetailsModal'
import SendReportsModal from './SendReportsModal'
import { School, Screening } from '@/types/database'
import { useScreenings, useScreeningsBySchool } from '@/hooks/screenings/use-screenings'
import {
  useDeleteScreening,
  useUpdateSpeechScreening,
} from '@/hooks/screenings/use-screening-mutations'
import { useToast } from '@/hooks/use-toast'
import { SCREENING_RESULTS } from '@/constants/screeningResults'

interface ScreeningsTableProps {
  searchTerm: string
  resultFilter: string
  dateRangeFilter: string
  qualifiesForSpeechProgramFilter: string
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
}: ScreeningsTableProps) => {
  const [selectedScreening, setSelectedScreening] = useState<Screening | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [sortField, setSortField] = useState<'date' | 'name' | 'grade' | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)
  const [screeningToDelete, setScreeningToDelete] = useState<Screening | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [updatingScreeningId, setUpdatingScreeningId] = useState<string | null>(null)
  const [updatingProgramId, setUpdatingProgramId] = useState<string | null>(null)
  const [screeningToEmail, setScreeningToEmail] = useState<Screening | null>(null)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)

  // Use React Query to fetch screenings data
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
    dateRangeFilter === 'school_year' ? 'school_year' : 'all'
  )

  // Use mutation hooks
  const { mutate: updateSpeechScreening, isPending: isUpdating } = useUpdateSpeechScreening()
  const { mutate: updateStudent } = useUpdateStudent()
  const { toast } = useToast()

  // Determine which data to use based on whether a school is selected
  const allScreenings = currentSchool ? schoolScreeningsData : allScreeningsData
  const isLoading = currentSchool ? isLoadingSchool : isLoadingAll
  const isFetching = currentSchool ? isFetchingSchool : isFetchingAll
  const error = currentSchool ? errorSchool : errorAll

  // No need to filter anymore since we're fetching school-specific data
  const schoolScreenings = allScreenings || []

  // Apply all filters
  const filteredScreenings = schoolScreenings.filter(screening => {
    const matchesSearch =
      screening.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      screening.screener?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesResult =
      resultFilter === 'all' ||
      screening.result === resultFilter ||
      screening.screening_result === resultFilter

    // Apply date range filter
    let matchesDateRange = true
    if (dateRangeFilter !== 'all') {
      const screeningDate = new Date(screening.created_at)
      const now = new Date()

      switch (dateRangeFilter) {
        case 'today': {
          // Compare local dates
          const screeningLocalDate = screeningDate.toLocaleDateString()
          const nowLocalDate = now.toLocaleDateString()
          matchesDateRange = screeningLocalDate === nowLocalDate
          break
        }
        case 'week': {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          matchesDateRange = screeningDate >= weekAgo
          break
        }
        case 'month': {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          matchesDateRange = screeningDate >= monthAgo
          break
        }
        case 'quarter': {
          const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          matchesDateRange = screeningDate >= quarterAgo
          break
        }
        case 'school_year': {
          // School year starts September 1st
          const currentDate = new Date()
          const currentYear = currentDate.getFullYear()
          const currentMonth = currentDate.getMonth() // 0-indexed (September = 8)

          // Determine the start of the current school year
          let schoolYearStart: Date
          if (currentMonth >= 8) {
            // September or later
            schoolYearStart = new Date(currentYear, 8, 1) // September 1st of current year
          } else {
            schoolYearStart = new Date(currentYear - 1, 8, 1) // September 1st of previous year
          }

          matchesDateRange = screeningDate >= schoolYearStart
          break
        }
      }
    }

    // Apply qualifies for speech program filter
    let matchesQualifiesForSpeechProgram = true
    if (qualifiesForSpeechProgramFilter !== 'all') {
      const programStatus = screening.program_status

      if (qualifiesForSpeechProgramFilter === 'qualified') {
        matchesQualifiesForSpeechProgram = programStatus === 'qualified'
      } else if (qualifiesForSpeechProgramFilter === 'not_in_program') {
        matchesQualifiesForSpeechProgram = programStatus === 'not_in_program'
      } else if (qualifiesForSpeechProgramFilter === 'sub') {
        matchesQualifiesForSpeechProgram = programStatus === 'sub'
      } else if (qualifiesForSpeechProgramFilter === 'paused') {
        matchesQualifiesForSpeechProgram = programStatus === 'paused'
      } else if (qualifiesForSpeechProgramFilter === 'graduated') {
        matchesQualifiesForSpeechProgram = programStatus === 'graduated'
      }
    }

    // Apply grade filter
    let matchesGrade = true
    if (gradeFilter !== 'all') {
      matchesGrade = screening.grade === gradeFilter
    }

    // Apply vocabulary support filter
    let matchesVocabularySupport = true
    if (vocabularySupportFilter !== 'all') {
      const vocabularySupport = screening.vocabulary_support
      matchesVocabularySupport = vocabularySupport === (vocabularySupportFilter === 'true')
    }

    // Apply CAS filter
    let matchesCAS = true
    if (casFilter !== 'all') {
      const suspectedCAS = screening.error_patterns?.add_areas_of_concern?.suspected_cas
      if (casFilter === 'has_text') {
        matchesCAS = suspectedCAS !== null && suspectedCAS !== undefined && suspectedCAS !== ''
      } else if (casFilter === 'no_text') {
        matchesCAS =
          !suspectedCAS ||
          suspectedCAS === null ||
          suspectedCAS === undefined ||
          suspectedCAS === ''
      }
    }

    // Apply language comprehension filter
    let matchesLanguageComprehension = true
    if (languageComprehensionFilter !== 'all') {
      const languageComprehension =
        screening.error_patterns?.add_areas_of_concern?.language_comprehension
      if (languageComprehensionFilter === 'concern') {
        matchesLanguageComprehension =
          languageComprehension !== null &&
          languageComprehension !== undefined &&
          languageComprehension !== ''
      } else if (languageComprehensionFilter === 'no_concern') {
        matchesLanguageComprehension =
          !languageComprehension ||
          languageComprehension === null ||
          languageComprehension === undefined ||
          languageComprehension === ''
      }
    }

    // Apply priority rescreen filter
    let matchesPriorityRescreen = true
    if (priorityRescreenFilter !== 'all') {
      const priorityRescreen = screening.error_patterns?.attendance?.priority_re_screen
      if (priorityRescreenFilter === 'true') {
        matchesPriorityRescreen = priorityRescreen === true
      } else if (priorityRescreenFilter === 'false') {
        matchesPriorityRescreen =
          priorityRescreen === false || priorityRescreen === null || priorityRescreen === undefined
      }
    }

    // Apply recommendations filter
    let matchesRecommendations = true
    if (recommendationsFilter !== 'all') {
      const hasReferralNotes = screening.referral_notes && screening.referral_notes.trim() !== ''

      if (recommendationsFilter === 'has_referral_notes') {
        matchesRecommendations = hasReferralNotes
      } else if (recommendationsFilter === 'no_referral_notes') {
        matchesRecommendations = !hasReferralNotes
      }
    }

    // Apply clinical notes filter
    let matchesClinicalNotes = true
    if (clinicalNotesFilter !== 'all') {
      const hasClinicalNotes = screening.clinical_notes && screening.clinical_notes.trim() !== ''
      if (clinicalNotesFilter === 'has_notes') {
        matchesClinicalNotes = hasClinicalNotes
      } else if (clinicalNotesFilter === 'no_notes') {
        matchesClinicalNotes = !hasClinicalNotes
      }
    }

    return (
      matchesSearch &&
      matchesResult &&
      matchesDateRange &&
      matchesQualifiesForSpeechProgram &&
      matchesGrade &&
      matchesVocabularySupport &&
      matchesCAS &&
      matchesLanguageComprehension &&
      matchesPriorityRescreen &&
      matchesRecommendations &&
      matchesClinicalNotes
    )
  })

  // Sort screenings by field
  const sortedScreenings = [...filteredScreenings].sort((a, b) => {
    if (!sortOrder || !sortField) return 0

    let comparison = 0

    switch (sortField) {
      case 'date': {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        comparison = dateA - dateB
        break
      }
      case 'name': {
        comparison = (a.student_name || '').localeCompare(b.student_name || '')
        break
      }
      case 'grade': {
        const gradeA = a.grade || ''
        const gradeB = b.grade || ''
        comparison = gradeA.localeCompare(gradeB)
        break
      }
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })

  const handleSort = (field: 'date' | 'name' | 'grade') => {
    if (sortField !== field) {
      setSortField(field)
      setSortOrder('desc')
    } else if (sortOrder === 'desc') {
      setSortOrder('asc')
    } else if (sortOrder === 'asc') {
      setSortField(null)
      setSortOrder(null)
    }
  }

  const getSortIcon = (field: 'date' | 'name' | 'grade') => {
    if (sortField !== field) {
      return <ChevronUp className='w-4 h-4 opacity-30' />
    }
    if (sortOrder === 'asc') {
      return <ChevronUp className='w-4 h-4' />
    } else if (sortOrder === 'desc') {
      return <ChevronDown className='w-4 h-4' />
    }
    return <ChevronUp className='w-4 h-4 opacity-30' />
  }

  const getResultBadge = (result?: string) => {
    if (!result) return null

    const config = SCREENING_RESULTS[result as keyof typeof SCREENING_RESULTS]
    if (!config) return null

    return <Badge className={`${config.color} font-medium text-[10px]`}>{config.label}</Badge>
  }

  const getQualificationBadge = (screening: Screening) => {
    const programStatus = screening.program_status
    const noConsent = screening.result === 'non_registered_no_consent'

    if (noConsent) {
      return <Badge className='bg-gray-100 text-gray-800 font-medium text-[10px]'>No Consent</Badge>
    }

    switch (programStatus) {
      case 'graduated':
        return (
          <Badge className='bg-blue-100 text-blue-800 font-medium text-[10px]'>Graduated</Badge>
        )
      case 'paused':
        return (
          <Badge className='bg-purple-100 text-purple-800 font-medium text-[10px]'>Pause</Badge>
        )
      case 'sub':
        return <Badge className='bg-orange-100 text-orange-800 font-medium text-[10px]'>Sub</Badge>
      case 'qualified':
        return <Badge className='bg-red-100 text-red-800 font-medium text-[10px]'>Qualifies</Badge>
      case 'not_in_program':
        return (
          <Badge className='bg-green-100 text-green-800 font-medium text-[10px]'>
            Not In Program
          </Badge>
        )
      case 'none':
      default:
        return <Badge className='bg-gray-100 text-gray-800 font-medium text-[10px]'>Not Set</Badge>
    }
  }

  const getProgramValue = (screening: Screening): string => {
    return screening.program_status || 'none'
  }

  const getProgramSelector = (screening: Screening) => {
    // For speech screenings, show editable dropdown
    if (screening.source_table === 'speech') {
      const isThisScreeningUpdating = updatingProgramId === screening.id
      const noConsent = screening.result === 'non_registered_no_consent'

      // Don't allow editing if the result is "No Consent"
      if (noConsent) {
        return getQualificationBadge(screening)
      }

      return (
        <Select
          value={getProgramValue(screening)}
          onValueChange={value => handleProgramChange(screening, value as ProgramStatus)}
          disabled={isThisScreeningUpdating}>
          <SelectTrigger className='w-full h-8 border-none p-0 hover:bg-transparent focus:ring-0'>
            <SelectValue placeholder='Select program'>
              <div className='flex items-center gap-2'>
                {isThisScreeningUpdating && (
                  <Loader2 className='w-3 h-3 animate-spin text-blue-600' />
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
          <SelectTrigger className='w-full h-8 border-none p-0 hover:bg-transparent focus:ring-0'>
            <SelectValue placeholder='Select result'>
              <div className='flex items-center gap-2'>
                {isThisScreeningUpdating && (
                  <Loader2 className='w-3 h-3 animate-spin text-blue-600' />
                )}
                {screening.result ? (
                  getResultBadge(screening.result)
                ) : (
                  <Badge className='bg-gray-100 text-gray-800 font-medium'>Select result</Badge>
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
      setSelectedScreenings(filteredScreenings)
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

  type ProgramStatus = 'none' | 'qualified' | 'not_in_program' | 'sub' | 'paused' | 'graduated'

  const handleProgramChange = (screening: Screening, newProgram: ProgramStatus) => {
    if (screening.source_table === 'speech') {
      setUpdatingProgramId(screening.id)

      updateStudent(
        {
          id: screening.student_id,
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
    { value: 'paused', label: 'Pause' },
    { value: 'not_set', label: 'Not Set' },
    { value: 'graduated', label: 'Graduated' },
  ]

  const {
    mutate: deleteScreening,
    isPending: isDeleting,
    error: deleteError,
  } = useDeleteScreening()

  const handleDelete = (screening: Screening) => {
    setScreeningToDelete(screening)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (screeningToDelete && screeningToDelete.source_table) {
      deleteScreening(
        {
          id: screeningToDelete.id,
          sourceTable: screeningToDelete.source_table,
        },
        {
          onSuccess: () => {
            toast({
              title: 'Screening deleted',
              description: `Successfully deleted screening for ${screeningToDelete.student_name}`,
              variant: 'default',
            })
            setIsDeleteDialogOpen(false)
            setScreeningToDelete(null)
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
    }
  }

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false)
    setScreeningToDelete(null)
  }

  const isAllSelected =
    filteredScreenings.length > 0 && selectedScreenings.length === filteredScreenings.length
  const isSomeSelected = selectedScreenings.length > 0

  // Loading state with skeleton (show when initially loading or when fetching without data)
  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='flex justify-end mb-3'>
          <div className='h-7 w-32 bg-gray-200 rounded-full animate-pulse'></div>
        </div>

        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <ResponsiveTable className='w-full'>
            <TableHeader>
              <tr>
                <TableHead className='w-12'>
                  <div className='h-4 w-4 bg-gray-200 rounded animate-pulse'></div>
                </TableHead>
                <TableHead className='w-1/4 min-w-[200px]'>
                  <div className='h-4 w-20 bg-gray-200 rounded animate-pulse'></div>
                </TableHead>
                <TableHead className='w-1/6 min-w-[120px]'>
                  <div className='h-4 w-16 bg-gray-200 rounded animate-pulse'></div>
                </TableHead>
                <TableHead className='w-1/6 min-w-[120px]'>
                  <div className='h-4 w-20 bg-gray-200 rounded animate-pulse'></div>
                </TableHead>
                <TableHead className='w-1/6 min-w-[80px]'>
                  <div className='h-4 w-14 bg-gray-200 rounded animate-pulse'></div>
                </TableHead>
                <TableHead className='w-1/6 min-w-[100px]'>
                  <div className='h-4 w-12 bg-gray-200 rounded animate-pulse'></div>
                </TableHead>
                <TableHead className='w-1/6 min-w-[120px]'>
                  <div className='h-4 w-20 bg-gray-200 rounded animate-pulse'></div>
                </TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className='border-b border-gray-200'>
                  <TableCell>
                    <div className='h-4 w-4 bg-gray-200 rounded animate-pulse'></div>
                  </TableCell>
                  <TableCell>
                    <div className='space-y-2'>
                      <div className='h-4 w-32 bg-gray-200 rounded animate-pulse'></div>
                      <div className='h-3 w-24 bg-gray-200 rounded animate-pulse'></div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='h-6 w-20 bg-gray-200 rounded-full animate-pulse'></div>
                  </TableCell>
                  <TableCell>
                    <div className='h-6 w-24 bg-gray-200 rounded-full animate-pulse'></div>
                  </TableCell>
                  <TableCell>
                    <div className='h-4 w-8 bg-gray-200 rounded animate-pulse'></div>
                  </TableCell>
                  <TableCell>
                    <div className='h-4 w-20 bg-gray-200 rounded animate-pulse'></div>
                  </TableCell>
                  <TableCell>
                    <div className='h-4 w-24 bg-gray-200 rounded animate-pulse'></div>
                  </TableCell>
                  <TableCell>
                    <div className='h-8 w-8 bg-gray-200 rounded animate-pulse'></div>
                  </TableCell>
                </tr>
              ))}
            </TableBody>
          </ResponsiveTable>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className='space-y-4'>
        <div className='bg-white rounded-lg border border-gray-200 p-8'>
          <div className='text-center'>
            <p className='text-red-600 mb-2'>Error loading screenings</p>
            <p className='text-gray-500 text-sm'>{error.message}</p>
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
          <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800'>
            {filteredScreenings.length} screening{filteredScreenings.length !== 1 ? 's' : ''} found
          </span>
        </div>

        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
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
                    className='h-auto p-0 font-medium hover:bg-transparent'>
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
                    className='h-auto p-0 font-medium hover:bg-transparent'>
                    Grade
                    <span className='ml-1'>{getSortIcon('grade')}</span>
                  </Button>
                </TableHead>
                <TableHead className='w-1/6 min-w-[100px]'>
                  <Button
                    variant='ghost'
                    onClick={() => handleSort('date')}
                    className='h-auto p-0 font-medium hover:bg-transparent'>
                    Date
                    <span className='ml-1'>{getSortIcon('date')}</span>
                  </Button>
                </TableHead>
                <TableHead className='w-1/6 min-w-[120px]'>Screener</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {sortedScreenings.map(screening => (
                <ResponsiveTableRow
                  key={screening.id}
                  mobileCardContent={
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <Checkbox
                            checked={selectedScreenings.some(s => s.id === screening.id)}
                            onCheckedChange={checked =>
                              handleSelectScreening(screening, checked as boolean)
                            }
                          />
                          <h3 className='font-medium'>{screening.student_name}</h3>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='sm'>
                              <MoreHorizontal className='w-4 h-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end' className='bg-white'>
                            <DropdownMenuItem onClick={() => handleViewDetails(screening)}>
                              <Eye className='w-4 h-4 mr-2' />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEmailReport(screening)}>
                              <Mail className='w-4 h-4 mr-2' />
                              Send Report
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className='text-red-600'
                              onClick={() => handleDelete(screening)}
                              disabled={isDeleting}>
                              {isDeleting ? (
                                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                              ) : (
                                <Trash2 className='w-4 h-4 mr-2' />
                              )}
                              {isDeleting ? 'Deleting...' : 'Delete'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className='flex items-center gap-'>{getResultSelector(screening)}</div>
                      <div className='flex items-center gap-2'>{getProgramSelector(screening)}</div>
                      <div className='text-sm text-gray-600 space-y-1'>
                        <p>
                          <span className='font-medium'>Date:</span>{' '}
                          {new Date(screening.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                        <p>
                          <span className='font-medium'>Screener:</span> {screening.screener}
                        </p>
                        <p>
                          <span className='font-medium'>Student ID:</span> {screening.student_id}
                        </p>
                        {screening.grade && (
                          <p>
                            <span className='font-medium'>Grade:</span> {screening.grade}
                          </p>
                        )}
                      </div>
                    </div>
                  }>
                  <TableCell>
                    <Checkbox
                      className='mt-1.5'
                      checked={selectedScreenings.some(s => s.id === screening.id)}
                      onCheckedChange={checked =>
                        handleSelectScreening(screening, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className='max-w-0'>
                    <div className='truncate'>
                      <div
                        className='font-medium text-base truncate'
                        title={screening.student_name}>
                        {screening.student_name}
                      </div>
                      {/* <div className='text-sm text-gray-500 truncate'>
                        ID: {screening.student_id}
                      </div> */}
                    </div>
                  </TableCell>
                  <TableCell className='max-w-0'>
                    <div className='w-full min-w-[120px]'>{getResultSelector(screening)}</div>
                  </TableCell>
                  <TableCell className='max-w-0'>
                    <div className='w-full min-w-[120px]'>{getProgramSelector(screening)}</div>
                  </TableCell>
                  <TableCell className='max-w-0'>
                    <div className='truncate' title={screening.grade || 'No grade'}>
                      {screening.grade || '-'}
                    </div>
                  </TableCell>
                  <TableCell className='max-w-0'>
                    <div
                      className='truncate'
                      title={format(parseDateSafely(screening.date), 'MMM d, yyyy')}>
                      {format(parseDateSafely(screening.date), 'MMM d, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell className='max-w-0'>
                    <div className='truncate' title={screening.screener}>
                      {screening.screener}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='sm'>
                          <MoreHorizontal className='w-4 h-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='bg-white'>
                        <DropdownMenuItem onClick={() => handleViewDetails(screening)}>
                          <Eye className='w-4 h-4 mr-2' />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEmailReport(screening)}>
                          <Mail className='w-4 h-4 mr-2' />
                          Send Report
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='text-red-600'
                          onClick={() => handleDelete(screening)}
                          disabled={isDeleting}>
                          {isDeleting ? (
                            <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                          ) : (
                            <Trash2 className='w-4 h-4 mr-2' />
                          )}
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </ResponsiveTableRow>
              ))}
            </TableBody>
          </ResponsiveTable>

          {filteredScreenings.length === 0 && (
            <div className='text-center py-8'>
              <p className='text-gray-500'>No screenings found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      <ScreeningDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        screening={selectedScreening}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={open => !open && cancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your screening for{' '}
              {screeningToDelete?.student_name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? (
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
              ) : (
                <Trash2 className='w-4 h-4 mr-2' />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
