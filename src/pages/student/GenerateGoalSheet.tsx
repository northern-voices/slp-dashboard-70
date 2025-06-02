
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ChevronLeft, Save, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { GOAL_CATEGORY_LABELS, GoalCategory } from '@/types/student-enhancements';
import { useToast } from '@/hooks/use-toast';

const goalSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  target_date: z.date({ required_error: 'Target date is required' }),
  milestones: z.array(z.string()).min(1, 'At least one milestone is required'),
  notes: z.string(),
});

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  goals: z.array(goalSchema).min(1, 'At least one goal is required'),
});

const GenerateGoalSheet = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      goals: [
        {
          category: '',
          description: '',
          target_date: new Date(),
          milestones: [''],
          notes: '',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'goals',
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // TODO: Replace with actual API call
      console.log('Goal sheet submitted:', values);
      toast({
        title: 'Goal Sheet Saved',
        description: 'The goal sheet has been successfully created and saved.',
      });
      navigate(`/students/${studentId}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save the goal sheet. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addGoal = () => {
    append({
      category: '',
      description: '',
      target_date: new Date(),
      milestones: [''],
      notes: '',
    });
  };

  const goalCategories = Object.entries(GOAL_CATEGORY_LABELS) as [GoalCategory, string][];

  return (
    <div className="min-h-screen bg-gray-25 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
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
          <h1 className="text-2xl font-semibold text-gray-900">Generate Goal Sheet</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Individual Goal Sheet</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Goal Sheet Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Sheet Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Academic Year 2024-2025 Goals"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Goals */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Goals</h3>
                    <Button type="button" variant="outline" onClick={addGoal}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Goal
                    </Button>
                  </div>

                  {fields.map((field, index) => (
                    <Card key={field.id} className="border border-gray-200">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">Goal {index + 1}</CardTitle>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Category */}
                        <FormField
                          control={form.control}
                          name={`goals.${index}.category`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {goalCategories.map(([category, label]) => (
                                    <SelectItem key={category} value={category}>
                                      {label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Description */}
                        <FormField
                          control={form.control}
                          name={`goals.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Goal Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Describe the specific, measurable goal..."
                                  className="min-h-[80px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Target Date */}
                        <FormField
                          control={form.control}
                          name={`goals.${index}.target_date`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Target Date</FormLabel>
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

                        {/* Milestones */}
                        <div className="space-y-2">
                          <FormLabel>Milestones</FormLabel>
                          {form.watch(`goals.${index}.milestones`).map((_, milestoneIndex) => (
                            <div key={milestoneIndex} className="flex gap-2">
                              <FormField
                                control={form.control}
                                name={`goals.${index}.milestones.${milestoneIndex}`}
                                render={({ field }) => (
                                  <FormItem className="flex-1">
                                    <FormControl>
                                      <Input
                                        placeholder={`Milestone ${milestoneIndex + 1}`}
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              {form.watch(`goals.${index}.milestones`).length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const currentMilestones = form.getValues(`goals.${index}.milestones`);
                                    const newMilestones = currentMilestones.filter((_, i) => i !== milestoneIndex);
                                    form.setValue(`goals.${index}.milestones`, newMilestones);
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentMilestones = form.getValues(`goals.${index}.milestones`);
                              form.setValue(`goals.${index}.milestones`, [...currentMilestones, '']);
                            }}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Milestone
                          </Button>
                        </div>

                        {/* Notes */}
                        <FormField
                          control={form.control}
                          name={`goals.${index}.notes`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Additional Notes (Optional)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Any additional context or notes for this goal..."
                                  className="min-h-[60px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>

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
                    {isSubmitting ? 'Saving...' : 'Save Goal Sheet'}
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

export default GenerateGoalSheet;
