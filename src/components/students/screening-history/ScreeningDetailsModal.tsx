import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Calendar,
  User,
  FileText,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit2,
  Save,
  XCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import { parseDateSafely } from '@/utils/dateUtils'
import { Screening } from '@/types/database'
import { useUpdateSpeechScreening } from '@/hooks/screenings/use-screening-mutations'

interface ScreeningDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  screening: Screening | null
}

const ScreeningDetailsModal = ({ isOpen, onClose, screening }: ScreeningDetailsModalProps) => {
  const [isEditingClinicalNotes, setIsEditingClinicalNotes] = useState(false)
  const [isEditingAdditionalObservations, setIsEditingAdditionalObservations] = useState(false)
  const [isEditingReferralNotes, setIsEditingReferralNotes] = useState(false)
  const [clinicalNotesText, setClinicalNotesText] = useState('')
  const [additionalObservationsText, setAdditionalObservationsText] = useState('')
  const [referralNotesText, setReferralNotesText] = useState('')
  const [currentScreening, setCurrentScreening] = useState<Screening | null>(null)
  const navigate = useNavigate()

  const updateSpeechScreening = useUpdateSpeechScreening()

  // Update currentScreening when screening prop changes
  useEffect(() => {
    setCurrentScreening(screening)
  }, [screening])

  if (!currentScreening) return null

  const handleEditClinicalNotes = () => {
    setClinicalNotesText(currentScreening.clinical_notes || '')
    setIsEditingClinicalNotes(true)
  }

  const handleEditAdditionalObservations = () => {
    setAdditionalObservationsText(currentScreening.error_patterns?.additional_observations || '')
    setIsEditingAdditionalObservations(true)
  }

  const handleSaveClinicalNotes = () => {
    // Update local state immediately for instant UI feedback
    setCurrentScreening(prev =>
      prev
        ? {
            ...prev,
            clinical_notes: clinicalNotesText,
          }
        : null
    )

    updateSpeechScreening.mutate({
      id: currentScreening.id,
      data: {
        clinical_notes: clinicalNotesText,
      },
    })
    setIsEditingClinicalNotes(false)
  }

  const handleSaveAdditionalObservations = () => {
    // Update local state immediately for instant UI feedback
    setCurrentScreening(prev =>
      prev
        ? {
            ...prev,
            error_patterns: {
              ...prev.error_patterns,
              additional_observations: additionalObservationsText,
            },
          }
        : null
    )

    updateSpeechScreening.mutate({
      id: currentScreening.id,
      data: {
        error_patterns: {
          ...currentScreening.error_patterns,
          additional_observations: additionalObservationsText,
        },
      },
    })
    setIsEditingAdditionalObservations(false)
  }

  const handleCancelClinicalNotes = () => {
    setIsEditingClinicalNotes(false)
    setClinicalNotesText('')
  }

  const handleCancelAdditionalObservations = () => {
    setIsEditingAdditionalObservations(false)
    setAdditionalObservationsText('')
  }

  const handleEditReferralNotes = () => {
    setReferralNotesText(currentScreening.referral_notes || '')
    setIsEditingReferralNotes(true)
  }

  const handleSaveReferralNotes = () => {
    // Update local state immediately for instant UI feedback
    setCurrentScreening(prev =>
      prev
        ? {
            ...prev,
            referral_notes: referralNotesText,
          }
        : null
    )

    updateSpeechScreening.mutate({
      id: currentScreening.id,
      data: {
        referral_notes: referralNotesText,
      },
    })
    setIsEditingReferralNotes(false)
  }

  const handleCancelReferralNotes = () => {
    setIsEditingReferralNotes(false)
    setReferralNotesText('')
  }

  const handleEditScreening = () => {
    navigate(`/edit-screening/${screening.id}`)
    onClose()
  }

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
    if (!currentScreening.error_patterns?.articulation) return null

    const articulation = currentScreening.error_patterns.articulation
    const soundErrors = articulation.soundErrors || []

    return (
      <div className='space-y-4'>
        {soundErrors.length > 0 && (
          <>
            <h4 className='font-medium text-gray-900'>Articulation Assessment:</h4>

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
                          <span className='text-xs font-semibold text-gray-600'>
                            Error Patterns:
                          </span>
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
          </>
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
    if (!currentScreening.error_patterns?.add_areas_of_concern) return null

    const areas = currentScreening.error_patterns.add_areas_of_concern
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
    if (!currentScreening.error_patterns?.attendance) return null

    const attendance = currentScreening.error_patterns.attendance

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
    if (!currentScreening.error_patterns?.screening_metadata) return null

    const metadata = currentScreening.error_patterns.screening_metadata

    return (
      <div className='space-y-4'>
        <h4 className='font-medium text-gray-900'>Speech Screening Details:</h4>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {(metadata.qualifies_for_speech_program !== undefined || metadata.sub !== undefined) && (
            <div
              className={`p-3 rounded-md border ${
                metadata.sub
                  ? 'bg-orange-50 border-orange-200'
                  : metadata.qualifies_for_speech_program
                  ? 'bg-red-50 border-red-200'
                  : 'bg-green-50 border-green-200'
              }`}>
              <h5
                className={`text-sm font-medium mb-2 ${
                  metadata.sub
                    ? 'text-orange-800'
                    : metadata.qualifies_for_speech_program
                    ? 'text-red-800'
                    : 'text-green-800'
                }`}>
                Speech Program Status:
              </h5>
              <Badge
                className={
                  metadata.sub
                    ? 'bg-orange-100 text-orange-800'
                    : metadata.qualifies_for_speech_program
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }>
                {metadata.sub
                  ? 'Sub'
                  : metadata.qualifies_for_speech_program
                  ? 'Qualifies'
                  : 'Not in Program'}
              </Badge>
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
            <div className='flex items-center gap-2'>
              <Button variant='outline' size='sm' onClick={handleEditScreening}>
                <Edit2 className='w-4 h-4 mr-2' />
                Edit Screening
              </Button>
              <Button variant='ghost' size='sm' onClick={onClose}>
                <X className='w-4 h-4' />
              </Button>
            </div>
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
                  <span className='font-medium'>{currentScreening.student_name}</span>
                </div>
                <p className='text-sm text-gray-600 ml-6'>Grade {currentScreening.grade}</p>
                {currentScreening.academic_year && (
                  <p className='text-sm text-gray-600 ml-6'>
                    Academic Year: {currentScreening.academic_year}
                  </p>
                )}
                <p className='text-sm text-gray-600 ml-6'>
                  School: {currentScreening.school_name || 'Unknown School'}
                </p>
              </div>
            </div>

            <div>
              <h3 className='font-medium text-gray-900 mb-2'>Screening Information</h3>
              <div className='space-y-1'>
                <p className='text-sm text-gray-600 ml-2'>Screener: {currentScreening.screener}</p>
                {currentScreening.screening_type && (
                  <p className='text-sm text-gray-600 ml-2'>
                    Screening Type:{' '}
                    {currentScreening.screening_type.charAt(0).toUpperCase() +
                      currentScreening.screening_type.slice(1)}
                  </p>
                )}
                <p className='text-sm text-gray-600 ml-2'>
                  Screening Date:{' '}
                  {format(new Date(currentScreening.created_at), 'MMM d, yyyy h:mm a')}
                </p>
                <p className='text-sm text-gray-600 ml-2'>
                  Updated: {format(new Date(currentScreening.updated_at), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>
          </div>

          {/* Sound Errors Summary as badges */}
          {currentScreening.error_patterns?.articulation?.soundErrors &&
            currentScreening.error_patterns.articulation.soundErrors.length > 0 && (
              <div className='flex flex-col gap-2'>
                <h4 className='font-medium text-gray-900'>Error Sounds:</h4>
                <div className='flex flex-wrap gap-2'>
                  {currentScreening.error_patterns.articulation.soundErrors
                    .filter(
                      soundError => soundError.errorPatterns && soundError.errorPatterns.length > 0
                    )
                    .map((soundError, index) => (
                      <Badge
                        key={index}
                        className='bg-red-100 text-gray-700 font-medium flex items-center gap-1'>
                        {soundError.sound}
                      </Badge>
                    ))}
                </div>
              </div>
            )}

          {/* Speech-specific flags - Only show if not absent */}
          {!currentScreening.error_patterns?.attendance?.absent && (
            <div className='flex flex-col gap-2'>
              <h4 className='font-medium text-gray-900'>Result:</h4>
              <div className='flex flex-wrap gap-2'>
                {getResultBadge(currentScreening.result)}
                {currentScreening.vocabulary_support && (
                  <Badge className='bg-blue-100 text-blue-800'>Vocabulary Support</Badge>
                )}
                {currentScreening.error_patterns?.add_areas_of_concern?.suspected_cas && (
                  <Badge className='bg-purple-100 text-purple-800'>Suspected CAS</Badge>
                )}
              </div>
            </div>
          )}

          {/* Enhanced Backend Details for Speech Screenings */}
          {currentScreening.error_patterns && (
            <div className='space-y-6'>
              {/* Attendance Information */}
              {renderAttendanceInfo()}

              {/* Only show other details if student is not absent */}
              {!currentScreening.error_patterns.attendance?.absent && (
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
          {!currentScreening.error_patterns?.attendance?.absent && (
            <div className='space-y-4'>
              {(currentScreening.clinical_notes || isEditingClinicalNotes) && (
                <>
                  <h3 className='font-medium text-gray-900'>Clinical Notes:</h3>

                  <div>
                    <div className='flex items-center justify-between mb-2'>
                      <h4 className='text-sm font-medium text-gray-700'>Clinical Observations</h4>
                      {!isEditingClinicalNotes && (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={handleEditClinicalNotes}
                          className='h-6 px-2'>
                          <Edit2 className='w-3 h-3 mr-1' />
                          Edit
                        </Button>
                      )}
                    </div>
                    {isEditingClinicalNotes ? (
                      <div className='space-y-2'>
                        <Textarea
                          value={clinicalNotesText}
                          onChange={e => setClinicalNotesText(e.target.value)}
                          className='min-h-[100px] text-sm'
                          placeholder='Enter clinical observations...'
                        />
                        <div className='flex gap-2 justify-end'>
                          <Button variant='outline' size='sm' onClick={handleCancelClinicalNotes}>
                            <XCircle className='w-3 h-3 mr-1' />
                            Cancel
                          </Button>
                          <Button size='sm' onClick={handleSaveClinicalNotes}>
                            <Save className='w-3 h-3 mr-1' />
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className='text-sm text-gray-700 p-3 bg-gray-50 rounded-md'>
                        {currentScreening.clinical_notes}
                      </p>
                    )}
                  </div>
                </>
              )}

              {(currentScreening.error_patterns?.additional_observations ||
                isEditingAdditionalObservations) && (
                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <h4 className='text-sm font-medium text-gray-700'>Additional Observations</h4>
                    {!isEditingAdditionalObservations && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={handleEditAdditionalObservations}
                        className='h-6 px-2'>
                        <Edit2 className='w-3 h-3 mr-1' />
                        Edit
                      </Button>
                    )}
                  </div>
                  {isEditingAdditionalObservations ? (
                    <div className='space-y-2'>
                      <Textarea
                        value={additionalObservationsText}
                        onChange={e => setAdditionalObservationsText(e.target.value)}
                        className='min-h-[100px] text-sm'
                        placeholder='Enter additional observations...'
                      />
                      <div className='flex gap-2 justify-end'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={handleCancelAdditionalObservations}>
                          <XCircle className='w-3 h-3 mr-1' />
                          Cancel
                        </Button>
                        <Button size='sm' onClick={handleSaveAdditionalObservations}>
                          <Save className='w-3 h-3 mr-1' />
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className='text-sm text-gray-700 p-3 bg-gray-50 rounded-md'>
                      {currentScreening.error_patterns.additional_observations}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Referral Notes Section - Only show if not absent */}
          {(currentScreening.referral_notes || isEditingReferralNotes) &&
            !currentScreening.error_patterns?.attendance?.absent && (
              <div>
                <div className='flex items-center justify-between mb-2'>
                  <h3 className='font-medium text-gray-900'>Referral Notes</h3>
                  {!isEditingReferralNotes && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={handleEditReferralNotes}
                      className='h-6 px-2'>
                      <Edit2 className='w-3 h-3 mr-1' />
                      Edit
                    </Button>
                  )}
                </div>
                {isEditingReferralNotes ? (
                  <div className='space-y-2'>
                    <Textarea
                      value={referralNotesText}
                      onChange={e => setReferralNotesText(e.target.value)}
                      className='min-h-[100px] text-sm'
                      placeholder='Enter referral notes...'
                    />
                    <div className='flex gap-2 justify-end'>
                      <Button variant='outline' size='sm' onClick={handleCancelReferralNotes}>
                        <XCircle className='w-3 h-3 mr-1' />
                        Cancel
                      </Button>
                      <Button size='sm' onClick={handleSaveReferralNotes}>
                        <Save className='w-3 h-3 mr-1' />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className='text-sm text-gray-700 p-3 bg-gray-50 rounded-md'>
                    {currentScreening.referral_notes}
                  </p>
                )}
              </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ScreeningDetailsModal
