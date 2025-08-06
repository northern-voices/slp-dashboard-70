import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, User, FileText, X } from 'lucide-react'
import { format } from 'date-fns'
import { parseDateSafely } from '@/utils/dateUtils'
import { Screening } from '@/types/database'

interface ScreeningDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  screening: Screening | null
}

const ScreeningDetailsModal = ({ isOpen, onClose, screening }: ScreeningDetailsModalProps) => {
  if (!screening) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'speech':
        return 'bg-purple-100 text-purple-800'
      case 'hearing':
        return 'bg-teal-100 text-teal-800'
      case 'progress':
        return 'bg-indigo-100 text-indigo-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <div className='flex items-center justify-between'>
            <DialogTitle className='flex items-center gap-2'>
              <FileText className='w-5 h-5' />
              Screening Details
            </DialogTitle>
            <Button variant='ghost' size='sm' onClick={onClose}>
              <X className='w-4 h-4' />
            </Button>
          </div>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Header Information */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg'>
            <div>
              <h3 className='font-medium text-gray-900 mb-2'>Student Information</h3>
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <User className='w-4 h-4 text-gray-500' />
                  <span className='font-medium'>{screening.student_name}</span>
                </div>
                {screening.grade && (
                  <p className='text-sm text-gray-600 ml-6'>Grade {screening.grade}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className='font-medium text-gray-900 mb-2'>Screening Information</h3>
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <Calendar className='w-4 h-4 text-gray-500' />
                  <span className='text-sm'>
                    {format(parseDateSafely(screening.date), 'MMMM d, yyyy')}
                  </span>
                </div>
                <p className='text-sm text-gray-600 ml-6'>Screener: {screening.screener}</p>
              </div>
            </div>
          </div>

          {/* Status and Type Badges */}
          <div className='flex flex-wrap gap-2'>
            <Badge className={getTypeColor(screening.type)}>
              {screening.type.charAt(0).toUpperCase() + screening.type.slice(1)} Screening
            </Badge>
            <Badge className={getStatusColor(screening.status)}>
              {screening.status.replace('_', ' ').charAt(0).toUpperCase() +
                screening.status.replace('_', ' ').slice(1)}
            </Badge>
            {screening.screening_type && (
              <Badge variant='outline'>
                {screening.screening_type.charAt(0).toUpperCase() +
                  screening.screening_type.slice(1)}
              </Badge>
            )}
            {getResultBadge(screening.result)}
          </div>

          {/* Results Section */}
          {screening.results && (
            <div>
              <h3 className='font-medium text-gray-900 mb-2'>Results</h3>
              <p className='text-sm text-gray-700 p-3 bg-gray-50 rounded-md'>{screening.results}</p>
            </div>
          )}

          {/* Notes Section */}
          {screening.notes && (
            <div>
              <h3 className='font-medium text-gray-900 mb-2'>Notes</h3>
              <p className='text-sm text-gray-700 p-3 bg-gray-50 rounded-md'>{screening.notes}</p>
            </div>
          )}

          {/* Metadata */}
          <div className='pt-4 border-t border-gray-200'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500'>
              <div>
                <span className='font-medium'>Created:</span>{' '}
                {format(new Date(screening.created_at), 'MMM d, yyyy h:mm a')}
              </div>
              <div>
                <span className='font-medium'>Last Updated:</span>{' '}
                {format(new Date(screening.updated_at), 'MMM d, yyyy h:mm a')}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ScreeningDetailsModal
