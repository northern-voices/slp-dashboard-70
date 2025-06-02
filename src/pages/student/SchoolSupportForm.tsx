
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ChevronLeft, Save } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { SUPPORT_TYPE_LABELS, SupportType } from '@/types/student-enhancements';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  slp_ids: z.array(z.string()).min(1, 'Select at least one SLP'),
  start_date: z.date({ required_error: 'Start date is required' }),
  end_date: z.date({ required_error: 'End date is required' }),
  support_types: z.array(z.string()).min(1, 'Select at least one support type'),
  notes: z.string().min(1, 'Notes are required'),
  follow_up: z.boolean(),
  follow_up_date: z.date().optional(),
});

const SchoolSupportForm = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slp_ids: [],
      support_types: [],
      notes: '',
      follow_up: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      console.log('School support form submitted:', values);
      toast({
        title: 'School Support Form Saved',
        description: 'The support form has been successfully created.',
      });
      navigate(`/students/${studentId}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save the support form. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const mockSLPs = [
    { id: '1', name: 'Dr. Sarah Johnson' },
    { id: '2', name: 'Dr. Mike Wilson' },
    { id: '3', name: 'Dr. Emily Davis' },
  ];

  const supportTypes = Object.entries(SUPPORT_TYPE_LABELS) as [SupportType, string][];

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
          <h1 className="text-2xl font-semibold text-gray-900">School Support Form</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create School Support Request</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* SLP Selection */}
                <FormField
                  control={form.control}
                  name="slp_ids"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select SLP(s)</FormLabel>
                      <div className="space-y-2">
                        {mockSLPs.map((slp) => (
                          <div key={slp.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={slp.id}
                              checked={field.value.includes(slp.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...field.value, slp.id]);
                                } else {
                                  field.onChange(field.value.filter(id => id !== slp.id));
                                }
                              }}
                            />
                            <label htmlFor={slp.id} className="text-sm font-medium">
                              {slp.name}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
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

                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
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
                </div>

                {/* Support Types */}
                <FormField
                  control={form.control}
                  name="support_types"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Support Types</FormLabel>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {supportTypes.map(([type, label]) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={type}
                              checked={field.value.includes(type)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  field.onChange([...field.value, type]);
                                } else {
                                  field.onChange(field.value.filter(t => t !== type));
                                }
                              }}
                            />
                            <label htmlFor={type} className="text-sm font-medium">
                              {label}
                            </label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter detailed notes about the support request..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Follow Up */}
                <FormField
                  control={form.control}
                  name="follow_up"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Follow-up required
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Follow Up Date */}
                {form.watch('follow_up') && (
                  <FormField
                    control={form.control}
                    name="follow_up_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Follow-up Date</FormLabel>
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
                )}

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
                    {isSubmitting ? 'Saving...' : 'Save Support Form'}
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

export default SchoolSupportForm;
