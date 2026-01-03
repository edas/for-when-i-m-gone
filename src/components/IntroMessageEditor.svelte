<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import { Editor, type JSONContent } from '@tiptap/core';
  import StarterKit from '@tiptap/starter-kit';
  import Underline from '@tiptap/extension-underline';
  import { getTranslations, type Language } from '../lib/i18n';
  import { computeButtonState, getButtonText } from '../lib/buttonState';
  import { updateStoredDataDebounced } from '../lib/dataStore';
  import { RecipientsBlock, ConditionsBlock } from '../lib/tiptap/extensions';
  import EditorLayout from './ui/EditorLayout.svelte';
  import CheckboxItem from './ui/CheckboxItem.svelte';
  import ActionButtons from './ui/ActionButtons.svelte';
  import EssentialSection from './ui/EssentialSection.svelte';
  import RichTextToolbar from './ui/RichTextToolbar.svelte';
  import TipSection from './ui/TipSection.svelte';

  export interface IntroCheckboxState {
    secretHolders: boolean;
    openingConditions: boolean;
    directives: boolean;
  }

  export const defaultIntroCheckboxState: IntroCheckboxState = {
    secretHolders: false,
    openingConditions: false,
    directives: false,
  };

  interface Props {
    lang: Language;
    initialValue?: JSONContent | null;
    initialCheckboxState?: IntroCheckboxState;
    onContinue: (message: JSONContent | null, checkboxState: IntroCheckboxState) => void;
    onBack: (message: JSONContent | null, checkboxState: IntroCheckboxState) => void;
  }

  let { lang, initialValue, initialCheckboxState, onContinue, onBack }: Props = $props();

  let sidePanelOpen: boolean = $state(true);
  let editorElement: HTMLDivElement | null = $state(null);
  let editor: Editor | null = $state(null);
  let messageJson: JSONContent | null = $state(untrack(() => initialValue ?? null));

  // Checkbox states for verification
  let checkSecretHolders: boolean = $state(untrack(() => initialCheckboxState?.secretHolders ?? false));
  let checkOpeningConditions: boolean = $state(untrack(() => initialCheckboxState?.openingConditions ?? false));
  let checkDirectives: boolean = $state(untrack(() => initialCheckboxState?.directives ?? false));

  let t = $derived(getTranslations(lang));

  // Check if editor has meaningful content (not just empty paragraph)
  let hasContent = $derived.by(() => {
    if (!messageJson) return false;
    const content = messageJson.content;
    if (!content || content.length === 0) return false;
    // Check if it's just an empty paragraph
    if (content.length === 1 && content[0].type === 'paragraph' && !content[0].content) {
      return false;
    }
    return true;
  });

  let allEssentialsChecked = $derived(checkSecretHolders && checkOpeningConditions);
  let anyChecked = $derived(checkSecretHolders || checkOpeningConditions || checkDirectives);

  let buttonState = $derived(computeButtonState(hasContent, anyChecked, allEssentialsChecked));
  let buttonText = $derived(getButtonText(buttonState, t.introEditor.buttons));

  function getCurrentCheckboxState(): IntroCheckboxState {
    return {
      secretHolders: checkSecretHolders,
      openingConditions: checkOpeningConditions,
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

  // Initialize TipTap editor when element is mounted
  $effect(() => {
    if (editorElement && !editor) {
      const newEditor = new Editor({
        element: editorElement,
        extensions: [
          StarterKit.configure({
            // Disable features we don't need
            blockquote: false,
            code: false,
            codeBlock: false,
            hardBreak: false,
            horizontalRule: false,
            strike: false,
            // Keep: document, paragraph, text, bold, italic, heading, bulletList, orderedList, listItem
          }),
          Underline,
          RecipientsBlock,
          ConditionsBlock,
        ],
        content: initialValue ?? undefined,
        editorProps: {
          attributes: {
            class: 'rich-editor-content',
            'data-placeholder': t.introEditor.placeholder,
          },
        },
        onUpdate: ({ editor: e }) => {
          messageJson = e.getJSON();
        },
      });
      
      editor = newEditor;
    }
  });

  // Cleanup editor on destroy
  onDestroy(() => {
    editor?.destroy();
  });

  // Auto-save to JSON on any change (debounced)
  $effect(() => {
    const state = getCurrentCheckboxState();
    updateStoredDataDebounced({
      introMessage: messageJson,
      introCheckboxState: state,
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
    <RichTextToolbar {editor} labels={t.introEditor.toolbar} />
  {/snippet}

  <div
    class="rich-editor"
    bind:this={editorElement}
  ></div>

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
        bind:checked={checkSecretHolders}
        label={t.introEditor.sidePanel.checkboxes.secretHolders.title}
        description={t.introEditor.sidePanel.checkboxes.secretHolders.description}
        essential
      />
      <CheckboxItem
        bind:checked={checkOpeningConditions}
        label={t.introEditor.sidePanel.checkboxes.openingConditions.title}
        description={t.introEditor.sidePanel.checkboxes.openingConditions.description}
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

    <TipSection text={t.introEditor.sidePanel.tip} />
  {/snippet}
</EditorLayout>

<style>
  .rich-editor {
    flex: 1;
    min-height: 350px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 0 0 12px 12px;
    overflow-y: auto;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .rich-editor:focus-within {
    border-color: rgba(96, 165, 250, 0.5);
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.15);
  }

  /* TipTap editor content styles */
  .rich-editor :global(.rich-editor-content) {
    padding: 1.5rem;
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 1.05rem;
    line-height: 1.7;
    color: #e2e8f0;
    outline: none;
    min-height: 100%;
  }

  /* Placeholder */
  .rich-editor :global(.rich-editor-content.is-editor-empty:first-child::before) {
    content: attr(data-placeholder);
    color: rgba(255, 255, 255, 0.4);
    pointer-events: none;
    float: left;
    height: 0;
  }

  .rich-editor :global(h2) {
    font-size: 1.4rem;
    font-weight: 600;
    color: #ffffff;
    margin: 1rem 0 0.75rem 0;
  }

  .rich-editor :global(h2:first-child) {
    margin-top: 0;
  }

  .rich-editor :global(p) {
    margin-bottom: 0.75rem;
  }

  .rich-editor :global(ul), .rich-editor :global(ol) {
    margin: 0.75rem 0;
    padding-left: 1.5rem;
  }

  .rich-editor :global(li) {
    margin-bottom: 0.35rem;
  }

  /* Atomic blocks styles */
  .rich-editor :global(.recipients-block),
  .rich-editor :global(.conditions-block) {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    margin: 0.5rem 0;
    border-radius: 8px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 0.9rem;
    cursor: default;
    user-select: none;
  }

  .rich-editor :global(.recipients-block) {
    background: rgba(96, 165, 250, 0.15);
    border: 1px solid rgba(96, 165, 250, 0.4);
    color: #93c5fd;
  }

  .rich-editor :global(.conditions-block) {
    background: rgba(168, 85, 247, 0.15);
    border: 1px solid rgba(168, 85, 247, 0.4);
    color: #c4b5fd;
  }

  .rich-editor :global(.recipients-block.ProseMirror-selectednode),
  .rich-editor :global(.conditions-block.ProseMirror-selectednode) {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: 2px;
  }

  .rich-editor :global(.block-icon) {
    font-size: 1.1rem;
  }

  .rich-editor :global(.block-label) {
    font-weight: 500;
  }

  @media (max-width: 600px) {
    .rich-editor {
      min-height: 200px;
    }
  }
</style>
