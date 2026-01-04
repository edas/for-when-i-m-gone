<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import type { Editor, JSONContent } from '@tiptap/core';
  import { getTranslations, type Language } from '../lib/i18n';
  import { computeButtonState, getButtonText } from '../lib/buttonState';
  import { autoSave } from '../lib/editorComposable';
  import { type IntroCheckboxState, defaultIntroCheckboxState } from '../lib/types/editorTypes';
  import { 
    RecipientsBlock, 
    ConditionsBlock, 
    DateTimeInline, 
    QuorumInline, 
    DynamicDataExtension,
    hasNodeTypeInJSON 
  } from '../lib/tiptap/extensions';
  import { createTiptapEditor } from '../lib/tiptap/createEditor';
  import { hasJsonContent } from '../lib/tiptap/utils';
  import { generateExampleInEditor } from '../lib/tiptap/editorHelpers';
  import {
    createCheckboxSyncState,
    syncCheckboxWithNode,
    computeInitialCheckboxState,
  } from '../lib/checkboxSync';
  import type { Recipient } from '../lib/types/recipient';
  import EditorLayout from './ui/EditorLayout.svelte';
  import CheckboxItem from './ui/CheckboxItem.svelte';
  import ActionButtons from './ui/ActionButtons.svelte';
  import EssentialSection from './ui/EssentialSection.svelte';
  import RichTextToolbar from './ui/RichTextToolbar.svelte';
  import GenerateExampleButton from './ui/GenerateExampleButton.svelte';
  import '../styles/tiptap-editor.css';

  interface Props {
    lang: Language;
    initialValue?: JSONContent | null;
    initialCheckboxState?: IntroCheckboxState;
    threshold: number;
    conditions?: JSONContent | null;
    recipients?: Recipient[];
    onContinue: (message: JSONContent | null, checkboxState: IntroCheckboxState) => void;
    onBack: (message: JSONContent | null, checkboxState: IntroCheckboxState) => void;
  }

  let { lang, initialValue, initialCheckboxState, threshold, conditions, recipients, onContinue, onBack }: Props = $props();

  // Get initial content
  const initialContent = (() => {
    const translations = getTranslations(lang);
    return initialValue ?? translations.introEditor.sidePanel.exampleContentJson;
  })();

  let sidePanelOpen: boolean = $state(true);
  let editorElement: HTMLDivElement | null = $state(null);
  let editor: Editor | null = $state(null);
  let messageJson: JSONContent | null = $state(initialContent);
  let editorVersion: number = $state(0);

  // Initialize checkbox states based on content detection or saved state
  function getInitialCheckboxStates(content: JSONContent, saved?: IntroCheckboxState) {
    return {
      authorIdentity: saved?.authorIdentity ?? false,
      secretHolders: computeInitialCheckboxState(hasNodeTypeInJSON(content, 'recipientsBlock'), saved?.secretHolders),
      openingConditions: computeInitialCheckboxState(hasNodeTypeInJSON(content, 'conditionsBlock'), saved?.openingConditions),
      dated: computeInitialCheckboxState(hasNodeTypeInJSON(content, 'dateTimeInline'), saved?.dated),
      quorum: computeInitialCheckboxState(hasNodeTypeInJSON(content, 'quorumInline'), saved?.quorum),
      directives: saved?.directives ?? false,
    };
  }
  const initCheckboxes = untrack(() => getInitialCheckboxStates(initialContent, initialCheckboxState));

  // Checkbox states
  let checkAuthorIdentity: boolean = $state(initCheckboxes.authorIdentity);
  let checkSecretHolders: boolean = $state(initCheckboxes.secretHolders);
  let checkOpeningConditions: boolean = $state(initCheckboxes.openingConditions);
  let checkDated: boolean = $state(initCheckboxes.dated);
  let checkQuorum: boolean = $state(initCheckboxes.quorum);
  let checkDirectives: boolean = $state(initCheckboxes.directives);

  let t = $derived(getTranslations(lang));

  // Auto-detect presence of components
  let hasRecipientsBlock = $derived(hasNodeTypeInJSON(messageJson, 'recipientsBlock'));
  let hasConditionsBlock = $derived(hasNodeTypeInJSON(messageJson, 'conditionsBlock'));
  let hasDateTimeInline = $derived(hasNodeTypeInJSON(messageJson, 'dateTimeInline'));
  let hasQuorumInline = $derived(hasNodeTypeInJSON(messageJson, 'quorumInline'));

  // Sync states for checkboxes
  const recipientsSyncState = createCheckboxSyncState(hasNodeTypeInJSON(initialContent, 'recipientsBlock'));
  const conditionsSyncState = createCheckboxSyncState(hasNodeTypeInJSON(initialContent, 'conditionsBlock'));
  const dateTimeSyncState = createCheckboxSyncState(hasNodeTypeInJSON(initialContent, 'dateTimeInline'));
  const quorumSyncState = createCheckboxSyncState(hasNodeTypeInJSON(initialContent, 'quorumInline'));

  // Sync checkboxes when components are added/removed
  $effect(() => syncCheckboxWithNode(hasRecipientsBlock, recipientsSyncState, v => checkSecretHolders = v));
  $effect(() => syncCheckboxWithNode(hasConditionsBlock, conditionsSyncState, v => checkOpeningConditions = v));
  $effect(() => syncCheckboxWithNode(hasDateTimeInline, dateTimeSyncState, v => checkDated = v));
  $effect(() => syncCheckboxWithNode(hasQuorumInline, quorumSyncState, v => checkQuorum = v));

  let hasContent = $derived(hasJsonContent(messageJson));
  let allEssentialsChecked = $derived(checkAuthorIdentity && checkSecretHolders && checkOpeningConditions && checkDated && checkQuorum);
  let anyChecked = $derived(checkAuthorIdentity || checkSecretHolders || checkOpeningConditions || checkDated || checkQuorum || checkDirectives);

  let buttonState = $derived(computeButtonState(hasContent, anyChecked, allEssentialsChecked));
  let buttonText = $derived(getButtonText(buttonState, t.introEditor.buttons));

  function getCurrentCheckboxState(): IntroCheckboxState {
    return {
      authorIdentity: checkAuthorIdentity,
      secretHolders: checkSecretHolders,
      openingConditions: checkOpeningConditions,
      dated: checkDated,
      quorum: checkQuorum,
      directives: checkDirectives,
    };
  }

  function handleContinue(): void {
    if (hasContent && editor) {
      onContinue(editor.getJSON(), getCurrentCheckboxState());
    }
  }

  function handleBack(): void {
    onBack(editor?.getJSON() ?? null, getCurrentCheckboxState());
  }

  function generateExample(): void {
    if (!editor) return;
    const exampleContent = t.introEditor.sidePanel.exampleContentJson;

    generateExampleInEditor(editor, exampleContent, hasContent);
    
    messageJson = editor.getJSON();
    editorVersion++;
  }

  /**
   * Update dynamic data via TipTap command (triggers NodeView updates)
   */
  function updateDynamicData(): void {
    if (!editor) return;
    editor.commands.setDynamicData({
      recipients: recipients ?? [],
      conditions: conditions ?? null,
      threshold,
      lang,
      contactTypeLabels: t.whoEditor.contactTypes,
    });
  }

  // Initialize TipTap editor
  $effect(() => {
    if (editorElement && !editor) {
      // Create editor with DynamicDataExtension for reactive data binding
      const newEditor = createTiptapEditor({
        element: editorElement,
        content: initialContent,
        placeholder: t.introEditor.placeholder,
        contentClass: 'tiptap-content',
        enableHeadings: true,
        extensions: [
          DynamicDataExtension,
          RecipientsBlock, 
          ConditionsBlock, 
          DateTimeInline, 
          QuorumInline
        ],
        onUpdate: (json) => {
          messageJson = json;
          editorVersion++;
        },
      });
      
      editor = newEditor;
      editorVersion++;
      
      // Set initial dynamic data after editor is ready
      setTimeout(() => updateDynamicData(), 0);
    }
  });

  // Update dynamic content when props change
  $effect(() => {
    // Track dependencies
    recipients;
    conditions;
    threshold;
    lang;
    
    if (editor) {
      updateDynamicData();
    }
  });

  onDestroy(() => editor?.destroy());

  // Auto-save
  $effect(() => {
    autoSave(() => ({ message: messageJson, checkboxState: getCurrentCheckboxState() }), 'intro');
  });
