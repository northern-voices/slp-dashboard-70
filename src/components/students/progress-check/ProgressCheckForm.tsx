import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Save } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  check_date: z.date({ required_error: 'Check date is required' }),
  notes: z.string().min(1, 'Progress notes are required'),
  attendance: z.enum(['present', 'absent'], {
    required_error: 'Please select attendance status',
  }),
  absence_reason: z.string().optional(),
})

interface ProgressCheckFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => void
  onCancel: () => void
  isSubmitting: boolean
}

const ProgressCheckForm = ({ onSubmit, onCancel, isSubmitting }: ProgressCheckFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      check_date: new Date(),
      notes: '',
      attendance: 'present',
      absence_reason: '',
    },
  })

  const attendance = form.watch('attendance')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Monthly Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            {/* Check Date */}
            <FormField
              control={form.control}
              name='check_date'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Check Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          className={cn(
                            'w-full md:w-64 pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}>
                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className='p-3 pointer-events-auto'
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Attendance */}
            <FormField
              control={form.control}
              name='attendance'
              render={({ field }) => (
                <FormItem className='space-y-3'>
                  <FormLabel>Attendance Status</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className='flex flex-col space-y-1'>
                      <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='present' id='present' />
                        <label htmlFor='present' className='text-sm font-medium'>
                          Present
                        </label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <RadioGroupItem value='absent' id='absent' />
                        <label htmlFor='absent' className='text-sm font-medium'>
                          Absent
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Absence Reason */}
            {attendance === 'absent' && (
              <FormField
                control={form.control}
                name='absence_reason'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Absence (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Enter reason for absence...'
                        className='min-h-[80px]'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Progress Notes */}
            <FormField
              control={form.control}
              name='notes'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Progress Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Enter detailed progress observations, achievements, challenges, and recommendations...'
                      className='min-h-[150px]'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className='flex justify-end space-x-4 pt-6'>
              <Button type='button' variant='outline' onClick={onCancel}>
                Cancel
              </Button>
              <Button type='submit' disabled={isSubmitting}>
                <Save className='w-4 h-4 mr-2' />
                {isSubmitting ? 'Saving...' : 'Save Progress Check'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default ProgressCheckForm
