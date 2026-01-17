<script lang="ts">
  import type { JSONContent } from '@tiptap/core';
  import SecurityWarning from './components/SecurityWarning.svelte';
  import SecretEditor from './components/SecretEditor.svelte';
  import WhoEditor from './components/WhoEditor.svelte';
  import type { Recipient } from './lib/types/recipient';
  import HowEditor from './components/HowEditor.svelte';
  import IntroMessageEditor from './components/IntroMessageEditor.svelte';
  import GenerateEditor from './components/GenerateEditor.svelte';
  import StepIndicator from './components/ui/StepIndicator.svelte';
  import { detectLanguage, getTranslations, type Language } from './lib/i18n';
  import { getStoredData, updateStoredData } from './lib/dataStore';
  import { 
    type SecretCheckboxState, 
    type HowData, 
    type IntroCheckboxState,
    defaultSecretCheckboxState, 
    defaultIntroCheckboxState 
  } from './lib/types/editorTypes';

  const defaultHowData: Partial<HowData> = {
    conditions: null,
    hasNoOpenConditions: false,
  };

  // Load initial data from stored JSON
  const storedData = getStoredData();

  let currentLang: Language = $state((storedData.language as Language) ?? detectLanguage());
  let securityConfirmed: boolean = $state(false);
  let securityChecked: boolean = $state(!!storedData.security?.confirmedAt);
  let secretContent: string = $state(storedData.what?.content ?? '');
  let secretCheckboxState: SecretCheckboxState = $state({
    ...defaultSecretCheckboxState,
    ...storedData.what?.checkboxState,
  });
  let secretSubmitted: boolean = $state(false);
  let recipients: Recipient[] = $state(storedData.who?.recipients ?? []);
  let whoSubmitted: boolean = $state(false);
  let howData: Partial<HowData> = $state({
    ...defaultHowData,
    ...storedData.how,
  });
  let howSubmitted: boolean = $state(false);
  let introMessage: JSONContent | null = $state(storedData.intro?.message ?? null);
  let introCheckboxState: IntroCheckboxState = $state({
    ...defaultIntroCheckboxState,
    ...storedData.intro?.checkboxState,
  });
  let introSubmitted: boolean = $state(false);
  let generateSubmitted: boolean = $state(false);

  function handleSecurityContinue(checked: boolean): void {
    securityChecked = checked;
    securityConfirmed = true;
  }

  function handleSecretContinue(secret: string, checkboxState: SecretCheckboxState): void {
    secretContent = secret;
    secretCheckboxState = checkboxState;
    secretSubmitted = true;
  }

  function handleSecretBack(secret: string, checkboxState: SecretCheckboxState): void {
    secretContent = secret;
    secretCheckboxState = checkboxState;
    securityConfirmed = false;
  }

  function handleWhoContinue(newRecipients: Recipient[]): void {
    recipients = newRecipients;
    whoSubmitted = true;
  }

  function handleWhoBack(newRecipients: Recipient[]): void {
    recipients = newRecipients;
    secretSubmitted = false;
  }

  function handleHowContinue(data: HowData): void {
    howData = data;
    howSubmitted = true;
  }

  function handleHowBack(data: HowData): void {
    howData = data;
    whoSubmitted = false;
  }

  function handleIntroContinue(message: JSONContent | null, checkboxState: IntroCheckboxState): void {
    introMessage = message;
    introCheckboxState = checkboxState;
    introSubmitted = true;
  }

  function handleIntroBack(message: JSONContent | null, checkboxState: IntroCheckboxState): void {
    introMessage = message;
    introCheckboxState = checkboxState;
    howSubmitted = false;
  }

  function handleGenerateContinue(): void {
    generateSubmitted = true;
  }

  function handleGenerateBack(): void {
    generateSubmitted = false;
    introSubmitted = false;
  }

  function handleLanguageChange(lang: Language): void {
    currentLang = lang;
    updateStoredData((currentData) => ({ ...currentData, language: lang }));
  }

  let t = $derived(getTranslations(currentLang));

  let steps = $derived([
    { key: 'secret', label: t.steps.secret },
    { key: 'who', label: t.steps.who },
    { key: 'how', label: t.steps.how },
    { key: 'intro', label: t.steps.intro },
    { key: 'generate', label: t.steps.generate },
  ]);

  let currentStep = $derived.by(() => {
    if (!secretSubmitted) return 0;
    if (!whoSubmitted) return 1;
    if (!howSubmitted) return 2;
    if (!introSubmitted) return 3;
    if (!generateSubmitted) return 4;
    return 4; // Stay on last step when completed
  });
</script>

{#if !securityConfirmed}
  <SecurityWarning
    lang={currentLang}
    initialChecked={securityChecked}
    onContinue={handleSecurityContinue}
    onLanguageChange={handleLanguageChange}
  />
{:else}
  <div class="app-container">
    <StepIndicator {steps} {currentStep} />
    
    <div class="step-content">
      {#if !secretSubmitted}
        <SecretEditor
          lang={currentLang}
          initialValue={secretContent}
          initialCheckboxState={secretCheckboxState}
          onContinue={handleSecretContinue}
          onBack={handleSecretBack}
        />
      {:else if !whoSubmitted}
        <WhoEditor
          lang={currentLang}
          initialRecipients={recipients}
          onContinue={handleWhoContinue}
          onBack={handleWhoBack}
        />
      {:else if !howSubmitted}
        <HowEditor
          lang={currentLang}
          recipientCount={recipients.length}
          initialData={howData}
          onContinue={handleHowContinue}
          onBack={handleHowBack}
        />
      {:else if !introSubmitted}
        <IntroMessageEditor
          lang={currentLang}
          initialValue={introMessage}
          initialCheckboxState={introCheckboxState}
          threshold={howData.threshold!}
          conditions={howData.conditions ?? null}
          {recipients}
          onContinue={handleIntroContinue}
          onBack={handleIntroBack}
        />
      {:else if !generateSubmitted}
        <GenerateEditor
          lang={currentLang}
          onContinue={handleGenerateContinue}
          onBack={handleGenerateBack}
        />
      {:else}
        <main>
          <h1>For When I'm Gone</h1>
          <p>Secret has been saved. Next steps will appear here.</p>
        </main>
      {/if}
    </div>
  </div>
{/if}

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

  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    gap: 1.5rem;
    padding: 2rem;
  }

  h1 {
    font-size: 2.5rem;
    color: #ffffff;
  }

  p {
    color: #a0aec0;
    max-width: 500px;
  }
</style>
