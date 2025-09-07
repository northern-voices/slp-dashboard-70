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
import { Volume2, Mic, Target, TrendingUp } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { ReportService } from '@/services/reportService'
import { edgeFunctionsApi } from '@/api/edgeFunctions'

const reportSchema = z.object({
  reportType: z.string().min(1, 'Please select a report type'),
  academicYear: z.string().min(1, 'Please select an academic year'),
  email: z.string().email('Please enter a valid email address'),
})

type ReportFormData = z.infer<typeof reportSchema>

const ReportGenerationForm = () => {
  const { currentSchool } = useOrganization()
  const { toast } = useToast()

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

  const screeningReports = [
    {
      value: 'speech-screens',
      label: 'Class Wide Speech Screens',
      description:
        'Create detailed speech assessment reports covering multiple students in a class',
      icon: Mic,
      tooltip:
        'Produces comprehensive speech screening reports with articulation assessments, language evaluations, and therapy recommendations. Perfect for SLPs and special education teams.',
      group: 'screening',
    },
    {
      value: 'goal-sheets',
      label: 'Class Wide Goal Sheets',
      description:
        'Produce individualized goal tracking sheets for all students in selected classes',
      icon: Target,
      tooltip:
        'Generates customized goal sheets with specific objectives, progress tracking metrics, and intervention strategies for each student. Used by therapists and IEP teams.',
      group: 'tracking',
    },
    {
      value: 'progress-reports',
      label: 'Class Wide Progress Reports',
      description: 'Generate progress summaries showing student achievements and therapy outcomes',
      icon: TrendingUp,
      tooltip:
        'Creates comprehensive progress reports highlighting improvements, challenges, and next steps for continued therapy. Shared with parents, teachers, and administrators.',
      group: 'tracking',
    },
  ]

  const selectedReportType = form.watch('reportType')
  const isSubmitting = form.formState.isSubmitting

  const onSubmit = async (data: ReportFormData) => {
    try {
      console.log('Generating report with data:', data)

      // Use the static method from ReportService
      const reportTitle = `${
        screeningReports.find(type => type.value === data.reportType)?.label
      } - ${data.academicYear}`

      console.log(currentSchool.id, data.academicYear, data.email)

      try {
        const result = await edgeFunctionsApi.schoolWideStudentProgressReport(
          currentSchool.id,
          data.academicYear,
          data.email
        )

        console.log(result, 'result')
      } catch (error) {
        console.error('Error sending email:', error)
      }

      toast({
        title: 'Report Generation Started',
        description: `Your ${
          screeningReports.find(type => type.value === data.reportType)?.label
        } is being generated. You'll receive an email at ${data.email} when it's ready.`,
      })

      // Reset form after successful submission
      form.reset()
    } catch (error) {
      console.error('Error generating report:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate report. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const handleClearForm = () => {
    form.reset()
  }

  return (
    <TooltipProvider>
      <Card className='w-full max-w-full bg-white border border-gray-200 shadow-sm overflow-hidden'>
        <CardHeader className='pb-4 sm:pb-6 px-4 sm:px-6'>
          <CardTitle className='text-lg sm:text-xl font-semibold text-gray-900'>
            Generate Class Wide Report
          </CardTitle>
          <p className='text-sm text-gray-600 mt-2 leading-relaxed'>
            Create comprehensive reports for multiple students
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
                            {screeningReports.map(type => {
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
                    <p>Create and email the selected report type with your specified criteria</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

export default ReportGenerationForm
