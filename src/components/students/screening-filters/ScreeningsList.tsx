import React, { useState } from 'react'
import ScreeningCard from './ScreeningCard'
import ScreeningDetailsModal from '../screening-history/ScreeningDetailsModal'
import { Screening } from '@/types/database'
import { useScreenings } from '@/hooks/use-speech-screenings'
import { Loader2 } from 'lucide-react'

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

  // Use React Query to fetch screenings data
  const { data: allScreenings, isLoading, error } = useScreenings()

  const filterByDateRange = (screening: Screening) => {
    if (dateRangeFilter === 'all') return true

    const screeningDate = new Date(screening.screening_date || screening.date)
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

  // Filter screenings for the specific student and apply other filters
  const filteredScreenings = (allScreenings || []).filter(screening => {
    // Filter by student ID if provided
    const matchesStudent = !studentId || screening.student_id === studentId

    const matchesSearch =
      screening.screener.toLowerCase().includes(searchTerm.toLowerCase()) ||
      screening.results?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      screening.student_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || screening.type === filterType
    const matchesStatus = filterStatus === 'all' || screening.status === filterStatus
    const matchesDateRange = filterByDateRange(screening)

    return matchesStudent && matchesSearch && matchesType && matchesStatus && matchesDateRange
  })

  const handleViewDetails = (screening: Screening) => {
    setSelectedScreening(screening)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedScreening(null)
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
        {filteredScreenings.map(screening => (
          <ScreeningCard
            key={screening.id}
            screening={screening}
            onViewDetails={handleViewDetails}
          />
        ))}
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
