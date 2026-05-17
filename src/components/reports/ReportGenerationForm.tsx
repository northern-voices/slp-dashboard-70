import { useForm } from 'react-hook-form'
import { useOrganization } from '@/contexts/OrganizationContext'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Volume2, Mic, Target, TrendingUp, CheckCircle, XCircle, Plus, List } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { edgeFunctionsApi } from '@/api/edgeFunctions'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const reportSchema = z.object({
  reportType: z.string().min(1, 'Please select a report type'),
  academicYear: z.string().min(1, 'Please select an academic year'),
  email: z.string().email('Please enter a valid email address'),
})

type ReportFormData = z.infer<typeof reportSchema>

const ReportGenerationForm = () => {
  const { currentSchool } = useOrganization()

  const navigate = useNavigate()

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'success' | 'error'>('success')
  const [modalMessage, setModalMessage] = useState('')

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() // 0-11, where 0 is January

  // Determine current school year: if we're before September, we're in the previous school year
  // If we're September or later, we're in the current school year
  const currentSchoolYear = currentMonth < 8 ? currentYear - 1 : currentYear
  const currentAcademicYear = `${currentSchoolYear}-${currentSchoolYear + 1}`

  // Generate academic years with previous years first, then current year
  const academicYears = [`${currentSchoolYear - 1}-${currentSchoolYear}`, currentAcademicYear]

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reportType: '',
      academicYear: currentAcademicYear,
      email: '',
    },
  })

  const initialReports = [
    {
      value: 'initial-speech-reports',
      label: 'Initial Speech Reports (School Wide)',
      description: 'Create detailed speech assessment reports covering multiple students',
      icon: Mic,
      tooltip:
        'Produces comprehensive speech screening reports with articulation assessments, language evaluations, and therapy recommendations.',
    },
    {
      value: 'school-summary-report',
      label: 'Summary Report (School Wide)',
      description:
        'Generate a school-wide snapshot of screenings with qualified students and recommendations.',
      icon: Volume2,
      tooltip:
        'Summarizes school-wide speech screenings, showing qualified students, subs, and recommendations to guide follow-up and planning.',
    },
  ]

  const progressReports = [
    {
      value: 'progress-speech-reports',
      label: 'Progress Speech Reports (School Wide)',
      description: 'Generate progress summaries showing student achievements and therapy outcomes',
      icon: TrendingUp,
      tooltip:
        'Creates comprehensive progress reports highlighting improvements, challenges, and next steps for continued therapy.',
    },
  ]

  const isSubmitting = form.formState.isSubmitting

  const onSubmit = async (data: ReportFormData) => {
    console.log(data, 'data from the form')

    try {
      console.log('Generating report with data:', data.reportType)

      let result
      if (data.reportType === 'initial-speech-reports') {
        result = await edgeFunctionsApi.schoolWideSendStudentReports(
          currentSchool.id,
          data.academicYear,
          data.email
        )
      } else if (data.reportType === 'school-summary-report') {
        result = await edgeFunctionsApi.schoolSummaryReport(
          currentSchool.id,
          data.academicYear,
          data.email
        )
      } else if (data.reportType === 'progress-speech-reports') {
        result = await edgeFunctionsApi.schoolWideStudentProgressReport(
          currentSchool.id,
          data.academicYear,
          data.email
        )
      }

      console.log(result, 'result')

      const allReports = [...initialReports, ...progressReports]

      // Show success modal
      setModalType('success')
      setModalMessage(
        `Your ${
          allReports.find(type => type.value === data.reportType)?.label
        } is being generated. You'll receive an email at ${data.email} when it's ready.`
      )
      setIsSuccessModalOpen(true)
    } catch (error: unknown) {
      console.error('Error generating report:', error)

      // Provide specific error messages based on report type
      setModalType('error')

      if (data.reportType === 'initial-speech-reports') {
        setModalMessage(
          `No speech screenings found for the ${data.academicYear} academic year. Please ensure speech screenings have been completed before generating this report.`
        )
      } else if (data.reportType === 'school-summary-report') {
        setModalMessage(
          `No screening data found for the ${data.academicYear} academic year. Please ensure screenings have been completed before generating the school summary report.`
        )
      } else if (data.reportType === 'progress-speech-reports') {
        setModalMessage(
          `No progress data found for the ${data.academicYear} academic year. Please ensure student progress has been tracked before generating this report.`
        )
      } else {
        setModalMessage('Failed to generate report. Please try again.')
      }

      setIsSuccessModalOpen(true)
    }
  }

  const handleClearForm = () => {
    form.reset()
  }

  const handleGoBackToReports = () => {
    setIsSuccessModalOpen(false)
    setModalType('success')
    setModalMessage('')
    navigate(`/school/${currentSchool.id}/speech-screening-reports`)
  }

  const handleStayOnPage = () => {
    setIsSuccessModalOpen(false)
    setModalType('success')
    setModalMessage('')
    // Reset form after successful submission
    form.reset()
  }

  const handleCloseModal = () => {
    setIsSuccessModalOpen(false)
    setModalType('success')
    setModalMessage('')
  }

  return (
    <TooltipProvider>
      <Card className='w-full max-w-full overflow-hidden bg-white border border-gray-200 shadow-sm'>
        <CardHeader className='px-4 pb-4 sm:pb-6 sm:px-6'>
          <CardTitle className='text-lg font-semibold text-gray-900 sm:text-xl'>
            Generate School Wide Report
          </CardTitle>
          <p className='mt-2 text-sm leading-relaxed text-gray-600'>
            Create comprehensive reports for multiple students
          </p>
        </CardHeader>
        <CardContent className='px-4 space-y-6 sm:px-6'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <FormField
                control={form.control}
                name='academicYear'
                render={({ field }) => (
                  <FormItem className='w-full max-w-full space-y-3'>
                    <FormLabel className='text-sm font-medium text-gray-700'>
                      Select Academic Year
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Select academic year' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {academicYears.map(year => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='reportType'
                render={({ field }) => (
                  <FormItem className='space-y-3'>
                    <FormLabel className='text-sm font-medium text-gray-700'>
                      Select Type of Report
                    </FormLabel>
                    <FormControl>
                      <div className='space-y-4'>
                        <div className='space-y-3'>
                          <div className='grid grid-cols-1 gap-3 lg:grid-cols-3'>
                            {initialReports.map(type => {
                              const Icon = type.icon
                              const isSelected = field.value === type.value
                              return (
                                <Tooltip key={type.value}>
                                  <TooltipTrigger asChild>
                                    <div
                                      onClick={() => {
                                        if (isSelected) {
                                          field.onChange('')
                                        } else {
                                          field.onChange(type.value)
                                        }
                                      }}
                                      className={`
                                        relative cursor-pointer rounded-lg border-2 p-3 sm:p-4 transition-all duration-200 w-full
                                        ${
                                          isSelected
                                            ? 'border-blue-600 bg-blue-50 shadow-sm'
                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                        }
                                      `}>
                                      <div className='flex items-start w-full space-x-3'>
                                        <div
                                          className={`
                                          flex-shrink-0 p-2 rounded-lg
                                          ${
                                            isSelected
                                              ? 'bg-blue-600 text-white'
                                              : 'bg-gray-100 text-gray-600'
                                          }
                                        `}>
                                          <Icon className='w-4 h-4' />
                                        </div>
                                        <div className='flex-1 min-w-0 overflow-hidden'>
                                          <h3
                                            className={`
                                            text-sm font-medium leading-tight truncate
                                            ${isSelected ? 'text-blue-900' : 'text-gray-900'}
                                          `}>
                                            {type.label}
                                          </h3>
                                          <p
                                            className={`
                                            text-xs mt-1 leading-tight
                                            ${isSelected ? 'text-blue-700' : 'text-gray-500'}
                                          `}>
                                            {type.description}
                                          </p>
                                        </div>
                                      </div>
                                      {isSelected && (
                                        <div className='absolute top-2 right-2'>
                                          <div className='w-2 h-2 bg-blue-600 rounded-full'></div>
                                        </div>
                                      )}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side='top' className='max-w-xs'>
                                    <p>{type.tooltip}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )
                            })}
                          </div>
                          <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
                            {progressReports.map(type => {
                              const Icon = type.icon
                              const isSelected = field.value === type.value
                              return (
                                <Tooltip key={type.value}>
                                  <TooltipTrigger asChild>
                                    <div
                                      onClick={() => {
                                        if (isSelected) {
                                          field.onChange('')
                                        } else {
                                          field.onChange(type.value)
                                        }
                                      }}
                                      className={`
                                        relative cursor-pointer rounded-lg border-2 p-3 sm:p-4 transition-all duration-200 w-full
                                        ${
                                          isSelected
                                            ? 'border-blue-600 bg-blue-50 shadow-sm'
                                            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                        }
                                      `}>
                                      <div className='flex items-start w-full space-x-3'>
                                        <div
                                          className={`
                                          flex-shrink-0 p-2 rounded-lg
                                          ${
                                            isSelected
                                              ? 'bg-blue-600 text-white'
                                              : 'bg-gray-100 text-gray-600'
                                          }
                                        `}>
                                          <Icon className='w-4 h-4' />
                                        </div>
                                        <div className='flex-1 min-w-0 overflow-hidden'>
                                          <h3
                                            className={`
                                            text-sm font-medium leading-tight truncate
                                            ${isSelected ? 'text-blue-900' : 'text-gray-900'}
                                          `}>
                                            {type.label}
                                          </h3>
                                          <p
                                            className={`
                                            text-xs mt-1 leading-tight
                                            ${isSelected ? 'text-blue-700' : 'text-gray-500'}
                                          `}>
                                            {type.description}
                                          </p>
                                        </div>
                                      </div>
                                      {isSelected && (
                                        <div className='absolute top-2 right-2'>
                                          <div className='w-2 h-2 bg-blue-600 rounded-full'></div>
                                        </div>
                                      )}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side='top' className='max-w-xs'>
                                    <p>{type.tooltip}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='w-full max-w-full space-y-3'>
                    <FormLabel className='text-sm font-medium text-gray-700'>Email</FormLabel>
                    <FormControl>
                      <Input
                        type='email'
                        placeholder='Enter email address'
                        className='w-full'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex flex-col w-full gap-3 pt-6 sm:flex-row'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={handleClearForm}
                      className='w-full h-9'
                      disabled={isSubmitting}>
                      Clear Form
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reset all form fields to start over</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type='submit'
                      variant='default'
                      className='w-full text-white bg-blue-600 h-9 hover:bg-blue-700'
                      disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <LoadingSpinner size='sm' className='mr-2' />
                          Sending...
                        </>
                      ) : (
                        'Send Reports'
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Create and email the selected report type with your specified criteria</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Success/Error Modal */}
      <Dialog open={isSuccessModalOpen} onOpenChange={() => {}}>
        <DialogContent className='mx-auto'>
          <div className='flex flex-col items-center space-y-6 text-center'>
            {/* Icon */}
            <div className='flex justify-center'>
              {modalType === 'success' ? (
                <CheckCircle className='w-16 h-16 text-green-600' />
              ) : (
                <XCircle className='w-16 h-16 text-red-600' />
              )}
            </div>

            {/* Title and Description */}
            <div className='space-y-2'>
              <DialogTitle className='text-2xl font-semibold text-gray-900'>
                {modalType === 'success' ? 'Report Generation Started!' : 'Error Generating Report'}
              </DialogTitle>
              <DialogDescription className='text-base leading-relaxed text-gray-600'>
                {modalMessage}
              </DialogDescription>
            </div>

            {/* Action Buttons */}
            <div className='flex flex-col w-full gap-3 sm:flex-row sm:w-auto'>
              {modalType === 'success' ? (
                <>
                  <Button
                    onClick={handleStayOnPage}
                    className='w-full px-6 py-2 sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground'>
                    <Plus className='w-4 h-4' />
                    Generate Another Report
                  </Button>
                  <Button
                    onClick={handleGoBackToReports}
                    variant='outline'
                    className='w-full px-6 py-2 sm:w-auto'>
                    <List className='w-4 h-4' />
                    Back to Reports
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleCloseModal}
                  className='w-full px-6 py-2 sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground'>
                  Continue
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}

export default ReportGenerationForm
