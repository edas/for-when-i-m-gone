<script lang="ts">
  interface Step {
    key: string;
    label: string;
  }

  interface Props {
    steps: Step[];
    currentStep: number;
  }

  let { steps, currentStep }: Props = $props();

  let scrollContainer: HTMLDivElement;
  let stepContainer: HTMLDivElement;

  function scrollToCurrentStep(stepIndex: number) {
    if (!scrollContainer || !stepContainer) return;
    
    const stepElements = stepContainer.querySelectorAll<HTMLDivElement>('.step');
    const currentStepElement = stepElements[stepIndex] as HTMLDivElement | undefined;
    
    if (!currentStepElement) return;

    const containerRect = scrollContainer.getBoundingClientRect();
    const stepRect = currentStepElement.getBoundingClientRect();
    
    // Calculer la position relative de l'étape par rapport au conteneur scrollable
    // offsetLeft est relatif au parent offset (stepContainer)
    const stepLeftInContainer = currentStepElement.offsetLeft;
    
    // Calculer la position pour centrer l'étape dans le viewport
    const scrollLeft = stepLeftInContainer - (containerRect.width / 2) + (stepRect.width / 2);
    
    scrollContainer.scrollTo({
      left: Math.max(0, scrollLeft),
      behavior: 'smooth'
    });
  }

  // Scroller vers l'étape active quand elle change
  $effect(() => {
    // Lire currentStep pour que l'effet réagisse à ses changements
    const step = currentStep;
    
    // Attendre que le DOM soit mis à jour après le changement d'étape
    // Double requestAnimationFrame pour s'assurer que le layout est complètement mis à jour
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToCurrentStep(step);
      });
    });
  });
</script>

<div class="step-indicator-wrapper" bind:this={scrollContainer}>
  <div class="step-indicator" bind:this={stepContainer}>
    {#each steps as step, index}
      <div
        class="step"
        class:completed={index < currentStep}
        class:current={index === currentStep}
        class:upcoming={index > currentStep}
      >
        <div class="step-circle">
          {#if index < currentStep}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          {:else}
            <span>{index + 1}</span>
          {/if}
        </div>
        <span class="step-label">{step.label}</span>
      </div>
      {#if index < steps.length - 1}
        <div class="step-line" class:completed={index < currentStep}></div>
      {/if}
    {/each}
  </div>
</div>

<style>
  .step-indicator-wrapper {
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  }

  .step-indicator-wrapper::-webkit-scrollbar {
    height: 6px;
  }

  .step-indicator-wrapper::-webkit-scrollbar-track {
    background: transparent;
  }

  .step-indicator-wrapper::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }

  .step-indicator-wrapper::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .step-indicator {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 1rem 1.5rem;
    gap: 0;
    min-width: min-content;
  }

  .step {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    min-width: 80px;
  }

  .step-circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .step-circle svg {
    width: 16px;
    height: 16px;
  }

  .step.upcoming .step-circle {
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.25);
    color: rgba(255, 255, 255, 0.4);
  }

  .step.current .step-circle {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border: 2px solid #3b82f6;
    color: white;
    box-shadow: 0 0 12px rgba(59, 130, 246, 0.5);
  }

  .step.completed .step-circle {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border: 2px solid #10b981;
    color: white;
  }

  .step-label {
    font-size: 0.75rem;
    text-align: center;
    transition: color 0.3s ease;
  }

  .step.upcoming .step-label {
    color: rgba(255, 255, 255, 0.4);
  }

  .step.current .step-label {
    color: #60a5fa;
    font-weight: 600;
  }

  .step.completed .step-label {
    color: #10b981;
  }

  .step-line {
    flex: 1;
    height: 2px;
    background: rgba(255, 255, 255, 0.15);
    min-width: 40px;
    max-width: 80px;
    margin: 0 0.5rem;
    margin-bottom: 1.5rem;
    transition: background 0.3s ease;
  }

  .step-line.completed {
    background: #10b981;
  }

  @media (max-width: 600px) {
    .step-indicator {
      padding: 0.75rem 1rem;
      justify-content: flex-start;
    }

    .step {
      min-width: 60px;
    }

    .step-circle {
      width: 28px;
      height: 28px;
      font-size: 0.75rem;
    }

    .step-label {
      font-size: 0.65rem;
    }

    .step-line {
      min-width: 20px;
      max-width: 40px;
    }
  }
</style>
