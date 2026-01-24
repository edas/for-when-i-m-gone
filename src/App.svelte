<script lang="ts">
  import type { JSONContent } from '@tiptap/core';
  import { tick } from 'svelte';
  import SecurityWarning from './components/SecurityWarning.svelte';
  import SecretEditor from './components/SecretEditor.svelte';
  import WhoEditor from './components/WhoEditor.svelte';
  import type { Recipient } from './lib/types/recipient';
  import HowEditor from './components/HowEditor.svelte';
  import IntroMessageEditor from './components/IntroMessageEditor.svelte';
  import GenerateEditor from './components/GenerateEditor.svelte';
  import RecoveryEditor from './components/RecoveryEditor.svelte';
  import DecryptEditor from './components/DecryptEditor.svelte';
  import StepIndicator from './components/ui/StepIndicator.svelte';
  import { detectLanguage, getTranslations, type Language } from './lib/i18n';
  import { getStoredData, updateStoredData, getAppMode, type AppMode } from './lib/dataStore';
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

  // Determine app mode from initial DOM data
  const appMode: AppMode = getAppMode();

  let currentLang: Language = $state((storedData.language as Language) ?? detectLanguage());
  let securityConfirmed: boolean = $state(false);
  let securityChecked: boolean = $state(!!storedData.security?.confirmedAt);

  // ===== Encrypt path state =====
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
  let aesKey: Uint8Array | undefined = $state(storedData.generate?.aesKey);
  let shares: string[] | undefined = $state(storedData.generate?.shares);
  let generateSubmitted: boolean = $state(false);

  // ===== Decrypt path state =====
  let recoverySubmitted: boolean = $state(false);
  let decryptSubmitted: boolean = $state(false);

  async function scrollToTop(): Promise<void> {
    await tick();
    // Double requestAnimationFrame to ensure DOM is completely rendered
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      });
    });
  }

  async function handleSecurityContinue(checked: boolean): Promise<void> {
    securityChecked = checked;
    securityConfirmed = true;
    await scrollToTop();
  }

  async function handleSecretContinue(secret: string, checkboxState: SecretCheckboxState): Promise<void> {
    secretContent = secret;
    secretCheckboxState = checkboxState;
    secretSubmitted = true;
    await scrollToTop();
  }

  async function handleSecretBack(secret: string, checkboxState: SecretCheckboxState): Promise<void> {
    secretContent = secret;
    secretCheckboxState = checkboxState;
    securityConfirmed = false;
    await scrollToTop();
  }

  async function handleWhoContinue(newRecipients: Recipient[]): Promise<void> {
    recipients = newRecipients;
    whoSubmitted = true;
    await scrollToTop();
  }

  async function handleWhoBack(newRecipients: Recipient[]): Promise<void> {
    recipients = newRecipients;
    secretSubmitted = false;
    await scrollToTop();
  }

  async function handleHowContinue(data: HowData): Promise<void> {
    howData = data;
    howSubmitted = true;
    await scrollToTop();
  }

  async function handleHowBack(data: HowData): Promise<void> {
    howData = data;
    whoSubmitted = false;
    await scrollToTop();
  }

  async function handleIntroContinue(message: JSONContent | null, checkboxState: IntroCheckboxState): Promise<void> {
    introMessage = message;
    introCheckboxState = checkboxState;
    introSubmitted = true;
    await scrollToTop();
  }

  async function handleIntroBack(message: JSONContent | null, checkboxState: IntroCheckboxState): Promise<void> {
    introMessage = message;
    introCheckboxState = checkboxState;
    howSubmitted = false;
    await scrollToTop();
  }

  async function handleGenerateContinue(): Promise<void> {
    generateSubmitted = true;
    await scrollToTop();
  }

  async function handleGenerateBack(): Promise<void> {
    const storedData = getStoredData();
    // Synchronize recipients with store to get updated numbers
    if (storedData.who?.recipients) {
      recipients = storedData.who.recipients;
    }
    generateSubmitted = false;
    introSubmitted = false;
    await scrollToTop();
  }

  // ===== Decrypt path handlers =====
  async function handleRecoveryContinue(): Promise<void> {
    recoverySubmitted = true;
    await scrollToTop();
  }

  async function handleRecoveryBack(): Promise<void> {
    securityConfirmed = false;
    await scrollToTop();
  }

  async function handleDecryptBack(): Promise<void> {
    recoverySubmitted = false;
    await scrollToTop();
  }

  function handleLanguageChange(lang: Language): void {
    currentLang = lang;
    updateStoredData((currentData) => ({ ...currentData, language: lang }));
  }

  let t = $derived(getTranslations(currentLang));

  // Steps depend on the app mode
  let steps = $derived(
    appMode === 'encrypt'
      ? [
          { key: 'secret', label: t.steps.secret },
          { key: 'who', label: t.steps.who },
          { key: 'how', label: t.steps.how },
          { key: 'intro', label: t.steps.intro },
          { key: 'generate', label: t.steps.generate },
        ]
      : [
          { key: 'recovery', label: t.decryptSteps.recovery },
          { key: 'decrypt', label: t.decryptSteps.decrypt },
        ]
  );

  // Current step depends on the app mode
  let currentStep = $derived.by(() => {
    if (appMode === 'encrypt') {
      if (!secretSubmitted) return 0;
      if (!whoSubmitted) return 1;
      if (!howSubmitted) return 2;
      if (!introSubmitted) return 3;
      if (!generateSubmitted) return 4;
      return 4; // Stay on last step when completed
    } else {
      // Decrypt mode
      if (!recoverySubmitted) return 0;
      if (!decryptSubmitted) return 1;
      return 1; // Stay on last step when completed
    }
  });

  // Synchronize aesKey with store when on HowEditor screen
  $effect(() => {
    if (!howSubmitted && secretSubmitted && whoSubmitted) {
      const storedData = getStoredData();
      if (storedData.generate?.aesKey instanceof Uint8Array) {
        aesKey = storedData.generate.aesKey;
      }
    }
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
      {#if appMode === 'encrypt'}
        <!-- Encrypt path -->
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
            {aesKey}
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
            secret={secretContent}
            recipients={recipients}
            threshold={howData.threshold!}
            {aesKey}
            {shares}
            onContinue={handleGenerateContinue}
            onBack={handleGenerateBack}
          />
        {:else}
          <main>
            <h1>For When I'm Gone</h1>
            <p>Secret has been saved. Next steps will appear here.</p>
          </main>
        {/if}
      {:else}
        <!-- Decrypt path -->
        {#if !recoverySubmitted}
          <RecoveryEditor
            lang={currentLang}
            onContinue={handleRecoveryContinue}
            onBack={handleRecoveryBack}
          />
        {:else if !decryptSubmitted}
          <DecryptEditor
            lang={currentLang}
            onBack={handleDecryptBack}
          />
        {:else}
          <main>
            <h1>For When I'm Gone</h1>
            <p>Secret has been decrypted.</p>
          </main>
        {/if}
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
