import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRedirectOnSchoolChange } from '@/hooks/use-redirect-on-school-change'
import { FileText, Calendar, Save, Volume2, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useUpdateHearingScreening } from '@/hooks/screenings/use-screening-hearing-mutations'
import { useHearingScreeningById } from '@/hooks/screenings/use-hearing-screenings'
import LoadingSpinner from '@/components/common/LoadingSpinner'

interface HearingEditFormValues {
  right_vol: string
  right_compliance: string
  right_press: string
  left_vol: string
  left_compliance: string
  left_press: string
  result: string
  clinical_notes: string
  referral_notes: string
}

const EditHearingScreeningContent = () => {
  const { screeningId } = useParams<{ screeningId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  // Immeasurable checkbox state
  const [rightVolImmeasurable, setRightVolImmeasurable] = useState(false)
  const [rightCompImmeasurable, setRightCompImmeasurable] = useState(false)
  const [rightPressImmeasurable, setRightPressImmeasurable] = useState(false)
  const [leftVolImmeasurable, setLeftVolImmeasurable] = useState(false)
  const [leftCompImmeasurable, setLeftCompImmeasurable] = useState(false)
  const [leftPressImmeasurable, setLeftPressImmeasurable] = useState(false)

  const updateHearingScreening = useUpdateHearingScreening()
  const queryClient = useQueryClient()

  useRedirectOnSchoolChange('/screenings')

  const form = useForm<HearingEditFormValues>({
    defaultValues: {
      right_vol: '',
      right_compliance: '',
      right_press: '',
      left_vol: '',
      left_compliance: '',
      left_press: '',
      result: '',
      clinical_notes: '',
      referral_notes: '',
    },
  })

  const { data: screening, isLoading, isError } = useHearingScreeningById(screeningId)

  useEffect(() => {
    if (!screening) return

    setRightVolImmeasurable(screening.right_volume_db === null)
    setRightCompImmeasurable(screening.right_compliance === null)
    setRightPressImmeasurable(screening.right_pressure === null)
    setLeftVolImmeasurable(screening.left_volume_db === null)
    setLeftCompImmeasurable(screening.left_compliance === null)
    setLeftPressImmeasurable(screening.left_pressure === null)

    form.reset({
      right_vol: screening.right_volume_db != null ? String(screening.right_volume_db) : '',
      right_compliance:
        screening.right_compliance != null ? String(screening.right_compliance) : '',
      right_press: screening.right_pressure != null ? String(screening.right_pressure) : '',
      left_vol: screening.left_volume_db != null ? String(screening.left_volume_db) : '',
      left_compliance: screening.left_compliance != null ? String(screening.left_compliance) : '',
      left_press: screening.left_pressure != null ? String(screening.left_pressure) : '',
      result: screening.result || '',
      clinical_notes: screening.clinical_notes || '',
      referral_notes: screening.referral_notes || '',
    })
  }, [screening])

  const handleGoBack = () => navigate(-1)

  const handleSave = async () => {
    if (!screening) return
    setSaving(true)

    try {
      const formData = form.getValues()

      await updateHearingScreening.mutateAsync({
        id: screening.id,
        data: {
          right_volume_db: rightVolImmeasurable
            ? null
            : formData.right_vol !== ''
              ? parseFloat(formData.right_vol)
              : null,
          right_compliance: rightCompImmeasurable
            ? null
            : formData.right_compliance !== ''
              ? parseFloat(formData.right_compliance)
              : null,
          right_pressure: rightPressImmeasurable
            ? null
            : formData.right_press !== ''
              ? parseInt(formData.right_press)
              : null,
          left_volume_db: leftVolImmeasurable
            ? null
            : formData.left_vol !== ''
              ? parseFloat(formData.left_vol)
              : null,
          left_compliance: leftCompImmeasurable
            ? null
            : formData.left_compliance !== ''
              ? parseFloat(formData.left_compliance)
              : null,
          left_pressure: leftPressImmeasurable
            ? null
            : formData.left_press !== ''
              ? parseInt(formData.left_press)
              : null,
          result: formData.result || null,
          clinical_notes: formData.clinical_notes || null,
          referral_notes: formData.referral_notes || null,
        },
      })

      queryClient.invalidateQueries({ queryKey: ['hearing-screenings'] })
      queryClient.invalidateQueries({ queryKey: ['screenings'] })

      toast({
        title: 'Success',
        description: 'Hearing screening updated successfully',
        variant: 'default',
      })

      handleGoBack()
    } catch (error) {
      console.error('Failed to update hearing screening:', error)
      toast({
        title: 'Error',
        description: 'Failed to update screening',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) return <LoadingSpinner />

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

  const screeningDate = screening.created_at
    ? format(new Date(screening.created_at), 'yyyy-MM-dd')
    : 'N/A'

  return (
    <div className='flex flex-1 flex-col gap-4 p-4 pt-0'>
      <div className='min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min'>
        <div className='p-6'>
          <div className='flex items-center gap-3 mb-6'>
            <FileText className='w-6 h-6' />
            <div>
              <h1 className='text-2xl font-semibold'>Edit Hearing Screening</h1>
              <p className='text-gray-600'>
                Editing hearing screening for {screening.student_name}
              </p>
            </div>
          </div>

          <div className='space-y-6'>
            {/* Screening Details */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Calendar className='w-5 h-5' />
                  Screening Details
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='mb-4 py-3 px-5 bg-blue-50 rounded-lg border border-blue-200'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-medium text-blue-900'>Student Name:</span>
                    <span className='text-sm font-semibold text-blue-800'>
                      {screening.student_name}
                    </span>
                  </div>
                  <div className='flex items-center gap-2 mt-1'>
                    <span className='text-sm font-medium text-blue-900'>Grade:</span>
                    <span className='text-sm font-semibold text-blue-800'>{screening.grade}</span>
                  </div>
                </div>

                <div>
                  <Label className='mb-2 block'>Screening Date</Label>
                  <Input
                    type='text'
                    value={screeningDate}
                    readOnly
                    className='bg-gray-50 cursor-not-allowed'
                  />
                </div>

                {/* Screening Result */}
                <div>
                  <Label className='mb-2 block'>Screening Result</Label>
                  <div className='relative'>
                    <Select
                      value={form.watch('result') || ''}
                      onValueChange={value =>
                        form.setValue('result', value === 'none' ? '' : value)
                      }>
                      <SelectTrigger>
                        <SelectValue placeholder='Select result (optional)' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='absent'>Absent</SelectItem>
                        <SelectItem value='non_compliant'>Non Compliant</SelectItem>
                        <SelectItem value='complex_needs'>Complex Needs</SelectItem>
                        <SelectItem value='results_uncertain'>Results Uncertain</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.watch('result') && (
                      <button
                        type='button'
                        onClick={() => form.setValue('result', '')}
                        className='absolute right-8 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full
  transition-colors'>
                        <X className='w-4 h-4 text-gray-500' />
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tympanometry Results */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Volume2 className='w-5 h-5' />
                  Tympanometry Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  {/* Right Ear */}
                  <div>
                    <h4 className='font-medium mb-3'>Right Ear</h4>
                    <div className='space-y-3'>
                      <div>
                        <Label className='text-sm font-medium text-gray-700'>R+ Volume (ml)</Label>
                        <Input
                          type='number'
                          step='0.01'
                          placeholder='0.0'
                          {...form.register('right_vol')}
                          disabled={rightVolImmeasurable}
                        />
                        <div className='flex items-center space-x-2 mt-2'>
                          <Checkbox
                            id='right_vol_immeasurable'
                            checked={rightVolImmeasurable}
                            onCheckedChange={checked => {
                              setRightVolImmeasurable(checked as boolean)
                              if (checked) form.setValue('right_vol', '')
                            }}
                          />
                          <label
                            htmlFor='right_vol_immeasurable'
                            className='text-sm text-gray-600 cursor-pointer'>
                            Immeasurable
                          </label>
                        </div>
                      </div>
                      <div>
                        <Label className='text-sm font-medium text-gray-700'>
                          R+ Compliance (ml)
                        </Label>
                        <Input
                          type='number'
                          step='0.01'
                          placeholder='0.0'
                          {...form.register('right_compliance')}
                          disabled={rightCompImmeasurable}
                        />
                        <div className='flex items-center space-x-2 mt-2'>
                          <Checkbox
                            id='right_comp_immeasurable'
                            checked={rightCompImmeasurable}
                            onCheckedChange={checked => {
                              setRightCompImmeasurable(checked as boolean)
                              if (checked) form.setValue('right_compliance', '')
                            }}
                          />
                          <label
                            htmlFor='right_comp_immeasurable'
                            className='text-sm text-gray-600 cursor-pointer'>
                            Immeasurable
                          </label>
                        </div>
                      </div>
                      <div>
                        <Label className='text-sm font-medium text-gray-700'>
                          R+ Pressure (daPa)
                        </Label>
                        <Input
                          type='number'
                          step='1'
                          placeholder='0'
                          {...form.register('right_press')}
                          disabled={rightPressImmeasurable}
                        />
                        <div className='flex items-center space-x-2 mt-2'>
                          <Checkbox
                            id='right_press_immeasurable'
                            checked={rightPressImmeasurable}
                            onCheckedChange={checked => {
                              setRightPressImmeasurable(checked as boolean)
                              if (checked) form.setValue('right_press', '')
                            }}
                          />
                          <label
                            htmlFor='right_press_immeasurable'
                            className='text-sm text-gray-600 cursor-pointer'>
                            Immeasurable
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Left Ear */}
                  <div>
                    <h4 className='font-medium mb-3'>Left Ear</h4>
                    <div className='space-y-3'>
                      <div>
                        <Label className='text-sm font-medium text-gray-700'>L+ Volume (ml)</Label>
                        <Input
                          type='number'
                          step='0.01'
                          placeholder='0.0'
                          {...form.register('left_vol')}
                          disabled={leftVolImmeasurable}
                        />
                        <div className='flex items-center space-x-2 mt-2'>
                          <Checkbox
                            id='left_vol_immeasurable'
                            checked={leftVolImmeasurable}
                            onCheckedChange={checked => {
                              setLeftVolImmeasurable(checked as boolean)
                              if (checked) form.setValue('left_vol', '')
                            }}
                          />
                          <label
                            htmlFor='left_vol_immeasurable'
                            className='text-sm text-gray-600 cursor-pointer'>
                            Immeasurable
                          </label>
                        </div>
                      </div>
                      <div>
                        <Label className='text-sm font-medium text-gray-700'>
                          L+ Compliance (ml)
                        </Label>
                        <Input
                          type='number'
                          step='0.01'
                          placeholder='0.0'
                          {...form.register('left_compliance')}
                          disabled={leftCompImmeasurable}
                        />
                        <div className='flex items-center space-x-2 mt-2'>
                          <Checkbox
                            id='left_comp_immeasurable'
                            checked={leftCompImmeasurable}
                            onCheckedChange={checked => {
                              setLeftCompImmeasurable(checked as boolean)
                              if (checked) form.setValue('left_compliance', '')
                            }}
                          />
                          <label
                            htmlFor='left_comp_immeasurable'
                            className='text-sm text-gray-600 cursor-pointer'>
                            Immeasurable
                          </label>
                        </div>
                      </div>
                      <div>
                        <Label className='text-sm font-medium text-gray-700'>
                          L+ Pressure (daPa)
                        </Label>
                        <Input
                          type='number'
                          step='1'
                          placeholder='0'
                          {...form.register('left_press')}
                          disabled={leftPressImmeasurable}
                        />
                        <div className='flex items-center space-x-2 mt-2'>
                          <Checkbox
                            id='left_press_immeasurable'
                            checked={leftPressImmeasurable}
                            onCheckedChange={checked => {
                              setLeftPressImmeasurable(checked as boolean)
                              if (checked) form.setValue('left_press', '')
                            }}
                          />
                          <label
                            htmlFor='left_press_immeasurable'
                            className='text-sm text-gray-600 cursor-pointer'>
                            Immeasurable
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Clinical Notes (Private)</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <Label className='mb-2 block'>Clinical Observations</Label>
                  <Textarea
                    {...form.register('clinical_notes')}
                    placeholder='Enter clinical observations and notes...'
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations and Referrals (Reports)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  {...form.register('referral_notes')}
                  placeholder='Enter recommendations and referrals...'
                  rows={4}
                />
              </CardContent>
            </Card>

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
    </div>
  )
}

const EditHearingScreening = () => (
  <div className='min-h-screen bg-gray-50'>
    <EditHearingScreeningContent />
  </div>
)

export default EditHearingScreening
