<script lang="ts">
  import type { JSONContent } from '@tiptap/core';
  import { tick } from 'svelte';
  import { getTranslations, type Language } from '../../lib/i18n';
  import { getStoredData, updateStoredData, type EncryptStoredData } from '../../lib/dataStore';
  import { 
    type SecretCheckboxState, 
    type HowData, 
    type IntroCheckboxState,
    defaultSecretCheckboxState, 
    defaultIntroCheckboxState 
  } from '../../lib/types/editorTypes';
  import type { Recipient } from '../../lib/types/recipient';
  import SecretEditor from './SecretEditor.svelte';
  import WhoEditor from './WhoEditor.svelte';
  import HowEditor from './HowEditor.svelte';
  import IntroMessageEditor from './IntroMessageEditor.svelte';
  import GenerateEditor from './GenerateEditor.svelte';
  import StepIndicator from '../ui/StepIndicator.svelte';

  interface Props {
    lang: Language;
    onBack: () => void;
    onLanguageChange: (lang: Language) => void;
  }

  let { lang, onBack, onLanguageChange }: Props = $props();

  const defaultHowData: Partial<HowData> = {
    conditions: null,
    hasNoOpenConditions: false,
  };

  // Load initial data from stored JSON
  let initialStoredData = getStoredData() as EncryptStoredData;

  // ===== Encrypt path state =====
  let secretContent: string = $state(initialStoredData.what?.content ?? '');
  let secretCheckboxState: SecretCheckboxState = $state({
    ...defaultSecretCheckboxState,
    ...initialStoredData.what?.checkboxState,
  });
  let secretSubmitted: boolean = $state(false);
  let recipients: Recipient[] = $state(initialStoredData.who?.recipients ?? []);
  let whoSubmitted: boolean = $state(false);
  let howData: Partial<HowData> = $state({
    ...defaultHowData,
    ...initialStoredData.how,
  });
  let howSubmitted: boolean = $state(false);
  let introMessage: JSONContent | null = $state(initialStoredData.intro?.message ?? null);
  let introCheckboxState: IntroCheckboxState = $state({
    ...defaultIntroCheckboxState,
    ...initialStoredData.intro?.checkboxState,
  });
  let introSubmitted: boolean = $state(false);
  let aesKey: Uint8Array | undefined = $state(initialStoredData.generate?.aesKey);
  let shares: string[] | undefined = $state(initialStoredData.generate?.shares);
  let generateSubmitted: boolean = $state(false);

  let t = $derived(getTranslations(lang));

  // Steps for encrypt mode
  let steps = $derived([
    { key: 'secret', label: t.steps.secret },
    { key: 'who', label: t.steps.who },
    { key: 'how', label: t.steps.how },
    { key: 'intro', label: t.steps.intro },
    { key: 'generate', label: t.steps.generate },
  ]);

  // Current step based on submitted state
  let currentStep = $derived.by(() => {
    if (!secretSubmitted) return 0;
    if (!whoSubmitted) return 1;
    if (!howSubmitted) return 2;
    if (!introSubmitted) return 3;
    if (!generateSubmitted) return 4;
    return 4; // Stay on last step when completed
  });

  async function scrollToTop(): Promise<void> {
    await tick();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      });
    });
  }

  // ===== What (Secret) handlers =====
  async function handleSecretContinue(secret: string, checkboxState: SecretCheckboxState): Promise<void> {
    secretContent = secret;
    secretCheckboxState = checkboxState;
    secretSubmitted = true;
    await scrollToTop();
  }

  async function handleSecretBack(secret: string, checkboxState: SecretCheckboxState): Promise<void> {
    secretContent = secret;
    secretCheckboxState = checkboxState;
    onBack();
    await scrollToTop();
  }

  // ===== Who handlers =====
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

  // ===== How handlers =====
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

  // ===== Intro handlers =====
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

  // ===== Generate handlers =====
  async function handleGenerateContinue(): Promise<void> {
    generateSubmitted = true;
    await scrollToTop();
  }

  async function handleGenerateBack(): Promise<void> {
    const storedData = getStoredData() as EncryptStoredData;
    // Synchronize recipients with store to get updated numbers
    if (storedData.who?.recipients) {
      recipients = storedData.who.recipients;
    }
    generateSubmitted = false;
    introSubmitted = false;
    await scrollToTop();
  }

  // Synchronize aesKey with store when on HowEditor screen
  $effect(() => {
    if (!howSubmitted && secretSubmitted && whoSubmitted) {
      const storedData = getStoredData() as EncryptStoredData;
      if (storedData.generate?.aesKey instanceof Uint8Array) {
        aesKey = storedData.generate.aesKey;
      }
    }
  });
</script>

<div class="app-container">
  <StepIndicator {steps} {currentStep} />
  
  <div class="step-content">
    {#if !secretSubmitted}
      <SecretEditor
        {lang}
        initialValue={secretContent}
        initialCheckboxState={secretCheckboxState}
        onContinue={handleSecretContinue}
        onBack={handleSecretBack}
      />
    {:else if !whoSubmitted}
      <WhoEditor
        {lang}
        initialRecipients={recipients}
        onContinue={handleWhoContinue}
        onBack={handleWhoBack}
      />
    {:else if !howSubmitted}
      <HowEditor
        {lang}
        recipientCount={recipients.length}
        initialData={howData}
        {aesKey}
        onContinue={handleHowContinue}
        onBack={handleHowBack}
      />
    {:else if !introSubmitted}
      <IntroMessageEditor
        {lang}
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
        {lang}
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
