import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Eye,
  Download,
  Trash2,
  MoreHorizontal,
  Loader2,
  ChevronUp,
  ChevronDown,
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
import { School, Screening } from '@/types/database'
import { useScreenings } from '@/hooks/screenings/use-screenings'
import { useDeleteScreening } from '@/hooks/screenings/use-screening-mutations'
import { useToast } from '@/hooks/use-toast'

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

  // Use React Query to fetch screenings data
  const { data: allScreenings, isLoading, error } = useScreenings()

  // Filter screenings by current school
  const schoolScreenings = currentSchool
    ? (allScreenings || []).filter(screening => screening.school_id === currentSchool.id)
    : allScreenings || []

  console.log(schoolScreenings, 'schoolscreenings') // TODO: Temp remove after

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
      }
    }

    // Apply qualifies for speech program filter
    let matchesQualifiesForSpeechProgram = true
    if (qualifiesForSpeechProgramFilter !== 'all' && screening.error_patterns?.screening_metadata) {
      const qualifies = screening.error_patterns.screening_metadata.qualifies_for_speech_program
      matchesQualifiesForSpeechProgram = qualifies === (qualifiesForSpeechProgramFilter === 'true')
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

    const resultConfig = {
      absent: { label: 'Absent', color: 'bg-gray-100 text-gray-800' },
      age_appropriate: { label: 'Age Appropriate', color: 'bg-green-100 text-green-800' },
      complex_needs: { label: 'Complex Needs', color: 'bg-purple-100 text-purple-800' },
      mild: { label: 'Mild', color: 'bg-yellow-100 text-yellow-800' },
      mild_moderate: { label: 'Mild Moderate', color: 'bg-yellow-100 text-yellow-800' },
      moderate: { label: 'Moderate', color: 'bg-orange-100 text-orange-800' },
      monitor: { label: 'Monitor', color: 'bg-yellow-100 text-yellow-800' },
      non_registered_no_consent: {
        label: 'Non Registered/No Consent',
        color: 'bg-blue-100 text-blue-800',
      },
      passed: { label: 'Passed', color: 'bg-green-100 text-green-800' },
      profound: { label: 'Profound', color: 'bg-red-100 text-red-800' },
      severe: { label: 'Severe', color: 'bg-red-100 text-red-800' },
      severe_profound: { label: 'Severe Profound', color: 'bg-red-100 text-red-800' },
      unable_to_screen: { label: 'Unable to Screen', color: 'bg-gray-100 text-gray-800' },
    }

    const config = resultConfig[result as keyof typeof resultConfig]
    if (!config) return null

    return <Badge className={`${config.color} font-medium`}>{config.label}</Badge>
  }

  const getQualificationBadge = (screening: Screening) => {
    const qualifies = screening.error_patterns?.screening_metadata?.qualifies_for_speech_program

    if (qualifies === undefined || qualifies === null) {
      return <Badge className='bg-gray-100 text-gray-800 font-medium'>Not Set</Badge>
    }

    if (qualifies) {
      return <Badge className='bg-green-100 text-green-800 font-medium'>Qualifies</Badge>
    } else {
      return <Badge className='bg-red-100 text-red-800 font-medium'>Does Not Qualify</Badge>
    }
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

  const handleExport = (screening: Screening) => {
    // Create a simple CSV export for the screening
    const csvContent = `Student,Date,Screener,Result
${screening.student_name},${screening.date},${screening.screener},${screening.result || 'N/A'}`

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `screening-${screening.student_name}-${screening.date}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const {
    mutate: deleteScreening,
    isPending: isDeleting,
    error: deleteError,
  } = useDeleteScreening()

  const { toast } = useToast()

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

  // Loading state
  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='bg-white rounded-lg border border-gray-200 p-8'>
          <div className='flex items-center justify-center'>
            <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
            <span className='ml-2 text-gray-600'>Loading screenings...</span>
          </div>
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
                <TableHead className='w-1/6 min-w-[120px]'>Qualifies</TableHead>
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
                <TableHead className='w-12'></TableHead>
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
                            <DropdownMenuItem onClick={() => handleExport(screening)}>
                              <Download className='w-4 h-4 mr-2' />
                              Export
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
                      <div className='flex items-center gap-2'>
                        {getResultBadge(screening.result)}
                      </div>
                      <div className='flex items-center gap-2'>
                        {getQualificationBadge(screening)}
                      </div>
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
                    <div className='truncate'>{getResultBadge(screening.result)}</div>
                  </TableCell>
                  <TableCell className='max-w-0'>
                    <div className='truncate'>{getQualificationBadge(screening)}</div>
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
                        <DropdownMenuItem onClick={() => handleExport(screening)}>
                          <Download className='w-4 h-4 mr-2' />
                          Export
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
    </>
  )
}

export default ScreeningsTable
