
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

const ProgressIndicator = ({ currentStep, totalSteps, stepLabels }: ProgressIndicatorProps) => {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {stepLabels.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div key={index} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    isCompleted
                      ? "bg-green-500 text-white"
                      : isCurrent
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    stepNumber
                  )}
                </div>
                <span className={cn(
                  "mt-2 text-xs font-medium",
                  isCurrent ? "text-blue-600" : "text-gray-500"
                )}>
                  {label}
                </span>
              </div>
              
              {index < stepLabels.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-4",
                  stepNumber < currentStep ? "bg-green-500" : "bg-gray-200"
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;
