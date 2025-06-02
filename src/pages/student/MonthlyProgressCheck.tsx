
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ChevronLeft, Save } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  check_date: z.date({ required_error: 'Check date is required' }),
  notes: z.string().min(1, 'Progress notes are required'),
  attendance: z.enum(['present', 'absent'], {
    required_error: 'Please select attendance status',
  }),
  absence_reason: z.string().optional(),
});

const MonthlyProgressCheck = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      check_date: new Date(),
      notes: '',
      attendance: 'present',
      absence_reason: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      console.log('Monthly progress check submitted:', values);
      toast({
        title: 'Progress Check Saved',
        description: 'The monthly progress check has been successfully recorded.',
      });
      navigate(`/students/${studentId}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save the progress check. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const attendance = form.watch('attendance');

  return (
    <div className="min-h-screen bg-gray-25 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/students/${studentId}`)}
            className="text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Student
          </Button>
          <div className="h-4 w-px bg-gray-300" />
          <h1 className="text-2xl font-semibold text-gray-900">Monthly Progress Check</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Record Monthly Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Check Date */}
                <FormField
                  control={form.control}
                  name="check_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Check Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full md:w-64 pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className="p-3 pointer-events-auto"
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
                  name="attendance"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Attendance Status</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="present" id="present" />
                            <label htmlFor="present" className="text-sm font-medium">
                              Present
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="absent" id="absent" />
                            <label htmlFor="absent" className="text-sm font-medium">
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
                    name="absence_reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason for Absence (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter reason for absence..."
                            className="min-h-[80px]"
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
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Progress Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter detailed progress observations, achievements, challenges, and recommendations..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Actions */}
                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/students/${studentId}`)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Saving...' : 'Save Progress Check'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonthlyProgressCheck;
