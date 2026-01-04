<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { Editor, JSONContent } from '@tiptap/core';
  import { getTranslations, type Language } from '../lib/i18n';
  import { computeButtonState, getButtonText } from '../lib/buttonState';
  import { updateStoredDataDebounced } from '../lib/dataStore';
  import { RecipientsBlock, ConditionsBlock, DateTimeInline, QuorumInline, hasNodeTypeInJSON } from '../lib/tiptap/extensions';
  import { createTiptapEditor } from '../lib/tiptap/createEditor';
  import { hasJsonContent, updateNodeAttrs } from '../lib/tiptap/utils';
  import {
    createCheckboxSyncState,
    syncCheckboxWithNode,
    computeInitialCheckboxState,
  } from '../lib/checkboxSync';
  import {
    updateConditionsBlocks,
    updateConditionsDOM,
    updateRecipientsBlocks,
    updateRecipientsDOM,
    updateQuorumInlines,
    updateDateTimeDOM,
    type GenerateRecipientsHtmlOptions,
  } from '../lib/tiptap/domUpdates';
  import type { Recipient } from './WhoEditor.svelte';
  import EditorLayout from './ui/EditorLayout.svelte';
  import CheckboxItem from './ui/CheckboxItem.svelte';
  import ActionButtons from './ui/ActionButtons.svelte';
  import EssentialSection from './ui/EssentialSection.svelte';
  import RichTextToolbar from './ui/RichTextToolbar.svelte';
  import GenerateExampleButton from './ui/GenerateExampleButton.svelte';
  import '../styles/tiptap-editor.css';

  export interface IntroCheckboxState {
    authorIdentity: boolean;
    secretHolders: boolean;
    openingConditions: boolean;
    dated: boolean;
    quorum: boolean;
    directives: boolean;
  }

  export const defaultIntroCheckboxState: IntroCheckboxState = {
    authorIdentity: false,
    secretHolders: false,
    openingConditions: false,
    dated: false,
    quorum: false,
    directives: false,
  };

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

  // Get initial content with updated quorum nodes
  const initialContent = (() => {
    const translations = getTranslations(lang);
    const content = initialValue ?? translations.introEditor.sidePanel.exampleContentJson;
    return updateNodeAttrs(content, 'quorumInline', { threshold });
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
  const initCheckboxes = getInitialCheckboxStates(initialContent, initialCheckboxState);

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

    if (hasContent) {
      editor.commands.setTextSelection(editor.state.doc.content.size);
      editor.commands.insertContent([
        { type: 'paragraph' },
        { type: 'paragraph' },
        ...exampleContent.content!,
      ]);
    } else {
      editor.commands.setContent(exampleContent);
    }
    
    messageJson = editor.getJSON();
    editorVersion++;
  }

  function getRecipientsHtmlOptions(): GenerateRecipientsHtmlOptions {
    return { contactTypeLabels: t.whoEditor.contactTypes, lang };
  }

  function updateDynamicContent(ed: Editor): void {
    if (conditions !== undefined) {
      updateConditionsBlocks(ed, conditions);
      updateConditionsDOM(editorElement);
    }
    if (recipients !== undefined) {
      updateRecipientsBlocks(ed, recipients);
      updateRecipientsDOM(editorElement, getRecipientsHtmlOptions());
    }
    updateQuorumInlines(ed, threshold);
    updateDateTimeDOM(editorElement);
  }

  // Initialize TipTap editor
  $effect(() => {
    if (editorElement && !editor) {
      const newEditor = createTiptapEditor({
        element: editorElement,
        content: initialContent,
        placeholder: t.introEditor.placeholder,
        contentClass: 'tiptap-content',
        enableHeadings: true,
        extensions: [RecipientsBlock, ConditionsBlock, DateTimeInline, QuorumInline],
        onUpdate: (json) => {
          messageJson = json;
          editorVersion++;
          updateDynamicContent(newEditor);
        },
      });
      
      editor = newEditor;
      editorVersion++;
      setTimeout(() => updateDynamicContent(newEditor), 0);
    }
  });

  // Update dynamic content when props change
  $effect(() => {
    if (editor) {
      updateDynamicContent(editor);
    }
  });

  onDestroy(() => editor?.destroy());

  // Auto-save
  $effect(() => {
    updateStoredDataDebounced({
      intro: { message: messageJson, checkboxState: getCurrentCheckboxState() },
    });
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
        bind:checked={checkAuthorIdentity}
        label={t.introEditor.sidePanel.checkboxes.authorIdentity.title}
        description={t.introEditor.sidePanel.checkboxes.authorIdentity.description}
        essential
      />
      <CheckboxItem
        bind:checked={checkSecretHolders}
        label={t.introEditor.sidePanel.checkboxes.secretHolders.title}
        description={t.introEditor.sidePanel.checkboxes.secretHolders.description}
        essential
        readonly={hasRecipientsBlock}
      />
      <CheckboxItem
        bind:checked={checkOpeningConditions}
        label={t.introEditor.sidePanel.checkboxes.openingConditions.title}
        description={t.introEditor.sidePanel.checkboxes.openingConditions.description}
        essential
        readonly={hasConditionsBlock}
      />
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