</script>

<EditorLayout
  title={t.introEditor.title}
  subtitle={t.introEditor.subtitle}
  {sidePanelOpen}
  collapseLabel={t.introEditor.sidePanel.collapse}
  expandLabel={t.introEditor.sidePanel.expand}
  wideSidePanel
  onToggleSidePanel={() => sidePanelOpen = !sidePanelOpen}
>
  {#snippet toolbar()}
    <RichTextToolbar {editor} {editorVersion} labels={t.introEditor.toolbar} {threshold} />
  {/snippet}

  <div class="tiptap-editor" bind:this={editorElement}></div>

  <ActionButtons
    backLabel={t.common.back}
    continueLabel={buttonText}
    {buttonState}
    disabled={!hasContent}
    onBack={handleBack}
    onContinue={handleContinue}
  />

  {#snippet sidePanelContent()}
    <h2>{t.introEditor.sidePanel.title}</h2>
    <p class="panel-intro">{t.introEditor.sidePanel.intro}</p>

    <EssentialSection note={t.introEditor.sidePanel.essentialNote}>
      <CheckboxItem
        bind:checked={checkDated}
        label={t.introEditor.sidePanel.checkboxes.dated.title}
        description={t.introEditor.sidePanel.checkboxes.dated.description}
        essential
        readonly={hasDateTimeInline}
      />
      <CheckboxItem
        bind:checked={checkQuorum}
        label={t.introEditor.sidePanel.checkboxes.quorum.title}
        description={t.introEditor.sidePanel.checkboxes.quorum.description}
        essential
        readonly={hasQuorumInline}
      />
      <CheckboxItem
        bind:checked={checkOpeningConditions}
        label={t.introEditor.sidePanel.checkboxes.openingConditions.title}
        description={t.introEditor.sidePanel.checkboxes.openingConditions.description}
        essential
        readonly={hasConditionsBlock}
      />
      <CheckboxItem
        bind:checked={checkSecretHolders}
        label={t.introEditor.sidePanel.checkboxes.secretHolders.title}
        description={t.introEditor.sidePanel.checkboxes.secretHolders.description}
        essential
        readonly={hasRecipientsBlock}
      />
      <CheckboxItem
        bind:checked={checkAuthorIdentity}
        label={t.introEditor.sidePanel.checkboxes.authorIdentity.title}
        description={t.introEditor.sidePanel.checkboxes.authorIdentity.description}
        essential
      />
    </EssentialSection>

    <div class="optional-section">
      <CheckboxItem
        bind:checked={checkDirectives}
        label={t.introEditor.sidePanel.checkboxes.directives.title}
        description={t.introEditor.sidePanel.checkboxes.directives.description}
      />
    </div>

    <div class="section-divider"></div>

    <GenerateExampleButton
      label={t.introEditor.sidePanel.generateExample}
      onclick={generateExample}
    />
  {/snippet}
</EditorLayout>

<style>
  .tiptap-editor {
    min-height: 350px;
  }

  @media (max-width: 600px) {
    .tiptap-editor {
      min-height: 200px;
    }
  }
</style>
