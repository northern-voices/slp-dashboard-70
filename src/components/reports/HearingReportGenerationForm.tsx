import { useForm } from 'react-hook-form'
import { useOrganization } from '@/contexts/OrganizationContext'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { edgeFunctionsApi } from '@/api/edgeFunctions'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Volume2, TrendingUp, CheckCircle, XCircle, Plus, List } from 'lucide-react'

const reportSchema = z.object({
  reportType: z.string().min(1, 'Please select a report type'),
  academicYear: z.string().min(1, 'Please select an academic year'),
  email: z.string().email('Please enter a valid email address'),
})

type ReportFormData = z.infer<typeof reportSchema>

const HearingReportGenerationForm = () => {
  const { currentSchool } = useOrganization()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'success' | 'error'>('success')
  const [modalMessage, setModalMessage] = useState('')

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth()

  const currentSchoolYear = currentMonth < 8 ? currentYear - 1 : currentYear
  const currentAcademicYear = `${currentSchoolYear}-${currentSchoolYear + 1}`

  const academicYears = [`${currentSchoolYear - 1}-${currentSchoolYear}`, currentAcademicYear]

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      reportType: '',
      academicYear: currentAcademicYear,
      email: '',
    },
  })

  const hearingReports = [
    {
      value: 'school-wide-hearing-reports',
      label: 'School Wide Hearing Reports',
      description: 'Create detailed hearing screening reports for all students',
      icon: Volume2,
      tooltip:
        'Produces comprehensive hearing screening reports for all students in the selected academic year.',
    },
    {
      value: 'school-summary-hearing-report',
      label: 'School Summary Hearing Report',
      description: 'Generate a school-wide summary of hearing screenings',
      icon: TrendingUp,
      tooltip: 'Summarizes school-wide hearing screenings with aggregate data and recommendations.',
    },
  ]

  const isSubmitting = form.formState.isSubmitting

  const onSubmit = async (data: ReportFormData) => {
    try {
      let result
      if (data.reportType === 'school-wide-hearing-reports') {
        result = await edgeFunctionsApi.schoolWideHearingReports(
          currentSchool.id,
          data.academicYear,
          data.email
        )
      } else if (data.reportType === 'school-summary-hearing-report') {
        result = await edgeFunctionsApi.schoolSummaryHearingReport(
          currentSchool.id,
          data.academicYear,
          data.email
        )
      }

      console.log(result, 'result')

      setModalType('success')
      setModalMessage(
        `Your ${
          hearingReports.find(type => type.value === data.reportType)?.label
        } is being generated. You'll receive an email at ${data.email} when it's ready.`
      )
      setIsSuccessModalOpen(true)
    } catch (error: unknown) {
      console.error('Error generating hearing report:', error)

      setModalType('error')

      if (data.reportType === 'school-wide-hearing-reports') {
        setModalMessage(
          `No hearing screenings found for the ${data.academicYear} academic year. Please ensure hearing screenings have been completed before generating this report.`
        )
      } else if (data.reportType === 'school-summary-hearing-report') {
        setModalMessage(
          `No hearing screening data found for the ${data.academicYear} academic year. Please ensure screenings have been completed before generating the school summary report.`
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
    form.reset()
  }

  const handleCloseModal = () => {
    setIsSuccessModalOpen(false)
    setModalType('success')
    setModalMessage('')
  }

  return (
    <TooltipProvider>
      <Card className='w-full max-w-full bg-white border border-gray-200 shadow-sm overflow-hidden'>
        <CardHeader className='pb-4 sm:pb-6 px-4 sm:px-6'>
          <CardTitle className='text-lg sm:text-xl font-semibold text-gray-900'>
            Generate School Wide Hearing Report
          </CardTitle>
          <p className='text-sm text-gray-600 mt-2 leading-relaxed'>
            Create comprehensive hearing screening reports for all students
          </p>
        </CardHeader>
        <CardContent className='px-4 sm:px-6 space-y-6'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <FormField
                control={form.control}
                name='academicYear'
                render={({ field }) => (
                  <FormItem className='space-y-3 w-full max-w-full'>
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
                          <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
                            {hearingReports.map(type => {
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
                                      <div className='flex items-start space-x-3 w-full'>
                                        <div
                                          className={`
                              flex-shrink-0 p-2 rounded-lg
                              ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}
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
                  <FormItem className='space-y-3 w-full max-w-full'>
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

              <div className='flex flex-col sm:flex-row gap-3 pt-6 w-full'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={handleClearForm}
                      className='h-9 w-full'
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
                      className='h-9 bg-blue-600 hover:bg-blue-700 text-white w-full'
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
                    <p>Create and email hearing screening reports</p>
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
          <div className='flex flex-col items-center text-center space-y-6'>
            <div className='flex justify-center'>
              {modalType === 'success' ? (
                <CheckCircle className='w-16 h-16 text-green-600' />
              ) : (
                <XCircle className='w-16 h-16 text-red-600' />
              )}
            </div>

            <div className='space-y-2'>
              <DialogTitle className='text-2xl font-semibold text-gray-900'>
                {modalType === 'success' ? 'Report Generation Started!' : 'Error Generating Report'}
              </DialogTitle>
              <DialogDescription className='text-gray-600 text-base leading-relaxed'>
                {modalMessage}
              </DialogDescription>
            </div>

            <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto'>
              {modalType === 'success' ? (
                <>
                  <Button
                    onClick={handleStayOnPage}
                    className='w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2'>
                    <Plus className='w-4 h-4' />
                    Generate Another Report
                  </Button>
                  <Button
                    onClick={handleGoBackToReports}
                    variant='outline'
                    className='w-full sm:w-auto px-6 py-2'>
                    <List className='w-4 h-4' />
                    Back to Reports
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleCloseModal}
                  className='w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2'>
                  Try Again
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}

export default HearingReportGenerationForm
