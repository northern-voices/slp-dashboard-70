
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';

interface ProgressScreeningFieldsProps {
  form: UseFormReturn<any>;
}

const ProgressScreeningFields = ({ form }: ProgressScreeningFieldsProps) => {
  const [goalsMet, setGoalsMet] = useState<string[]>([]);
  const [goalsInProgress, setGoalsInProgress] = useState<string[]>([]);
  const [newGoalMet, setNewGoalMet] = useState('');
  const [newGoalInProgress, setNewGoalInProgress] = useState('');

  const addGoalMet = () => {
    if (newGoalMet.trim()) {
      setGoalsMet([...goalsMet, newGoalMet.trim()]);
      setNewGoalMet('');
    }
  };

  const removeGoalMet = (index: number) => {
    setGoalsMet(goalsMet.filter((_, i) => i !== index));
  };

  const addGoalInProgress = () => {
    if (newGoalInProgress.trim()) {
      setGoalsInProgress([...goalsInProgress, newGoalInProgress.trim()]);
      setNewGoalInProgress('');
    }
  };

  const removeGoalInProgress = (index: number) => {
    setGoalsInProgress(goalsInProgress.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">IEP Goals Progress</CardTitle>
          <p className="text-sm text-gray-600">Review current goals and document progress</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium">Goals Met/Mastered</Label>
            <p className="text-sm text-gray-600 mb-3">List goals that have been achieved or mastered</p>
            <div className="space-y-2">
              {goalsMet.map((goal, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded border">
                  <span className="flex-1 text-sm">{goal}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGoalMet(index)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={newGoalMet}
                  onChange={(e) => setNewGoalMet(e.target.value)}
                  placeholder="Enter goal that has been met..."
                  onKeyPress={(e) => e.key === 'Enter' && addGoalMet()}
                />
                <Button type="button" onClick={addGoalMet} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-base font-medium">Goals In Progress</Label>
            <p className="text-sm text-gray-600 mb-3">List goals currently being worked on with progress notes</p>
            <div className="space-y-2">
              {goalsInProgress.map((goal, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-yellow-50 rounded border">
                  <span className="flex-1 text-sm">{goal}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGoalInProgress(index)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  value={newGoalInProgress}
                  onChange={(e) => setNewGoalInProgress(e.target.value)}
                  placeholder="Enter goal in progress..."
                  onKeyPress={(e) => e.key === 'Enter' && addGoalInProgress()}
                />
                <Button type="button" onClick={addGoalInProgress} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progress Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Overall Progress Rating</Label>
            <div className="flex gap-2 mt-2">
              {['Exceeding', 'Meeting', 'Progressing', 'Limited Progress', 'Regression'].map(rating => (
                <Badge key={rating} variant="outline" className="cursor-pointer hover:bg-blue-100">
                  {rating}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Therapy Frequency/Duration Effectiveness</Label>
            <Textarea
              placeholder="Comment on current therapy schedule effectiveness, student engagement, carryover..."
              rows={3}
            />
          </div>

          <div>
            <Label>Intervention Strategies Used</Label>
            <Textarea
              placeholder="Describe specific techniques, materials, or approaches used during this period..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">New Concerns & Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>New Concerns Identified</Label>
            <Textarea
              placeholder="Note any new areas of concern that have emerged..."
              rows={3}
            />
          </div>

          <div>
            <Label>Recommendations for Continued Services</Label>
            <Textarea
              placeholder="Recommend therapy frequency, duration, goals to continue/modify, dismissal considerations..."
              rows={4}
            />
          </div>

          <div>
            <Label>Parent/Teacher Collaboration Notes</Label>
            <Textarea
              placeholder="Document communication with parents/teachers, home carryover activities, classroom modifications..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressScreeningFields;
