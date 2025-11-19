import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { User, FileText, X, Edit2, Save, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { Screening } from '@/types/database'
import { schoolGradesApi } from '@/api/schoolGrades'
import { studentsApi } from '@/api/students'

interface HearingScreeningDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  screening: Screening | null
}

const HearingScreeningDetailsModal = ({
  isOpen,
  onClose,
  screening,
}: HearingScreeningDetailsModalProps) => {
  const [isEditingClinicalNotes, setIsEditingClinicalNotes] = useState(false)
  const [isEditingReferralNotes, setIsEditingReferralNotes] = useState(false)
  const [clinicalNotesText, setClinicalNotesText] = useState('')
  const [referralNotesText, setReferralNotesText] = useState('')
  const [currentScreening, setCurrentScreening] = useState<Screening | null>(null)
  const [screeningGrade, setScreeningGrade] = useState<string>('N/A')
  const [studentCurrentGrade, setStudentCurrentGrade] = useState<string | null>(null)
  const [gradesMatch, setGradesMatch] = useState<boolean>(true)
  const [isLoadingGrades, setIsLoadingGrades] = useState(false)

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
    // TODO: Implement update mutation for hearing screenings
    setIsEditingClinicalNotes(false)
  }

  const handleCancelClinicalNotes = () => {
    setIsEditingClinicalNotes(false)
    setClinicalNotesText('')
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
    // TODO: Implement update mutation for hearing screenings
    setIsEditingReferralNotes(false)
  }

  const handleCancelReferralNotes = () => {
    setIsEditingReferralNotes(false)
    setReferralNotesText('')
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

  const getResultBadgeColor = (result: string | null | undefined) => {
    if (!result) return 'bg-gray-100 text-gray-800'

    switch (result) {
      case 'Normal':
        return 'bg-green-100 text-green-800'
      case 'High':
      case 'Low':
        return 'bg-yellow-100 text-yellow-800'
      case 'Immeasurable':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <div className='flex items-center justify-between'>
            <DialogTitle className='flex items-center gap-2'>
              <FileText className='w-5 h-5' />
              Hearing Screening Details
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
                  <span className='font-medium'>{currentScreening.student_name}</span>
                </div>
                {isLoadingGrades ? (
                  <div className='ml-6'>
                    <div className='animate-pulse bg-gray-200 h-5 w-32 rounded'></div>
                  </div>
                ) : (
                  <>
                    <p className='text-sm text-gray-600 ml-6'>
                      {gradesMatch ? 'Grade:' : 'Screening Grade:'} {screeningGrade}
                    </p>
                    {!gradesMatch && studentCurrentGrade && (
                      <p className='text-sm text-gray-600 ml-6'>
                        Student Current Grade: {studentCurrentGrade}
                      </p>
                    )}
                  </>
                )}
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
                <p className='text-sm text-gray-600 ml-2'>
                  Screening Date:{' '}
                  {format(new Date(currentScreening.created_at), 'MMM d, yyyy h:mm a')}
                </p>
                <p className='text-sm text-gray-600 ml-2'>
                  Updated: {format(new Date(currentScreening.updated_at), 'MMM d, yyyy h:mm a')}
                </p>
                {currentScreening.result && currentScreening.result !== '' && (
                  <div className='flex items-center gap-2 ml-2 mt-2'>
                    <span className='text-sm text-gray-600'>Result:</span>
                    <Badge variant='secondary'>
                      {currentScreening.result === 'absent' && 'Absent'}
                      {currentScreening.result === 'non_compliant' && 'Non Compliant'}
                      {currentScreening.result === 'complex_needs' && 'Complex Needs'}
                      {currentScreening.result === 'results_uncertain' && 'Results Uncertain'}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tympanometry Results */}
          <div className='space-y-4'>
            <h3 className='font-medium text-gray-900'>Tympanometry Results</h3>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Right Ear */}
              <div className='p-4 bg-blue-50 rounded-lg border border-blue-200'>
                <h4 className='font-medium text-blue-900 mb-3'>Right Ear</h4>
                <div className='space-y-3'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-gray-700'>Volume:</span>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium'>
                        {formatValue(
                          currentScreening.right_volume_db,
                          currentScreening.right_ear_volume_result,
                          'ml'
                        )}
                      </span>
                      <Badge
                        className={getResultBadgeColor(currentScreening.right_ear_volume_result)}>
                        {currentScreening.right_ear_volume_result || '-'}
                      </Badge>
                    </div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-gray-700'>Compliance:</span>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium'>
                        {formatValue(
                          currentScreening.right_compliance,
                          currentScreening.right_ear_compliance_result,
                          'ml'
                        )}
                      </span>
                      <Badge
                        className={getResultBadgeColor(
                          currentScreening.right_ear_compliance_result
                        )}>
                        {currentScreening.right_ear_compliance_result || '-'}
                      </Badge>
                    </div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-gray-700'>Pressure:</span>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium'>
                        {formatValue(
                          currentScreening.right_pressure,
                          currentScreening.right_ear_pressure_result,
                          'daPa'
                        )}
                      </span>
                      <Badge
                        className={getResultBadgeColor(currentScreening.right_ear_pressure_result)}>
                        {currentScreening.right_ear_pressure_result || '-'}
                      </Badge>
                    </div>
                  </div>
                  {currentScreening.right_ear_result && (
                    <div className='mt-3 pt-3 border-t border-blue-300'>
                      <span className='text-xs font-medium text-blue-900 block mb-1'>
                        Overall Result:
                      </span>
                      <p className='text-sm text-blue-800'>{currentScreening.right_ear_result}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Left Ear */}
              <div className='p-4 bg-purple-50 rounded-lg border border-purple-200'>
                <h4 className='font-medium text-purple-900 mb-3'>Left Ear</h4>
                <div className='space-y-3'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-gray-700'>Volume:</span>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium'>
                        {formatValue(
                          currentScreening.left_volume_db,
                          currentScreening.left_ear_volume_result,
                          'ml'
                        )}
                      </span>
                      <Badge
                        className={getResultBadgeColor(currentScreening.left_ear_volume_result)}>
                        {currentScreening.left_ear_volume_result || '-'}
                      </Badge>
                    </div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-gray-700'>Compliance:</span>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium'>
                        {formatValue(
                          currentScreening.left_compliance,
                          currentScreening.left_ear_compliance_result,
                          'ml'
                        )}
                      </span>
                      <Badge
                        className={getResultBadgeColor(
                          currentScreening.left_ear_compliance_result
                        )}>
                        {currentScreening.left_ear_compliance_result || '-'}
                      </Badge>
                    </div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-gray-700'>Pressure:</span>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium'>
                        {formatValue(
                          currentScreening.left_pressure,
                          currentScreening.left_ear_pressure_result,
                          'daPa'
                        )}
                      </span>
                      <Badge
                        className={getResultBadgeColor(currentScreening.left_ear_pressure_result)}>
                        {currentScreening.left_ear_pressure_result || '-'}
                      </Badge>
                    </div>
                  </div>
                  {currentScreening.left_ear_result && (
                    <div className='mt-3 pt-3 border-t border-purple-300'>
                      <span className='text-xs font-medium text-purple-900 block mb-1'>
                        Overall Result:
                      </span>
                      <p className='text-sm text-purple-800'>{currentScreening.left_ear_result}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Notes */}
          {(currentScreening.clinical_notes || isEditingClinicalNotes) && (
            <div className='space-y-4'>
              <div>
                <div className='flex items-center justify-between mb-2'>
                  <h3 className='font-medium text-gray-900'>Clinical Notes</h3>
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
            </div>
          )}

          {/* Referral Notes */}
          {(currentScreening.referral_notes || isEditingReferralNotes) && (
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

export default HearingScreeningDetailsModal
