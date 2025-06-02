
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { GOAL_CATEGORY_LABELS, GoalCategory } from '@/types/student-enhancements';

interface GoalCardProps {
  index: number;
  form: UseFormReturn<any>;
  onRemove: () => void;
  canRemove: boolean;
}

const GoalCard = ({ index, form, onRemove, canRemove }: GoalCardProps) => {
  const goalCategories = Object.entries(GOAL_CATEGORY_LABELS) as [GoalCategory, string][];

  return (
    <Card className="border border-gray-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Goal {index + 1}</CardTitle>
          {canRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
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
  );
};

export default GoalCard;
