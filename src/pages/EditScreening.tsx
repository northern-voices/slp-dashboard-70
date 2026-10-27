import { useEditScreening } from '@/hooks/screenings/use-edit-screening'
import { Button } from '@/components/ui/button'
import { FileText, Save } from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ProgressIndicator from '@/components/screening/shared/ProgressIndicator'
import EditScreeningStep1 from '@/components/screening/speech/steps/EditScreeningStep1'
import EditScreeningStep2 from '@/components/screening/speech/steps/EditScreeningStep2'

const stepTitles = ['Student Info', 'Screening Details & Results']

const EditScreeningContent = () => {
  const {
    form,
    screening,
    loading,
    saving,
    currentStep,
    firstName,
    lastName,
    selectedGrade,
    clinicalNotesOpen,
    referralNotesOpen,
    progressNotesOpen,
    setFirstName,
    setLastName,
    setSelectedGrade,
    setClinicalNotesOpen,
    setReferralNotesOpen,
    setProgressNotesOpen,
    handleGoBack,
    handleNext,
    handlePrevious,
    canProceedToNext,
    handleSave,
  } = useEditScreening()

  if (loading) return <LoadingSpinner />

  if (!screening) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='text-center'>
          <h2 className='text-2xl font-semibold text-gray-900'>Screening not found</h2>
          <p className='mt-2 text-gray-600'>The screening you're looking for doesn't exist.</p>
          <Button onClick={handleGoBack} className='mt-4'>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='flex-1 p-4 md:p-6 lg:p-8'>
      <div className='flex items-center gap-3 mb-6'>
        <FileText className='w-6 h-6' />
        <div>
          <h1 className='text-2xl font-semibold'>Edit Screening</h1>
          <p className='text-gray-600'>
            Editing {screening.screening_type} screening for {screening.student_name}
          </p>
        </div>
      </div>

      <div className='bg-white border border-gray-200 rounded-lg shadow-sm'>
        <div className='p-6'>
          <ProgressIndicator currentStep={currentStep} totalSteps={2} stepTitles={stepTitles} />

          {currentStep === 1 ? (
            <EditScreeningStep1
              form={form}
              firstName={firstName}
              lastName={lastName}
              onFirstNameChange={setFirstName}
              onLastNameChange={setLastName}
              selectedGrade={selectedGrade}
              onGradeChange={setSelectedGrade}
            />
          ) : (
            <EditScreeningStep2
              form={form}
              firstName={firstName}
              lastName={lastName}
              selectedGrade={selectedGrade}
              clinicalNotesOpen={clinicalNotesOpen}
              referralNotesOpen={referralNotesOpen}
              progressNotesOpen={progressNotesOpen}
              onClinicalNotesToggle={() => setClinicalNotesOpen(!clinicalNotesOpen)}
              onReferralNotesToggle={() => setReferralNotesOpen(!referralNotesOpen)}
              onProgressNotesToggle={() => setProgressNotesOpen(!progressNotesOpen)}
            />
          )}

          <div className='flex items-center justify-between gap-2 pt-6 mt-6 border-t'>
            <div className='flex gap-2'>
              <Button variant='outline' onClick={handleGoBack} disabled={saving}>
                Cancel
              </Button>
              {currentStep === 2 && (
                <Button variant='outline' onClick={handlePrevious} disabled={saving}>
                  Previous
                </Button>
              )}
            </div>

            {currentStep === 1 ? (
              <Button onClick={handleNext} disabled={!canProceedToNext()}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={saving}>
                <Save className='w-4 h-4 mr-2' />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const EditScreening = () => <EditScreeningContent />

export default EditScreening
