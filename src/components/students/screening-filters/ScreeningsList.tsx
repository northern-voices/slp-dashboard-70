import React, { useState } from 'react'
import ScreeningDetailsModal from '../screening-history/ScreeningDetailsModal'
import { Screening } from '@/types/database'
import { useScreenings, useScreeningsByStudent } from '@/hooks/screenings/use-screenings'
import { Loader2, Eye, MoreHorizontal, ChevronUp, ChevronDown } from 'lucide-react'
import { parseDateSafely } from '@/utils/dateUtils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ResponsiveTable,
  ResponsiveTableRow,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/responsive-table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { SCREENING_RESULTS } from '@/constants/screeningResults'

interface ScreeningsListProps {
  studentId?: string
  searchTerm: string
  filterType: string
  filterStatus: string
  dateRangeFilter: string
}

const ScreeningsList = ({
  studentId,
  searchTerm,
  filterType,
  filterStatus,
  dateRangeFilter,
}: ScreeningsListProps) => {
  const [selectedScreening, setSelectedScreening] = useState<Screening | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sortField, setSortField] = useState<'date' | 'screener' | 'grade' | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)

  // Use React Query to fetch screenings data for the specific student
  // Only fetch if studentId is provided
  const { data: allScreenings, isLoading, error } = useScreeningsByStudent(studentId || '')

  const filterByDateRange = (screening: Screening) => {
    if (dateRangeFilter === 'all') return true

    const screeningDate = parseDateSafely(screening.screening_date || screening.date)
    const now = new Date()

    switch (dateRangeFilter) {
      case 'today': {
        return screeningDate.toDateString() === now.toDateString()
      }
      case 'week': {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return screeningDate >= weekAgo
      }
      case 'month': {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return screeningDate >= monthAgo
      }
      case 'quarter': {
        const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        return screeningDate >= quarterAgo
      }
      default:
        return true
    }
  }

  // Apply filters to the screenings
  const filteredScreenings = (allScreenings || []).filter(screening => {
    const matchesSearch =
      screening.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      screening.screener?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || screening.screening_type === filterType
    const matchesStatus =
      filterStatus === 'all' ||
      screening.result === filterStatus ||
      screening.screening_result === filterStatus
    const matchesDateRange = filterByDateRange(screening)

    return matchesSearch && matchesType && matchesStatus && matchesDateRange
  })

  const handleViewDetails = (screening: Screening) => {
    setSelectedScreening(screening)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedScreening(null)
  }

  // Sort screenings
  const sortedScreenings = [...filteredScreenings].sort((a, b) => {
    if (!sortOrder || !sortField) return 0

    let comparison = 0

    switch (sortField) {
      case 'date': {
        const dateA = parseDateSafely(a.date).getTime()
        const dateB = parseDateSafely(b.date).getTime()
        comparison = dateA - dateB
        break
      }
      case 'screener': {
        comparison = (a.screener || '').localeCompare(b.screener || '')
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

  const handleSort = (field: 'date' | 'screener' | 'grade') => {
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

  const getSortIcon = (field: 'date' | 'screener' | 'grade') => {
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
    const qualifies = screening.error_patterns?.screening_metadata?.qualifies_for_speech_program
    const sub = screening.error_patterns?.screening_metadata?.sub
    const graduated = screening.error_patterns?.screening_metadata?.graduated
    const noConsent = screening.result === 'non_registered_no_consent'

    if (noConsent) {
      return <Badge className='bg-gray-100 text-gray-800 font-medium text-[10px]'>No Consent</Badge>
    }

    if (qualifies === undefined && sub === undefined && graduated === undefined) {
      return <Badge className='bg-gray-100 text-gray-800 font-medium text-[10px]'>Not Set</Badge>
    }

    if (graduated) {
      return <Badge className='bg-blue-100 text-blue-800 font-medium text-[10px]'>Graduated</Badge>
    } else if (sub) {
      return <Badge className='bg-orange-100 text-orange-800 font-medium text-[10px]'>Sub</Badge>
    } else if (qualifies) {
      return <Badge className='bg-red-100 text-red-800 font-medium text-[10px]'>Qualifies</Badge>
    } else {
      return (
        <Badge className='bg-green-100 text-green-800 font-medium text-[10px]'>
          Not In Program
        </Badge>
      )
    }
  }

  const hasFilters =
    Boolean(searchTerm) ||
    filterType !== 'all' ||
    filterStatus !== 'all' ||
    dateRangeFilter !== 'all'

  // Loading state
  if (isLoading) {
    return (
      <div className='text-center py-8'>
        <Loader2 className='w-8 h-8 animate-spin text-blue-600 mx-auto mb-4' />
        <p className='text-gray-600'>Loading screenings...</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className='text-center py-8'>
        <p className='text-red-600 mb-2'>Error loading screenings</p>
        <p className='text-gray-500 text-sm'>{error.message}</p>
      </div>
    )
  }

  if (filteredScreenings.length === 0) {
    return (
      <div className='text-center py-8'>
        <p className='text-gray-500'>
          {hasFilters
            ? 'No screenings match your current filters.'
            : 'No screenings found for this student.'}
        </p>
        {hasFilters && (
          <p className='text-sm text-gray-400 mt-1'>
            Try adjusting your search criteria or filters.
          </p>
        )}
      </div>
    )
  }

  return (
    <>
      <div className='space-y-4'>
        <div className='flex justify-end mb-3'>
          <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800'>
            {filteredScreenings.length} screening{filteredScreenings.length !== 1 ? 's' : ''} found
          </span>
        </div>

        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <ResponsiveTable className='w-full'>
            <TableHeader>
              <tr>
                <TableHead className='w-1/5 min-w-[120px]'>
                  <Button
                    variant='ghost'
                    onClick={() => handleSort('screener')}
                    className='h-auto p-0 font-medium hover:bg-transparent'>
                    Screener
                    <span className='ml-1'>{getSortIcon('screener')}</span>
                  </Button>
                </TableHead>
                <TableHead className='w-1/5 min-w-[120px]'>Result</TableHead>
                <TableHead className='w-1/5 min-w-[120px]'>Program</TableHead>
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
                        <h3 className='font-medium'>{screening.screener}</h3>
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
                          {format(parseDateSafely(screening.date), 'MMM d, yyyy')}
                        </p>
                        {screening.grade && (
                          <p>
                            <span className='font-medium'>Grade:</span> {screening.grade}
                          </p>
                        )}
                      </div>
                    </div>
                  }>
                  <TableCell className='max-w-0'>
                    <div className='truncate'>
                      <div className='font-medium text-base truncate' title={screening.screener}>
                        {screening.screener}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='max-w-0'>
                    <div className='w-full min-w-[120px]'>{getResultBadge(screening.result)}</div>
                  </TableCell>
                  <TableCell className='max-w-0'>
                    <div className='w-full min-w-[120px]'>{getQualificationBadge(screening)}</div>
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </ResponsiveTableRow>
              ))}
            </TableBody>
          </ResponsiveTable>
        </div>
      </div>

      <ScreeningDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        screening={selectedScreening}
      />
    </>
  )
}

export default ScreeningsList
