import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, Download, Trash2, MoreHorizontal, Loader2 } from 'lucide-react'
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
import { format } from 'date-fns'
import ScreeningBulkActions from './ScreeningBulkActions'
import ScreeningDetailsModal from '@/components/students/screening-history/ScreeningDetailsModal'
import { School, Screening } from '@/types/database'
import { useScreenings } from '@/hooks/screenings/use-screenings'

interface ScreeningsTableProps {
  searchTerm: string
  resultFilter: string
  dateRangeFilter: string
  selectedScreenings: string[]
  setSelectedScreenings: (ids: string[]) => void
  onBulkAction: (action: string) => void
  currentSchool: School | null
}

const ScreeningsTable = ({
  searchTerm,
  resultFilter,
  dateRangeFilter,
  selectedScreenings,
  setSelectedScreenings,
  onBulkAction,
  currentSchool,
}: ScreeningsTableProps) => {
  const [selectedScreening, setSelectedScreening] = useState<Screening | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  // Use React Query to fetch screenings data
  const { data: allScreenings, isLoading, error } = useScreenings()

  // Filter screenings by current school
  const schoolScreenings = currentSchool
    ? (allScreenings || []).filter(screening => screening.school_id === currentSchool.id)
    : allScreenings || []

  console.log(schoolScreenings, 'schoolscreenings')

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
      const screeningDate = new Date(screening.date)
      const now = new Date()

      switch (dateRangeFilter) {
        case 'today': {
          matchesDateRange = screeningDate.toDateString() === now.toDateString()
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

    return matchesSearch && matchesResult && matchesDateRange
  })

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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedScreenings(filteredScreenings.map(s => s.id))
    } else {
      setSelectedScreenings([])
    }
  }

  const handleSelectScreening = (screeningId: string, checked: boolean) => {
    if (checked) {
      setSelectedScreenings([...selectedScreenings, screeningId])
    } else {
      setSelectedScreenings(selectedScreenings.filter(id => id !== screeningId))
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

  const handleDelete = (screening: Screening) => {
    if (
      window.confirm(`Are you sure you want to delete the screening for ${screening.student_name}?`)
    ) {
      console.log('Deleting screening:', screening.id)
      // Here you would typically call an API to delete the screening
      // For now, we'll just log the action
    }
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

        <div className='bg-white rounded-lg border border-gray-200'>
          <ResponsiveTable>
            <TableHeader>
              <tr>
                <TableHead className='w-12'>
                  <Checkbox checked={isAllSelected} onCheckedChange={handleSelectAll} />
                </TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Screener</TableHead>
                <TableHead className='w-12'></TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {filteredScreenings.map(screening => (
                <ResponsiveTableRow
                  key={screening.id}
                  mobileCardContent={
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <Checkbox
                            checked={selectedScreenings.includes(screening.id)}
                            onCheckedChange={checked =>
                              handleSelectScreening(screening.id, checked as boolean)
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
                              onClick={() => handleDelete(screening)}>
                              <Trash2 className='w-4 h-4 mr-2' />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className='flex items-center gap-2'>
                        {getResultBadge(screening.result)}
                      </div>
                      <div className='text-sm text-gray-600 space-y-1'>
                        <p>
                          <span className='font-medium'>Date:</span>{' '}
                          {format(new Date(screening.date), 'MMM d, yyyy')}
                        </p>
                        <p>
                          <span className='font-medium'>Screener:</span> {screening.screener}
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
                      checked={selectedScreenings.includes(screening.id)}
                      onCheckedChange={checked =>
                        handleSelectScreening(screening.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className='font-medium'>{screening.student_name}</div>
                      {screening.grade && (
                        <div className='text-sm text-gray-500'>Grade {screening.grade}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getResultBadge(screening.result)}</TableCell>
                  <TableCell>{format(new Date(screening.date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{screening.screener}</TableCell>
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
                          onClick={() => handleDelete(screening)}>
                          <Trash2 className='w-4 h-4 mr-2' />
                          Delete
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
    </>
  )
}

export default ScreeningsTable
