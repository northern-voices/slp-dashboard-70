
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
        <span className="text-sm text-gray-500">
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        {stepTitles.map((title, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;
          
          return (
            <div key={stepNumber} className="flex flex-col items-center flex-1">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all
                ${isCompleted ? 'bg-blue-600 text-white' : 
                  isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 
                  'bg-gray-200 text-gray-600'}
              `}>
                {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
              </div>
              
              {index < stepTitles.length - 1 && (
                <div className={`
                  h-1 w-full mt-2 transition-all
                  ${isCompleted ? 'bg-blue-600' : 'bg-gray-200'}
                `} />
              )}
              
              <span className={`mt-3 text-sm text-center px-2 ${
                isCurrent ? 'text-blue-600 font-medium' : 
                isCompleted ? 'text-gray-700' : 'text-gray-500'
              }`}>
                {title}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="mt-4 bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default OnboardingProgress;
