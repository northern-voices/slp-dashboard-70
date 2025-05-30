
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Check } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

const ProgressIndicator = ({ currentStep, totalSteps, stepTitles }: ProgressIndicatorProps) => {
  const progressValue = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-4">
        {stepTitles.map((title, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div key={stepNumber} className="flex flex-col items-center flex-1">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                ${isCompleted ? 'bg-green-500 text-white' : 
                  isCurrent ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}
              `}>
                {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
              </div>
              <span className={`mt-2 text-sm text-center ${
                isCurrent ? 'text-blue-600 font-medium' : 'text-gray-600'
              }`}>
                {title}
              </span>
            </div>
          );
        })}
      </div>
      
      <Progress value={progressValue} className="h-2" />
      
      <div className="flex justify-between text-sm text-gray-500 mt-2">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{Math.round(progressValue)}% Complete</span>
      </div>
    </div>
  );
};

export default ProgressIndicator;
