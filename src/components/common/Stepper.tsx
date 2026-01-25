import React, { Dispatch, SetStateAction } from 'react';

interface StepperProps {
  steps: string[];
  currentStep: number;
  setStep: (step: number) => void | Dispatch<SetStateAction<number>>;
  classNames?: {
    root?: string;
    container?: string;
    backgroundLine?: string;
    progressLine?: string;
    stepContainer?: string;
    stepCircle?: string;
    stepLabel?: string;
  };
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStep, setStep, classNames }) => {
  // Calculate width percentage for the green progress line
  // Total segments = steps.length - 1
  // If currentStep is 1, progress is 0%
  // If currentStep is 2, progress covers the first segment
  const progressPercentage = Math.max(0, Math.min(100, ((currentStep - 1) / (steps.length - 1)) * 100));

  return (
    <div className={`campaignbay-w-full campaignbay-py-6 ${classNames?.root || ''}`}>
      <div className={`campaignbay-flex campaignbay-justify-between campaignbay-items-start campaignbay-relative ${classNames?.container || ''}`}>
        
        {/* Background Grey Line */}
        {/* Positioned with left-16 and right-16 (4rem) to start/end at the center of the first/last circles (w-32 items) */}
        <div className={`campaignbay-absolute campaignbay-top-5 campaignbay-left-16 campaignbay-right-16 campaignbay-h-[2px] campaignbay-bg-gray-200 campaignbay-z-0 ${classNames?.backgroundLine || ''}`}>
            {/* Foreground Green Line */}
            <div 
                className={`campaignbay-h-full campaignbay-bg-green-500 campaignbay-transition-all campaignbay-duration-500 campaignbay-ease-out ${classNames?.progressLine || ''}`}
                style={{ width: `${progressPercentage}%` }}
            />
        </div>
        
        {steps.map((step, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <div key={step} className={`campaignbay-flex campaignbay-flex-col campaignbay-items-center campaignbay-relative campaignbay-z-10 campaignbay-w-32  ${classNames?.stepContainer || ''}`}>
              <div 
              onClick={isCompleted ? () => setStep(stepNum) : undefined}
                className={`
                  campaignbay-w-10 campaignbay-h-10 campaignbay-rounded-full campaignbay-flex campaignbay-items-center campaignbay-justify-center
                  campaignbay-transition-colors campaignbay-duration-300 campaignbay-border-2
                  ${isCompleted ? 'campaignbay-cursor-pointer' : 'campaignbay-cursor-not-allowed'}
                  ${isCompleted || isActive 
                    ? 'campaignbay-bg-green-500 campaignbay-border-green-500 campaignbay-text-white' 
                    : 'campaignbay-bg-gray-300 campaignbay-border-gray-300 campaignbay-text-white'}
                  ${classNames?.stepCircle || ''}
                `}
              >
                {isCompleted ? (
                  <svg className="campaignbay-w-6 campaignbay-h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                    <span className="campaignbay-text-sm campaignbay-font-bold">
                    {stepNum.toString().padStart(2, '0')}
                    </span>
                )}
              </div>
              <div className={`campaignbay-mt-3 campaignbay-text-xs campaignbay-font-bold campaignbay-text-center campaignbay-transition-colors ${isActive || isCompleted ? 'campaignbay-text-gray-900' : 'campaignbay-text-gray-500'} ${classNames?.stepLabel || ''}`}>
                {step}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};