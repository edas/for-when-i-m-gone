<script lang="ts">
  import { untrack } from 'svelte';
  import { getTranslations, type Language } from '../lib/i18n';
  import { computeButtonState, getButtonText } from '../lib/buttonState';
  import { updateStoredData } from '../lib/dataStore';
  import { type SecretCheckboxState, defaultSecretCheckboxState } from '../lib/types/editorTypes';
  import { getInitialSidePanelState, saveSidePanelState } from '../lib/sidePanelState';
  import EditorLayout from './ui/EditorLayout.svelte';
  import CheckboxItem from './ui/CheckboxItem.svelte';
  import ActionButtons from './ui/ActionButtons.svelte';
  import EssentialSection from './ui/EssentialSection.svelte';
  import GenerateExampleButton from './ui/GenerateExampleButton.svelte';
  import Icon from './ui/Icons.svelte';
  import '../styles/form-controls.css';

  interface Props {
    lang: Language;
    initialValue?: string;
    initialCheckboxState?: SecretCheckboxState;
    onContinue: (secret: string, checkboxState: SecretCheckboxState) => void;
    onBack: (secret: string, checkboxState: SecretCheckboxState) => void;
  }

  let { lang, initialValue, initialCheckboxState, onContinue, onBack }: Props = $props();

  let secretText: string = $state(untrack(() => initialValue ?? ''));
  let sidePanelOpen: boolean = $state(untrack(() => getInitialSidePanelState('secret', true)));

  // Checkbox states
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
  let isEmpty = $derived(secretText.trim().length === 0);
  let essentialsChecked = $derived(checkEmails && checkPhoneCodes && checkCloudAccounts);
  let anyChecked = $derived(
    checkEmails || checkPhoneCodes || checkCloudAccounts ||
    checkComputerLogins || checkOtherPasswords ||
    checkDomainManager || checkPasswordManager || checkBackups || checkCrypto
  );

  let buttonState = $derived(computeButtonState(hasContent, anyChecked, essentialsChecked));
  let buttonText = $derived(hasContent ? getButtonText(buttonState, t.secretEditor.buttons) : t.secretEditor.buttons.continue);

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
    if (hasContent) onContinue(secretText, getCurrentCheckboxState());
  }

  function handleBack(): void {
    onBack(secretText, getCurrentCheckboxState());
  }

  function generateExample(): void {
    const example = t.secretEditor.sidePanel.exampleContent;
    secretText = secretText.trim() ? secretText + '\n\n\n' + example : example;
  }

  // Auto-save
  $effect(() => {
    updateStoredData((currentData) => ({
      ...currentData,
      what: { content: secretText, checkboxState: getCurrentCheckboxState() }
    }));
  });

  // Sauvegarder l'état de la barre latérale
  $effect(() => {
    saveSidePanelState('secret', sidePanelOpen);
  });
</script>

<EditorLayout
  title={t.secretEditor.title}
  {sidePanelOpen}
  collapseLabel={t.secretEditor.sidePanel.collapse}
  expandLabel={t.secretEditor.sidePanel.expand}
  onToggleSidePanel={() => sidePanelOpen = !sidePanelOpen}
  editorId="secret"
>
  <textarea
    autocomplete="off"
    class="form-textarea"
    bind:value={secretText}
    placeholder={t.secretEditor.placeholder}
  ></textarea>

  {#if isEmpty}
    <div class="button-container">
      <button class="back-button" onclick={handleBack}>
        <Icon name="arrow-left" size={18} />
        {t.common.back}
      </button>
      <GenerateExampleButton
        label={t.secretEditor.sidePanel.generateExample}
        onclick={generateExample}
      />
    </div>
  {:else}
    <ActionButtons
      backLabel={t.common.back}
      continueLabel={buttonText}
      {buttonState}
      disabled={!hasContent}
      onBack={handleBack}
      onContinue={handleContinue}
    />
  {/if}

  {#snippet sidePanelContent()}
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
  {/snippet}
</EditorLayout>

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
    gap: 0.4rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
    font-weight: 400;
    background: none;
    border: none;
    border-radius: 6px;
    color: rgba(160, 174, 192, 0.6);
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
  }

  .back-button:hover {
    background: none;
    color: rgba(160, 174, 192, 0.9);
  }

  .button-container :global(.generate-example-button) {
    width: auto;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: 600;
  }

  /* Responsive */
  @media (max-width: 600px) {
    .button-container {
      flex-direction: column-reverse;
    }

    .button-container :global(.generate-example-button) {
      width: 100%;
      justify-content: center;
    }

    .back-button {
      align-self: flex-start;
      margin-top: 0.5rem;
    }
  }
</style>
