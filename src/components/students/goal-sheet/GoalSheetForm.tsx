
import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus, Save } from 'lucide-react';
import GoalCard from './GoalCard';

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

interface GoalSheetFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const GoalSheetForm = ({ onSubmit, onCancel, isSubmitting }: GoalSheetFormProps) => {
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

  const addGoal = () => {
    append({
      category: '',
      description: '',
      target_date: new Date(),
      milestones: [''],
      notes: '',
    });
  };

  return (
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
                <GoalCard
                  key={field.id}
                  index={index}
                  form={form}
                  onRemove={() => remove(index)}
                  canRemove={fields.length > 1}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
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
  );
};

export default GoalSheetForm;
