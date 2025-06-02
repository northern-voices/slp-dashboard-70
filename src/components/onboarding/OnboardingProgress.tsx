
import React from 'react';
import { Check } from 'lucide-react';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

const OnboardingProgress = ({ currentStep, totalSteps, stepTitles }: OnboardingProgressProps) => {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between">
        {stepTitles.map((title, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div key={stepNumber} className="flex flex-col items-center flex-1">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                ${isCompleted ? 'bg-primary text-primary-foreground' : 
                  isCurrent ? 'bg-primary text-primary-foreground' : 'bg-gray-200 text-gray-600'}
              `}>
                {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
              </div>
              <span className={`mt-2 text-sm text-center ${
                isCurrent ? 'text-primary font-medium' : 'text-gray-600'
              }`}>
                {title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OnboardingProgress;
