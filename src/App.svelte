<script lang="ts">
  import SecurityWarning from './components/SecurityWarning.svelte';
  import SecretEditor, { type SecretCheckboxState } from './components/SecretEditor.svelte';
  import IntroMessageEditor, { type IntroCheckboxState } from './components/IntroMessageEditor.svelte';
  import ThresholdSelector from './components/ThresholdSelector.svelte';
  import { detectLanguage, type Language } from './lib/i18n';
  import { getStoredData, updateStoredData } from './lib/dataStore';

  // Default checkbox states
  const defaultSecretCheckboxState: SecretCheckboxState = {
    emails: false,
    phoneCodes: false,
    cloudAccounts: false,
    computerLogins: false,
    otherPasswords: false,
    domainManager: false,
    passwordManager: false,
    backups: false,
    crypto: false,
  };

  const defaultIntroCheckboxState: IntroCheckboxState = {
    secretHolders: false,
    openCases: false,
    noOpenCases: false,
    directives: false,
  };

  // Load initial data from stored JSON
  const storedData = getStoredData();

  let currentLang: Language = $state((storedData.language as Language) ?? detectLanguage());
  let securityConfirmed: boolean = $state(false);
  let securityChecked: boolean = $state(!!storedData.securityConfirmedAt);
  let secretContent: string = $state(storedData.secretContent ?? '');
  let secretCheckboxState: SecretCheckboxState = $state({
    ...defaultSecretCheckboxState,
    ...storedData.secretCheckboxState,
  });
  let secretSubmitted: boolean = $state(false);
  let introMessage: string = $state(storedData.introMessage ?? '');
  let introCheckboxState: IntroCheckboxState = $state({
    ...defaultIntroCheckboxState,
    ...storedData.introCheckboxState,
  });
  let introSubmitted: boolean = $state(false);
  let threshold: number = $state(storedData.threshold ?? 3);
  let thresholdSubmitted: boolean = $state(false);

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

  function handleIntroContinue(message: string, checkboxState: IntroCheckboxState): void {
    introMessage = message;
    introCheckboxState = checkboxState;
    introSubmitted = true;
  }

  function handleIntroBack(message: string, checkboxState: IntroCheckboxState): void {
    introMessage = message;
    introCheckboxState = checkboxState;
    secretSubmitted = false;
  }

  function handleThresholdContinue(value: number): void {
    threshold = value;
    thresholdSubmitted = true;
  }

  function handleThresholdBack(value: number): void {
    threshold = value;
    introSubmitted = false;
  }

  function handleLanguageChange(lang: Language): void {
    currentLang = lang;
    updateStoredData({ language: lang });
  }
</script>

{#if !securityConfirmed}
  <SecurityWarning
    lang={currentLang}
    initialChecked={securityChecked}
    onContinue={handleSecurityContinue}
    onLanguageChange={handleLanguageChange}
  />
{:else if !secretSubmitted}
  <SecretEditor
    lang={currentLang}
    initialValue={secretContent}
    initialCheckboxState={secretCheckboxState}
    onContinue={handleSecretContinue}
    onBack={handleSecretBack}
  />
{:else if !introSubmitted}
  <IntroMessageEditor
    lang={currentLang}
    initialValue={introMessage}
    initialCheckboxState={introCheckboxState}
    onContinue={handleIntroContinue}
    onBack={handleIntroBack}
  />
{:else if !thresholdSubmitted}
  <ThresholdSelector
    lang={currentLang}
    initialValue={threshold}
    onContinue={handleThresholdContinue}
    onBack={handleThresholdBack}
  />
{:else}
  <main>
    <h1>For When I'm Gone</h1>
    <p>Secret has been saved. Next steps will appear here.</p>
  </main>
{/if}

<style>
  main {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    gap: 1.5rem;
    padding: 2rem;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
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
