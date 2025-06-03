
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';

interface GradeManagementProps {
  selectedGrades: string[];
  onGradesChange: (grades: string[]) => void;
}

const AVAILABLE_GRADES = [
  'PreK',
  'K',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12'
];

const GRADE_LABELS: Record<string, string> = {
  'PreK': 'Pre-K',
  'K': 'Kindergarten',
  '1': '1st Grade',
  '2': '2nd Grade',
  '3': '3rd Grade',
  '4': '4th Grade',
  '5': '5th Grade',
  '6': '6th Grade',
  '7': '7th Grade',
  '8': '8th Grade',
  '9': '9th Grade',
  '10': '10th Grade',
  '11': '11th Grade',
  '12': '12th Grade'
};

const GradeManagement = ({ selectedGrades, onGradesChange }: GradeManagementProps) => {
  const handleGradeToggle = (grade: string) => {
    if (selectedGrades.includes(grade)) {
      onGradesChange(selectedGrades.filter(g => g !== grade));
    } else {
      onGradesChange([...selectedGrades, grade]);
    }
  };

  const handleSelectAll = () => {
    onGradesChange(AVAILABLE_GRADES);
  };

  const handleClearAll = () => {
    onGradesChange([]);
  };

  const removeGrade = (grade: string) => {
    onGradesChange(selectedGrades.filter(g => g !== grade));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Available Grades</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            disabled={selectedGrades.length === AVAILABLE_GRADES.length}
          >
            Select All
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            disabled={selectedGrades.length === 0}
          >
            Clear All
          </Button>
        </div>
      </div>

      {selectedGrades.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm text-gray-600">Selected Grades:</Label>
          <div className="flex flex-wrap gap-2">
            {selectedGrades.map((grade) => (
              <Badge
                key={grade}
                variant="secondary"
                className="flex items-center gap-1 px-3 py-1"
              >
                {GRADE_LABELS[grade]}
                <button
                  type="button"
                  onClick={() => removeGrade(grade)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-sm text-gray-600">Select grades available at this school:</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 border rounded-md max-h-40 overflow-y-auto">
          {AVAILABLE_GRADES.map((grade) => (
            <div key={grade} className="flex items-center space-x-2">
              <Checkbox
                id={`grade-${grade}`}
                checked={selectedGrades.includes(grade)}
                onCheckedChange={() => handleGradeToggle(grade)}
              />
              <Label htmlFor={`grade-${grade}`} className="text-sm font-normal cursor-pointer">
                {GRADE_LABELS[grade]}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {selectedGrades.length === 0 && (
        <p className="text-sm text-red-600">Please select at least one grade for this school.</p>
      )}
    </div>
  );
};

export default GradeManagement;
