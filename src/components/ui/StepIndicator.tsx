import { useEffect, useRef } from 'react';
import styles from './StepIndicator.module.css';

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
      
      // Trouver le stepWrapper qui contient l'étape courante
      const stepWrappers = stepContainer.querySelectorAll<HTMLDivElement>(`.${styles.stepWrapper}`);
      const currentStepWrapper = stepWrappers[stepIndex] as HTMLDivElement | undefined;
      
      if (!currentStepWrapper) return;

      const containerRect = scrollContainer.getBoundingClientRect();
      const stepRect = currentStepWrapper.getBoundingClientRect();
      
      // Calculer la position pour centrer l'étape courante
      const stepLeftInContainer = currentStepWrapper.offsetLeft;
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
    <div className={styles.stepIndicatorWrapper} ref={scrollContainerRef}>
      <div className={styles.stepIndicator} ref={stepContainerRef}>
        {steps.map((step, index) => {
          const isPrevious = index === currentStep - 1;
          const isCurrent = index === currentStep;
          const isNext = index === currentStep + 1;
          
          return (
            <div 
              key={step.key}
              className={`${styles.stepWrapper} ${
                isPrevious ? styles.stepPrevious : 
                isCurrent ? styles.stepCurrent : 
                isNext ? styles.stepNext : 
                styles.stepOther
              }`}
            >
              <div
                className={`${styles.step} ${
                  index < currentStep ? styles.completed : 
                  index === currentStep ? styles.current : styles.upcoming
                }`}
              >
                <div className={styles.stepCircle}>
                  {index < currentStep ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span className={styles.stepLabel}>{step.label}</span>
              </div>
              {index < steps.length - 1 && (
                <div className={`${styles.stepLine} ${index < currentStep ? styles.completed : ''}`}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StepIndicator;
