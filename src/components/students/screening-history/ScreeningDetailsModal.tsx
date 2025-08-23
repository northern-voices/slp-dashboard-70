import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, User, FileText, X, AlertCircle, CheckCircle, Clock } from 'lucide-react'
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

  const getResultBadge = (result?: string) => {
    if (!result) return null

    const resultConfig = {
      absent: { label: 'Absent', color: 'bg-gray-100 text-gray-800', icon: Clock },
      age_appropriate: {
        label: 'Age Appropriate',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
      },
      complex_needs: {
        label: 'Complex Needs',
        color: 'bg-purple-100 text-purple-800',
        icon: AlertCircle,
      },
      mild: { label: 'Mild', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      mild_moderate: {
        label: 'Mild Moderate',
        color: 'bg-yellow-100 text-yellow-800',
        icon: AlertCircle,
      },
      moderate: { label: 'Moderate', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
      monitor: { label: 'Monitor', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      non_registered_no_consent: {
        label: 'No Consent',
        color: 'bg-red-100 text-red-800',
        icon: AlertCircle,
      },
      passed: { label: 'Passed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      profound: { label: 'Profound', color: 'bg-red-100 text-red-800', icon: AlertCircle },
      severe: { label: 'Severe', color: 'bg-red-100 text-red-800', icon: AlertCircle },
      severe_profound: {
        label: 'Severe Profound',
        color: 'bg-red-100 text-red-800',
        icon: AlertCircle,
      },
      unable_to_screen: {
        label: 'Unable to Screen',
        color: 'bg-gray-100 text-gray-800',
        icon: AlertCircle,
      },
      no_consent: {
        label: 'No Consent',
        color: 'bg-red-100 text-red-800',
        icon: AlertCircle,
      },
    }

    const config = resultConfig[result as keyof typeof resultConfig]
    if (!config) return null

    const IconComponent = config.icon
    return (
      <Badge className={`${config.color} font-medium flex items-center gap-1`}>
        <IconComponent className='w-3 h-3' />
        Result: {config.label}
      </Badge>
    )
  }

  const renderArticulationData = () => {
    if (!screening.error_patterns?.articulation) return null

    const articulation = screening.error_patterns.articulation
    const soundErrors = articulation.soundErrors || []

    return (
      <div className='space-y-4'>
        <h4 className='font-medium text-gray-900'>Articulation Assessment:</h4>

        {soundErrors.length > 0 && (
          <div className='space-y-3'>
            <h5 className='text-sm font-medium text-gray-700'>Sounds in Error:</h5>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              {soundErrors
                .filter(
                  soundError => soundError.errorPatterns && soundError.errorPatterns.length > 0
                )
                .map((soundError, index) => (
                  <div key={index} className='p-3 bg-gray-50 rounded-md'>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='font-medium text-gray-900'>{soundError.sound}</span>
                    </div>
                    {soundError.errorPatterns && soundError.errorPatterns.length > 0 && (
                      <div className='mb-2'>
                        <span className='text-xs font-semibold text-gray-600'>Error Patterns:</span>
                        <div className='flex flex-wrap gap-1 mt-1'>
                          {soundError.errorPatterns.map((pattern, patternIndex) => (
                            <Badge key={patternIndex} variant='outline' className='text-xs'>
                              {pattern}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Display Stopping Sounds */}
                    {soundError.stoppingSounds && soundError.stoppingSounds.length > 0 && (
                      <div className='mb-2'>
                        <span className='text-xs text-gray-600'>Stopping to:</span>
                        <div className='flex flex-wrap gap-1 mt-1'>
                          {soundError.stoppingSounds.map((stoppingSound, stoppingIndex) => (
                            <Badge
                              key={stoppingIndex}
                              variant='secondary'
                              className='text-xs bg-blue-100 text-blue-800'>
                              {stoppingSound}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Display Notes (from input field) */}
                    {soundError.notes && (
                      <div className='text-sm text-gray-700'>
                        <span className='text-xs font-semibold text-gray-600'>Notes:</span>
                        <p className='mt-1'>{soundError.notes}</p>
                      </div>
                    )}

                    {/* Display Other Notes (from "Other" textarea) */}
                    {soundError.otherNotes && (
                      <div className='text-sm text-gray-700'>
                        <span className='text-xs font-semibold text-gray-600'>Other Notes:</span>
                        <p className='mt-1'>{soundError.otherNotes}</p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {articulation.articulationNotes && (
          <div>
            <h5 className='text-sm font-medium text-gray-700 mb-2'>General Articulation Notes:</h5>
            <p className='text-sm text-gray-700 p-3 bg-gray-50 rounded-md'>
              {articulation.articulationNotes}
            </p>
          </div>
        )}
      </div>
    )
  }

  const renderAreasOfConcern = () => {
    if (!screening.error_patterns?.add_areas_of_concern) return null

    const areas = screening.error_patterns.add_areas_of_concern
    const areasWithData = Object.entries(areas).filter(
      ([_, value]) => value !== null && value !== ''
    )

    if (areasWithData.length === 0) return null

    return (
      <div className='space-y-4'>
        <h4 className='font-medium text-gray-900'>Additional Areas of Concern</h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {areasWithData.map(([key, value]) => (
            <div key={key} className='p-3 bg-yellow-50 rounded-md border border-yellow-200'>
              <h5 className='text-sm font-medium text-yellow-800 mb-2'>
                {key
                  .split('_')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ')}
                :
              </h5>
              <p className='text-sm text-yellow-700'>
                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
              </p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderAttendanceInfo = () => {
    if (!screening.error_patterns?.attendance) return null

    const attendance = screening.error_patterns.attendance

    return (
      <div className='space-y-4'>
        <h4 className='font-medium text-gray-900'>Attendance Information:</h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='p-3 bg-gray-50 rounded-md'>
            <h5 className='text-sm font-medium text-gray-700 mb-2'>Absent:</h5>
            <Badge variant={attendance.absent ? 'destructive' : 'secondary'}>
              {attendance.absent ? 'Yes' : 'No'}
            </Badge>
          </div>

          {attendance.priority_re_screen && (
            <div className='p-3 bg-orange-50 rounded-md border border-orange-200'>
              <h5 className='text-sm font-medium text-orange-800 mb-2'>Priority Re-screen:</h5>
              <Badge className='bg-orange-100 text-orange-800'>Required</Badge>
            </div>
          )}
        </div>

        {attendance.absence_notes && (
          <div>
            <h5 className='text-sm font-medium text-gray-700 mb-2'>Absence Notes:</h5>
            <p className='text-sm text-gray-700 p-3 bg-gray-50 rounded-md'>
              {attendance.absence_notes}
            </p>
          </div>
        )}
      </div>
    )
  }

  const renderScreeningMetadata = () => {
    if (!screening.error_patterns?.screening_metadata) return null

    const metadata = screening.error_patterns.screening_metadata

    return (
      <div className='space-y-4'>
        <h4 className='font-medium text-gray-900'>Speech Screening Details:</h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {metadata.qualifies_for_speech_program && (
            <div className='p-3 bg-green-50 rounded-md border border-green-200'>
              <h5 className='text-sm font-medium text-green-800 mb-2'>
                Qualifies for Speech Program:
              </h5>
              <Badge className='bg-green-100 text-green-800'>Yes</Badge>
            </div>
          )}

          {metadata.vocabulary_support_recommended && (
            <div className='p-3 bg-blue-50 rounded-md border border-blue-200'>
              <h5 className='text-sm font-medium text-blue-800 mb-2'>
                Vocabulary Support Recommended:
              </h5>
              <Badge className='bg-blue-100 text-blue-800'>Language Ladder</Badge>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
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
                <p className='text-sm text-gray-600 ml-6'>Grade {screening.grade}</p>
                {screening.academic_year && (
                  <p className='text-sm text-gray-600 ml-6'>
                    Academic Year: {screening.academic_year}
                  </p>
                )}
                <p className='text-sm text-gray-600 ml-6'>
                  School: {screening.school_name || 'Unknown School'}
                </p>
              </div>
            </div>

            <div>
              <h3 className='font-medium text-gray-900 mb-2'>Screening Information</h3>
              <div className='space-y-1'>
                <p className='text-sm text-gray-600 ml-2'>Screener: {screening.screener}</p>
                {screening.screening_type && (
                  <p className='text-sm text-gray-600 ml-2'>
                    Screening Type:{' '}
                    {screening.screening_type.charAt(0).toUpperCase() +
                      screening.screening_type.slice(1)}
                  </p>
                )}
                <p className='text-sm text-gray-600 ml-2'>
                  Screening Date: {format(new Date(screening.created_at), 'MMM d, yyyy h:mm a')}
                </p>
                <p className='text-sm text-gray-600 ml-2'>
                  Updated: {format(new Date(screening.updated_at), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>
          </div>

          {/* Sound Errors Summary as badges */}
          {screening.error_patterns?.articulation?.soundErrors &&
            screening.error_patterns.articulation.soundErrors.length > 0 && (
              <div className='flex flex-wrap gap-2'>
                {screening.error_patterns.articulation.soundErrors
                  .filter(
                    soundError => soundError.errorPatterns && soundError.errorPatterns.length > 0
                  )
                  .map((soundError, index) => (
                    <Badge
                      key={index}
                      className='bg-green-100 text-gray-700 font-medium flex items-center gap-1'>
                      <CheckCircle className='w-3 h-3' />
                      {soundError.sound}
                    </Badge>
                  ))}
              </div>
            )}

          {/* Speech-specific flags - Only show if not absent */}
          {!screening.error_patterns?.attendance?.absent && (
            <div className='flex flex-wrap gap-2'>
              {getResultBadge(screening.result)}
              {screening.vocabulary_support && (
                <Badge className='bg-blue-100 text-blue-800'>Vocabulary Support</Badge>
              )}
              {screening.error_patterns?.add_areas_of_concern?.suspected_cas && (
                <Badge className='bg-purple-100 text-purple-800'>Suspected CAS</Badge>
              )}
            </div>
          )}

          {/* Enhanced Backend Details for Speech Screenings */}
          {screening.error_patterns && (
            <div className='space-y-6'>
              {/* Attendance Information */}
              {renderAttendanceInfo()}

              {/* Only show other details if student is not absent */}
              {!screening.error_patterns.attendance?.absent && (
                <>
                  {/* Screening Metadata */}
                  {renderScreeningMetadata()}

                  {/* Articulation Data */}
                  {renderArticulationData()}

                  {/* Areas of Concern */}
                  {renderAreasOfConcern()}
                </>
              )}
            </div>
          )}

          {/* Notes Section - Only show if not absent */}
          {!screening.error_patterns?.attendance?.absent && (
            <div className='space-y-4'>
              <h3 className='font-medium text-gray-900'>Clinical Notes:</h3>

              {screening.clinical_notes && (
                <div>
                  <h4 className='text-sm font-medium text-gray-700 mb-2'>Clinical Observations</h4>
                  <p className='text-sm text-gray-700 p-3 bg-gray-50 rounded-md'>
                    {screening.clinical_notes}
                  </p>
                </div>
              )}

              {screening.error_patterns?.additional_observations && (
                <div>
                  <h4 className='text-sm font-medium text-gray-700 mb-2'>
                    Additional Observations
                  </h4>
                  <p className='text-sm text-gray-700 p-3 bg-gray-50 rounded-md'>
                    {screening.error_patterns.additional_observations}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Referral Notes Section - Only show if not absent */}
          {screening.referral_notes && !screening.error_patterns?.attendance?.absent && (
            <div>
              <h3 className='font-medium text-gray-900 mb-2'>Referral Notes</h3>
              <p className='text-sm text-gray-700 p-3 bg-gray-50 rounded-md'>
                {screening.referral_notes}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ScreeningDetailsModal
