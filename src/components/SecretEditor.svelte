<script lang="ts">
  import { untrack } from 'svelte';
  import { getTranslations, type Language } from '../lib/i18n';
  import SidePanel from './ui/SidePanel.svelte';
  import CheckboxItem from './ui/CheckboxItem.svelte';
  import ActionButtons from './ui/ActionButtons.svelte';
  import EssentialSection from './ui/EssentialSection.svelte';
  import GenerateExampleButton from './ui/GenerateExampleButton.svelte';

  export interface SecretCheckboxState {
    emails: boolean;
    phoneCodes: boolean;
    cloudAccounts: boolean;
    computerLogins: boolean;
    otherPasswords: boolean;
    domainManager: boolean;
    passwordManager: boolean;
    backups: boolean;
    crypto: boolean;
  }

  export const defaultSecretCheckboxState: SecretCheckboxState = {
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

  interface Props {
    lang: Language;
    initialValue?: string;
    initialCheckboxState?: SecretCheckboxState;
    onContinue: (secret: string, checkboxState: SecretCheckboxState) => void;
    onBack: (secret: string, checkboxState: SecretCheckboxState) => void;
  }

  let { lang, initialValue, initialCheckboxState, onContinue, onBack }: Props = $props();

  let secretText: string = $state(untrack(() => initialValue ?? ''));
  let sidePanelOpen: boolean = $state(true);

  // Checkbox states - first 3 are essential
  let checkEmails: boolean = $state(untrack(() => initialCheckboxState?.emails ?? false));
  let checkPhoneCodes: boolean = $state(untrack(() => initialCheckboxState?.phoneCodes ?? false));
  let checkCloudAccounts: boolean = $state(untrack(() => initialCheckboxState?.cloudAccounts ?? false));
  let checkComputerLogins: boolean = $state(untrack(() => initialCheckboxState?.computerLogins ?? false));
  let checkOtherPasswords: boolean = $state(untrack(() => initialCheckboxState?.otherPasswords ?? false));
  let checkDomainManager: boolean = $state(untrack(() => initialCheckboxState?.domainManager ?? false));
  let checkPasswordManager: boolean = $state(untrack(() => initialCheckboxState?.passwordManager ?? false));
  let checkBackups: boolean = $state(untrack(() => initialCheckboxState?.backups ?? false));
  let checkCrypto: boolean = $state(untrack(() => initialCheckboxState?.crypto ?? false));

  let t = $derived(getTranslations(lang));

  let hasContent = $derived(secretText.trim().length > 0);

  let essentialsChecked = $derived(checkEmails && checkPhoneCodes && checkCloudAccounts);

  let anyChecked = $derived(
    checkEmails || checkPhoneCodes || checkCloudAccounts ||
    checkComputerLogins || checkOtherPasswords ||
    checkDomainManager || checkPasswordManager || checkBackups || checkCrypto
  );

  type ButtonState = 'none' | 'partial' | 'complete';

  let buttonState = $derived.by((): ButtonState => {
    if (!hasContent || !anyChecked) return 'none';
    if (!essentialsChecked) return 'partial';
    return 'complete';
  });

  let buttonText = $derived.by(() => {
    switch (buttonState) {
      case 'none': return t.secretEditor.buttons.continueWithoutConfirm;
      case 'partial': return t.secretEditor.buttons.continueWithoutEssentials;
      case 'complete': return t.secretEditor.buttons.continue;
    }
  });

  function getCurrentCheckboxState(): SecretCheckboxState {
    return {
      emails: checkEmails,
      phoneCodes: checkPhoneCodes,
      cloudAccounts: checkCloudAccounts,
      computerLogins: checkComputerLogins,
      otherPasswords: checkOtherPasswords,
      domainManager: checkDomainManager,
      passwordManager: checkPasswordManager,
      backups: checkBackups,
      crypto: checkCrypto,
    };
  }

  function handleContinue(): void {
    if (hasContent) {
      onContinue(secretText, getCurrentCheckboxState());
    }
  }

  function handleBack(): void {
    onBack(secretText, getCurrentCheckboxState());
  }

  function generateExample(): void {
    const example = t.secretEditor.sidePanel.exampleContent;
    if (secretText.trim()) {
      secretText = secretText + '\n\n\n' + example;
    } else {
      secretText = example;
    }
  }
</script>

<div class="editor-container">
  <main class="main-content" class:panel-closed={!sidePanelOpen}>
    <div class="editor-wrapper">
      <h1 class="editor-title">{t.secretEditor.title}</h1>
      <textarea
        class="editor-textarea"
        bind:value={secretText}
        placeholder={t.secretEditor.placeholder}
      ></textarea>
      <ActionButtons
        backLabel={t.common.back}
        continueLabel={buttonText}
        {buttonState}
        disabled={!hasContent}
        onBack={handleBack}
        onContinue={handleContinue}
      />
    </div>
  </main>

  <SidePanel
    open={sidePanelOpen}
    collapseLabel={t.secretEditor.sidePanel.collapse}
    expandLabel={t.secretEditor.sidePanel.expand}
    onToggle={() => sidePanelOpen = !sidePanelOpen}
  >
    <h2>{t.secretEditor.sidePanel.title}</h2>

    <EssentialSection note={t.secretEditor.sidePanel.essentialNote}>
      <CheckboxItem
        bind:checked={checkEmails}
        label={t.secretEditor.sidePanel.checkboxes.emails}
        essential
      />
      <CheckboxItem
        bind:checked={checkPhoneCodes}
        label={t.secretEditor.sidePanel.checkboxes.phoneCodes}
        essential
      />
      <CheckboxItem
        bind:checked={checkCloudAccounts}
        label={t.secretEditor.sidePanel.checkboxes.cloudAccounts}
        essential
      />
    </EssentialSection>

    <div class="regular-section">
      <CheckboxItem
        bind:checked={checkComputerLogins}
        label={t.secretEditor.sidePanel.checkboxes.computerLogins}
      />
      <CheckboxItem
        bind:checked={checkOtherPasswords}
        label={t.secretEditor.sidePanel.checkboxes.otherPasswords}
      />
    </div>

    <div class="optional-section">
      <h3>{t.secretEditor.sidePanel.sectionOptional}</h3>
      <CheckboxItem
        bind:checked={checkDomainManager}
        label={t.secretEditor.sidePanel.checkboxes.domainManager}
      />
      <CheckboxItem
        bind:checked={checkPasswordManager}
        label={t.secretEditor.sidePanel.checkboxes.passwordManager}
      />
      <CheckboxItem
        bind:checked={checkBackups}
        label={t.secretEditor.sidePanel.checkboxes.backups}
      />
      <CheckboxItem
        bind:checked={checkCrypto}
        label={t.secretEditor.sidePanel.checkboxes.crypto}
      />
    </div>

    <div class="section-divider"></div>

    <GenerateExampleButton
      label={t.secretEditor.sidePanel.generateExample}
      onclick={generateExample}
    />
  </SidePanel>
</div>

<style>
  /* Layout */
  .editor-container {
    display: flex;
    min-height: 100vh;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 2rem;
    transition: margin-right 0.3s ease;
  }

  .main-content.panel-closed {
    margin-right: 0;
  }

  .editor-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    max-width: 900px;
    width: 100%;
    margin: 0 auto;
  }

  .editor-title {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 2rem;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .editor-textarea {
    flex: 1;
    min-height: 400px;
    padding: 1.5rem;
    font-family: 'SF Mono', 'Fira Code', 'Consolas', 'Monaco', monospace;
    font-size: 0.95rem;
    line-height: 1.6;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    color: #e2e8f0;
    resize: vertical;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .editor-textarea::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .editor-textarea:focus {
    outline: none;
    border-color: rgba(96, 165, 250, 0.5);
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.15);
  }

  /* Responsive */
  @media (max-width: 900px) {
    .main-content {
      margin-right: 50px;
    }

    .main-content.panel-closed {
      margin-right: 50px;
    }
  }

  @media (max-width: 600px) {
    .editor-container {
      flex-direction: column;
    }

    .main-content {
      margin-right: 0;
      padding: 1rem;
      padding-bottom: 70px;
    }

    .main-content.panel-closed {
      margin-right: 0;
    }

    .editor-textarea {
      min-height: 250px;
    }

    .editor-title {
      font-size: 1.5rem;
    }
  }
</style>
