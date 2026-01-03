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
</script>

<div class="step-indicator">
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

<style>
  .step-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem 1.5rem;
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    gap: 0;
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
