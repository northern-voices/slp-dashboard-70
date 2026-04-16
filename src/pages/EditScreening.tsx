import { useEditScreening } from '@/hooks/screenings/use-edit-screening'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FileText, Calendar, Save, Edit } from 'lucide-react'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import EnhancedSpeechScreeningFields from '@/components/screening/speech/EnhancedSpeechScreeningFields'
import EditStudentDialog from '@/components/screening/EditStudentDialog'
import CollapsibleNotesCard from '@/components/screening/CollapsibleNotesCard'

const EditScreeningContent = () => {
  const {
    form,
    screening,
    screeningGrade,
    studentCurrentGrade,
    gradesMatch,
    loading,
    saving,
    isEditingStudent,
    editedFirstName,
    editedLastName,
    editedGradeId,
    availableGrades,
    isLoadingGrades,
    clinicalNotesOpen,
    referralNotesOpen,
    progressNotesOpen,
    setEditedFirstName,
    setEditedLastName,
    setEditedGradeId,
    setClinicalNotesOpen,
    setReferralNotesOpen,
    setProgressNotesOpen,
    handleGoBack,
    handleSave,
    handleEditStudent,
    handleSaveStudent,
    handleCancelEditStudent,
  } = useEditScreening()

  if (loading) return <LoadingSpinner />

  if (!screening) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='text-center'>
          <h2 className='text-2xl font-semibold text-gray-900'>Screening not found</h2>
          <p className='text-gray-600 mt-2'>The screening you're looking for doesn't exist.</p>
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

      <div className='bg-white rounded-lg border border-gray-200 shadow-sm'>
        <div className='p-6'>
          <div className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Calendar className='w-5 h-5' />
                  Screening Details
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='mb-4 py-3 px-5 bg-blue-50 rounded-lg border border-blue-200'>
                  <div className='flex items-center justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-medium text-blue-900'>Student Name:</span>
                        <span className='text-sm font-semibold text-blue-800'>
                          {screening.student_name}
                        </span>
                      </div>
                      <div className='flex items-center gap-2 mt-1'>
                        <span className='text-sm font-medium text-blue-900'>
                          {gradesMatch ? 'Grade:' : 'Screening Grade:'}
                        </span>
                        <span className='text-sm font-semibold text-blue-800'>
                          {screeningGrade}
                        </span>
                      </div>
                      {!gradesMatch && studentCurrentGrade && (
                        <div className='flex items-center gap-2 mt-1'>
                          <span className='text-sm font-medium text-blue-900'>
                            Student Current Grade:
                          </span>
                          <span className='text-sm font-semibold text-blue-800'>
                            {studentCurrentGrade}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={handleEditStudent}
                      className='ml-4'>
                      <Edit className='w-4 h-4 mr-2' />
                      Edit Student
                    </Button>
                  </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='screening_type' className='mb-2 block'>
                      Screening Type <span className='text-red-500 text-lg'>*</span>
                    </Label>
                    <Select
                      value={form.watch('screening_type')}
                      onValueChange={value => form.setValue('screening_type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder='Select screening type' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='initial'>Initial</SelectItem>
                        <SelectItem value='progress'>Progress</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor='screening_date' className='mb-2 block'>
                      Screening Date <span className='text-red-500 text-lg'>*</span>
                    </Label>
                    <Input
                      type='text'
                      value={form.watch('screening_date')}
                      readOnly
                      className='bg-gray-50 cursor-not-allowed'
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <EnhancedSpeechScreeningFields form={form} />

            <CollapsibleNotesCard
              title='Clinical Notes (Private) - Not shown on reports'
              open={clinicalNotesOpen}
              onToggle={() => setClinicalNotesOpen(!clinicalNotesOpen)}>
              <div>
                <Label htmlFor='clinical_notes'>Clinical Observations</Label>
                <Textarea
                  {...form.register('clinical_notes')}
                  placeholder='Enter clinical observations and notes...'
                  rows={4}
                  className='mt-2'
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.ctrlKey) e.stopPropagation()
                  }}
                />
              </div>
            </CollapsibleNotesCard>

            <CollapsibleNotesCard
              title='Recommendations and Referrals (Reports) - Show on summary report'
              open={referralNotesOpen}
              onToggle={() => setReferralNotesOpen(!referralNotesOpen)}>
              <Textarea
                {...form.register('referral_notes')}
                placeholder='OT or Comprehensive Language Evaluation or Fluency Evaluation, etc.'
                rows={4}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.ctrlKey) e.stopPropagation()
                }}
              />
            </CollapsibleNotesCard>

            <CollapsibleNotesCard
              title='Progress Notes - Show on progress report'
              open={progressNotesOpen}
              onToggle={() => setProgressNotesOpen(!progressNotesOpen)}>
              <Textarea
                {...form.register('progress_notes')}
                placeholder='EA / Teacher Feedback or progress noted (vocabulary), participation'
                rows={4}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.ctrlKey) e.stopPropagation()
                }}
              />
            </CollapsibleNotesCard>

            <div className='flex gap-2 pt-4'>
              <Button variant='outline' onClick={handleGoBack} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className='w-4 h-4 mr-2' />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <EditStudentDialog
        open={isEditingStudent}
        editedFirstName={editedFirstName}
        editedLastName={editedLastName}
        editedGradeId={editedGradeId}
        availableGrades={availableGrades}
        isLoadingGrades={isLoadingGrades}
        onFirstNameChange={setEditedFirstName}
        onLastNameChange={setEditedLastName}
        onGradeChange={setEditedGradeId}
        onSave={handleSaveStudent}
        onCancel={handleCancelEditStudent}
      />
    </div>
  )
}

const EditScreening = () => <EditScreeningContent />

export default EditScreening
