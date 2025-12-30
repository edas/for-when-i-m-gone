<script lang="ts">
  import Icon from './Icons.svelte';
  import { type ButtonState } from '../../lib/buttonState';

  interface Props {
    backLabel: string;
    continueLabel: string;
    buttonState?: ButtonState;
    disabled?: boolean;
    onBack: () => void;
    onContinue: () => void;
  }

  let { 
    backLabel, 
    continueLabel, 
    buttonState = 'complete', 
    disabled = false, 
    onBack, 
    onContinue 
  }: Props = $props();
</script>

<div class="button-container">
  <button class="back-button" onclick={onBack}>
    <Icon name="arrow-left" size={18} />
    {backLabel}
  </button>
  <button
    class="continue-button"
    class:state-none={buttonState === 'none'}
    class:state-partial={buttonState === 'partial'}
    class:state-complete={buttonState === 'complete'}
    {disabled}
    onclick={onContinue}
  >
    {#if buttonState === 'none'}
      <Icon name="info" />
    {:else if buttonState === 'partial'}
      <Icon name="layers" />
    {:else}
      <Icon name="check" />
    {/if}
    {continueLabel}
  </button>
</div>

<style>
  .button-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 1.5rem;
  }

  .back-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    color: #a0aec0;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .back-button:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    color: #e2e8f0;
  }

  .continue-button {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: white;
  }

  .continue-button.state-none {
    background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
    box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3);
  }

  .continue-button.state-partial {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
  }

  .continue-button.state-complete {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  }

  .continue-button:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  .continue-button.state-none:hover:not(:disabled) {
    box-shadow: 0 6px 20px rgba(107, 114, 128, 0.4);
  }

  .continue-button.state-partial:hover:not(:disabled) {
    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
  }

  .continue-button.state-complete:hover:not(:disabled) {
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }

  .continue-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
  }

  /* Responsive */
  @media (max-width: 600px) {
    .button-container {
      flex-direction: column;
    }

    .back-button,
    .continue-button {
      width: 100%;
      justify-content: center;
    }
  }
</style>
