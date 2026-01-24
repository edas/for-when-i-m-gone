<script lang="ts">
  import { getTranslations, type Language } from '../../lib/i18n';
  import { getStoredData, type AppMode } from '../../lib/dataStore';
  import UnlockEditor from './UnlockEditor.svelte';
  import StepIndicator from '../ui/StepIndicator.svelte';

  interface Props {
    lang: Language;
    onUnlocked: (newMode: AppMode) => void;
    onBack: () => void;
    onLanguageChange: (lang: Language) => void;
  }

  let { lang, onUnlocked, onBack, onLanguageChange }: Props = $props();

  let t = $derived(getTranslations(lang));

  // Steps for locked mode
  let steps = $derived([
    { key: 'unlock', label: t.lockedSteps.unlock },
  ]);

  async function handleUnlocked(): Promise<void> {
    // After successful unlock, get the new mode from stored data
    const newStoredData = getStoredData();
    onUnlocked(newStoredData.mode);
  }
</script>

<div class="app-container">
  <StepIndicator {steps} currentStep={0} />
  
  <div class="step-content">
    <UnlockEditor
      {lang}
      onUnlocked={handleUnlocked}
      onBack={onBack}
    />
  </div>
</div>

<style>
  .app-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  }

  .step-content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
</style>
