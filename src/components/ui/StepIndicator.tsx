import { useEffect, useRef } from 'react';
import './StepIndicator.css';

interface Step {
  key: string;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const stepContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToCurrentStep = (stepIndex: number) => {
      const scrollContainer = scrollContainerRef.current;
      const stepContainer = stepContainerRef.current;
      
      if (!scrollContainer || !stepContainer) return;
      
      const stepElements = stepContainer.querySelectorAll<HTMLDivElement>('.step');
      const currentStepElement = stepElements[stepIndex] as HTMLDivElement | undefined;
      
      if (!currentStepElement) return;

      const containerRect = scrollContainer.getBoundingClientRect();
      const stepRect = currentStepElement.getBoundingClientRect();
      
      const stepLeftInContainer = currentStepElement.offsetLeft;
      const scrollLeft = stepLeftInContainer - (containerRect.width / 2) + (stepRect.width / 2);
      
      scrollContainer.scrollTo({
        left: Math.max(0, scrollLeft),
        behavior: 'smooth'
      });
    };

    // Wait for DOM update
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToCurrentStep(currentStep);
      });
    });
  }, [currentStep]);

  return (
    <div className="step-indicator-wrapper" ref={scrollContainerRef}>
      <div className="step-indicator" ref={stepContainerRef}>
        {steps.map((step, index) => (
          <div key={step.key}>
            <div
              className={`step ${
                index < currentStep ? 'completed' : 
                index === currentStep ? 'current' : 'upcoming'
              }`}
            >
              <div className="step-circle">
                {index < currentStep ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className="step-label">{step.label}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`step-line ${index < currentStep ? 'completed' : ''}`}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default StepIndicator;
