import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrganization } from '@/contexts/OrganizationContext'
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
import { schoolGradesApi, type SchoolGrade } from '@/api/schoolGrades'
import { studentsApi } from '@/api/students'

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
  const [screeningGrade, setScreeningGrade] = useState<string>('N/A')
  const [studentCurrentGrade, setStudentCurrentGrade] = useState<string | null>(null)
  const [gradesMatch, setGradesMatch] = useState<boolean>(true)
  const [isLoadingGrades, setIsLoadingGrades] = useState(false)
  const navigate = useNavigate()
  const { currentSchool } = useOrganization()

  const updateSpeechScreening = useUpdateSpeechScreening()

  // Update currentScreening when screening prop changes
  useEffect(() => {
    setCurrentScreening(screening)
  }, [screening])

  // Fetch grades and compare when modal opens
  useEffect(() => {
    const fetchGrades = async () => {
      if (!screening || !isOpen) return

      // Reset state
      setScreeningGrade('N/A')
      setStudentCurrentGrade(null)
      setGradesMatch(true)
      setIsLoadingGrades(true)

      if (!screening.school_id) {
        setIsLoadingGrades(false)
        return
      }

      try {
        const grades = await schoolGradesApi.getSchoolGradesBySchool(screening.school_id)

        // Get the screening's grade from grade_id
        if (screening.grade_id) {
          const screeningGradeObj = grades.find(g => g.id === screening.grade_id)
          if (screeningGradeObj) {
            setScreeningGrade(screeningGradeObj.grade_level)
          }
        }

        // Fetch student's current grade to compare
        if (screening.student_id) {
          const student = await studentsApi.getStudentByStudentId(screening.student_id)

          if (student?.current_grade_id) {
            const studentGradeObj = grades.find(g => g.id === student.current_grade_id)
            if (studentGradeObj) {
              setStudentCurrentGrade(studentGradeObj.grade_level)

              // Check if grades match
              if (student.current_grade_id !== screening.grade_id) {
                setGradesMatch(false)
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching grades:', error)
      } finally {
        setIsLoadingGrades(false)
      }
    }

    fetchGrades()
  }, [screening, isOpen])

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
    const basePath = currentSchool?.id ? `/school/${currentSchool.id}` : ''

    if (screening?.source_table === 'hearing') {
      navigate(`${basePath}/edit-hearing-screening/${screening.id}`)
    } else {
      navigate(`${basePath}/edit-screening/${screening.id}`)
    }

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
              <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
                {soundErrors
                  .filter(
                    soundError => soundError.errorPatterns && soundError.errorPatterns.length > 0
                  )
                  .map((soundError, index) => (
                    <div key={index} className='p-3 rounded-md bg-gray-50'>
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
                                className='text-xs text-blue-800 bg-blue-100'>
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
            <h5 className='mb-2 text-sm font-medium text-gray-700'>General Articulation Notes:</h5>
            <p className='p-3 text-sm text-gray-700 rounded-md bg-gray-50'>
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
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {areasWithData.map(([key, value]) => (
            <div key={key} className='p-3 border border-yellow-200 rounded-md bg-yellow-50'>
              <h5 className='mb-2 text-sm font-medium text-yellow-800'>
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
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div className='p-3 rounded-md bg-gray-50'>
            <h5 className='mb-2 text-sm font-medium text-gray-700'>Absent:</h5>
            <Badge variant={attendance.absent ? 'destructive' : 'secondary'}>
              {attendance.absent ? 'Yes' : 'No'}
            </Badge>
          </div>

          {attendance.priority_re_screen && (
            <div className='p-3 border border-orange-200 rounded-md bg-orange-50'>
              <h5 className='mb-2 text-sm font-medium text-orange-800'>Priority Re-screen:</h5>
              <Badge className='text-orange-800 bg-orange-100'>Required</Badge>
            </div>
          )}
        </div>

        {attendance.absence_notes && (
          <div>
            <h5 className='mb-2 text-sm font-medium text-gray-700'>Absence Notes:</h5>
            <p className='p-3 text-sm text-gray-700 rounded-md bg-gray-50'>
              {attendance.absence_notes}
            </p>
          </div>
        )}
      </div>
    )
  }

  const renderScreeningMetadata = () => {
    const programStatus = currentScreening.program_status
    const metadata = currentScreening.error_patterns?.screening_metadata

    // Determine background and text colors based on program status
    const getStatusColors = (status: string) => {
      switch (status) {
        case 'graduated':
          return {
            bg: 'bg-blue-50 border-blue-200',
            text: 'text-blue-800',
            badge: 'bg-blue-100 text-blue-800',
          }
        case 'paused':
          return {
            bg: 'bg-purple-50 border-purple-200',
            text: 'text-purple-800',
            badge: 'bg-purple-100 text-purple-800',
          }
        case 'sub':
          return {
            bg: 'bg-orange-50 border-orange-200',
            text: 'text-orange-800',
            badge: 'bg-orange-100 text-orange-800',
          }
        case 'qualified':
          return {
            bg: 'bg-red-50 border-red-200',
            text: 'text-red-800',
            badge: 'bg-red-100 text-red-800',
          }
        case 'not_in_program':
          return {
            bg: 'bg-green-50 border-green-200',
            text: 'text-green-800',
            badge: 'bg-green-100 text-green-800',
          }
        case 'none':
        default:
          return {
            bg: 'bg-gray-50 border-gray-200',
            text: 'text-gray-800',
            badge: 'bg-gray-100 text-gray-800',
          }
      }
    }

    const getStatusLabel = (status: string) => {
      switch (status) {
        case 'graduated':
          return 'Graduated'
        case 'paused':
          return 'Paused'
        case 'sub':
          return 'Sub'
        case 'qualified':
          return 'Qualifies'
        case 'not_in_program':
          return 'Not in Program'
        case 'none':
        default:
          return 'Not Set'
      }
    }

    const colors = getStatusColors(programStatus || 'none')
    const showMetadata = programStatus && programStatus !== 'none'
    const showVocabularySupport = metadata?.vocabulary_support_recommended

    // Don't render anything if there's no program status and no vocabulary support
    if (!showMetadata && !showVocabularySupport) return null

    return (
      <div className='space-y-4'>
        <h4 className='font-medium text-gray-900'>Speech Screening Details:</h4>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {showMetadata && (
            <div className={`p-3 rounded-md border ${colors.bg}`}>
              <h5 className={`text-sm font-medium mb-2 ${colors.text}`}>Speech Program Status:</h5>
              <Badge className={colors.badge}>{getStatusLabel(programStatus)}</Badge>
            </div>
          )}

          {showVocabularySupport && (
            <div className='p-3 border border-blue-200 rounded-md bg-blue-50'>
              <h5 className='mb-2 text-sm font-medium text-blue-800'>
                Vocabulary Support Recommended:
              </h5>
              <Badge className='text-blue-800 bg-blue-100'>Language Ladder</Badge>
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
          <div className='grid grid-cols-1 gap-4 p-4 rounded-lg md:grid-cols-2 bg-gray-50'>
            <div>
              <h3 className='mb-2 font-medium text-gray-900'>Student Information</h3>
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <User className='w-4 h-4 text-gray-500' />
                  <span className='font-medium'>{currentScreening.student_name}</span>
                </div>
                {isLoadingGrades ? (
                  <div className='ml-6'>
                    <div className='w-32 h-5 bg-gray-200 rounded animate-pulse'></div>
                  </div>
                ) : (
                  <>
                    <p className='ml-6 text-sm text-gray-600'>
                      {gradesMatch ? 'Grade:' : 'Screening Grade:'} {screeningGrade}
                    </p>
                    {!gradesMatch && studentCurrentGrade && (
                      <p className='ml-6 text-sm text-gray-600'>
                        Student Current Grade: {studentCurrentGrade}
                      </p>
                    )}
                  </>
                )}
                {currentScreening.academic_year && (
                  <p className='ml-6 text-sm text-gray-600'>
                    Academic Year: {currentScreening.academic_year}
                  </p>
                )}
                <p className='ml-6 text-sm text-gray-600'>
                  School: {currentScreening.school_name || 'Unknown School'}
                </p>
              </div>
            </div>

            <div>
              <h3 className='mb-2 font-medium text-gray-900'>Screening Information</h3>
              <div className='space-y-1'>
                <p className='ml-2 text-sm text-gray-600'>Screener: {currentScreening.screener}</p>
                {currentScreening.screening_type && (
                  <p className='ml-2 text-sm text-gray-600'>
                    Screening Type:{' '}
                    {currentScreening.screening_type.charAt(0).toUpperCase() +
                      currentScreening.screening_type.slice(1)}
                  </p>
                )}
                <p className='ml-2 text-sm text-gray-600'>
                  Screening Date:{' '}
                  {format(parseDateSafely(currentScreening.created_at), 'MMM d, yyyy h:mm a')}
                </p>
                <p className='ml-2 text-sm text-gray-600'>
                  Updated:{' '}
                  {format(parseDateSafely(currentScreening.updated_at), 'MMM d, yyyy h:mm a')}
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
                        className='flex items-center gap-1 font-medium text-gray-700 bg-red-100'>
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
                  <Badge className='text-blue-800 bg-blue-100'>Vocabulary Support</Badge>
                )}
                {currentScreening.error_patterns?.add_areas_of_concern?.suspected_cas && (
                  <Badge className='text-purple-800 bg-purple-100'>Suspected CAS</Badge>
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
                        <div className='flex justify-end gap-2'>
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
                      <p className='p-3 text-sm text-gray-700 rounded-md bg-gray-50'>
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
                      <div className='flex justify-end gap-2'>
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
                    <p className='p-3 text-sm text-gray-700 rounded-md bg-gray-50'>
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
                    <div className='flex justify-end gap-2'>
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
                  <p className='p-3 text-sm text-gray-700 rounded-md bg-gray-50'>
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
