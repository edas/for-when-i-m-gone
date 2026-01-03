<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import { Editor, type JSONContent, generateHTML } from '@tiptap/core';
  import StarterKit from '@tiptap/starter-kit';
  import { getTranslations, type Language } from '../lib/i18n';
  import { computeButtonState, getButtonText } from '../lib/buttonState';
  import { updateStoredDataDebounced } from '../lib/dataStore';
  import { RecipientsBlock, ConditionsBlock, DateTimeInline, QuorumInline } from '../lib/tiptap/extensions';
  import EditorLayout from './ui/EditorLayout.svelte';
  import CheckboxItem from './ui/CheckboxItem.svelte';
  import ActionButtons from './ui/ActionButtons.svelte';
  import EssentialSection from './ui/EssentialSection.svelte';
  import RichTextToolbar from './ui/RichTextToolbar.svelte';
  import GenerateExampleButton from './ui/GenerateExampleButton.svelte';

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
    onContinue: (message: JSONContent | null, checkboxState: IntroCheckboxState) => void;
    onBack: (message: JSONContent | null, checkboxState: IntroCheckboxState) => void;
  }

  let { lang, initialValue, initialCheckboxState, threshold, conditions, onContinue, onBack }: Props = $props();

  // Generate example content for a given language
  function getExampleContent(language: Language): JSONContent {
    return language === 'fr' 
      ? {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Le ' },
                { type: 'dateTimeInline' },
              ],
            },
            { type: 'paragraph' },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Je vous ai laissé mes informations à vous tous. Vous pourrez y accéder ensemble, à condition d\'être au moins ' },
                { type: 'quorumInline' },
                { type: 'text', text: '. Faites-en un usage raisonné.' },
              ],
            },
            { type: 'paragraph' },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Je vous fais confiance pour ne l\'utiliser qu\'aux conditions suivantes :' },
              ],
            },
            { type: 'conditionsBlock' },
            { type: 'paragraph' },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Pour vous joindre, voici les personnes qui détiennent un fichier similaire :' },
              ],
            },
            { type: 'recipientsBlock' },
            { type: 'paragraph' },
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'italic' }], text: '{xxxx Nom Prénom xxxx}' },
              ],
            },
          ],
        }
      : {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'On ' },
                { type: 'dateTimeInline' },
              ],
            },
            { type: 'paragraph' },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'I have left my information for all of you. You will be able to access it together, provided at least ' },
                { type: 'quorumInline' },
                { type: 'text', text: ' of you are present. Please use it wisely.' },
              ],
            },
            { type: 'paragraph' },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'I trust you to only use it under the following conditions:' },
              ],
            },
            { type: 'conditionsBlock' },
            { type: 'paragraph' },
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'To reach each other, here are the people who hold a similar file:' },
              ],
            },
            { type: 'recipientsBlock' },
            { type: 'paragraph' },
            {
              type: 'paragraph',
              content: [
                { type: 'text', marks: [{ type: 'italic' }], text: '{xxxx First Name Last Name xxxx}' },
              ],
            },
          ],
        };
  }

  // Helper function to update quorumInline nodes with threshold
  // Always updates the threshold, even if it already exists
  function updateQuorumNodes(content: JSONContent, thresholdValue: number): JSONContent {
    function updateNode(node: JSONContent): JSONContent {
      if (node.type === 'quorumInline') {
        return {
          ...node,
          attrs: { ...(node.attrs || {}), threshold: thresholdValue },
        };
      }
      if (node.content) {
        return {
          ...node,
          content: node.content.map(updateNode),
        };
      }
      return node;
    }
    
    return updateNode(content);
  }

  // Get initial content: use provided value or default example, and update quorum nodes
  function getInitialContent(): JSONContent {
    const content = initialValue ?? getExampleContent(lang);
    return updateQuorumNodes(content, threshold);
  }

  // Helper function to check if a node type exists in the JSON content
  function hasNodeType(json: JSONContent | null, nodeType: string): boolean {
    if (!json) return false;
    
    function searchNode(node: JSONContent): boolean {
      if (node.type === nodeType) return true;
      if (node.content) {
        for (const child of node.content) {
          if (searchNode(child)) return true;
        }
      }
      return false;
    }
    
    return searchNode(json);
  }

  let sidePanelOpen: boolean = $state(true);
  let editorElement: HTMLDivElement | null = $state(null);
  let editor: Editor | null = $state(null);
  const initialContent = getInitialContent();
  let messageJson: JSONContent | null = $state(initialContent);
  let editorVersion: number = $state(0);

  // Compute initial checkbox states based on content detection or saved state
  // Checkbox is checked if component is present OR if user manually checked it
  function getInitialCheckboxStates(content: JSONContent, saved?: IntroCheckboxState) {
    return {
      authorIdentity: saved?.authorIdentity ?? false,
      secretHolders: hasNodeType(content, 'recipientsBlock') || (saved?.secretHolders ?? false),
      openingConditions: hasNodeType(content, 'conditionsBlock') || (saved?.openingConditions ?? false),
      dated: hasNodeType(content, 'dateTimeInline') || (saved?.dated ?? false),
      quorum: hasNodeType(content, 'quorumInline') || (saved?.quorum ?? false),
      directives: saved?.directives ?? false,
    };
  }
  const initCheckboxes = (() => getInitialCheckboxStates(initialContent, initialCheckboxState))();

  // Checkbox states for verification
  let checkAuthorIdentity: boolean = $state(initCheckboxes.authorIdentity);
  let checkSecretHolders: boolean = $state(initCheckboxes.secretHolders);
  let checkOpeningConditions: boolean = $state(initCheckboxes.openingConditions);
  let checkDated: boolean = $state(initCheckboxes.dated);
  let checkQuorum: boolean = $state(initCheckboxes.quorum);
  let checkDirectives: boolean = $state(initCheckboxes.directives);

  let t = $derived(getTranslations(lang));

  // Auto-detect presence of components in the message
  let hasRecipientsBlock = $derived(hasNodeType(messageJson, 'recipientsBlock'));
  let hasConditionsBlock = $derived(hasNodeType(messageJson, 'conditionsBlock'));
  let hasDateTimeInline = $derived(hasNodeType(messageJson, 'dateTimeInline'));
  let hasQuorumInline = $derived(hasNodeType(messageJson, 'quorumInline'));

  // Track previous component presence to detect additions/removals
  let prevHasRecipients = $state(hasNodeType(initialContent, 'recipientsBlock'));
  let prevHasConditions = $state(hasNodeType(initialContent, 'conditionsBlock'));
  let prevHasDateTime = $state(hasNodeType(initialContent, 'dateTimeInline'));
  let prevHasQuorum = $state(hasNodeType(initialContent, 'quorumInline'));

  // Sync checkboxes when components are added or removed
  $effect(() => {
    const current = hasRecipientsBlock;
    const prev = untrack(() => prevHasRecipients);
    if (current && !prev) {
      // Component added → check
      checkSecretHolders = true;
    } else if (!current && prev) {
      // Component removed → uncheck
      checkSecretHolders = false;
    }
    prevHasRecipients = current;
  });
  $effect(() => {
    const current = hasConditionsBlock;
    const prev = untrack(() => prevHasConditions);
    if (current && !prev) {
      checkOpeningConditions = true;
    } else if (!current && prev) {
      checkOpeningConditions = false;
    }
    prevHasConditions = current;
  });
  $effect(() => {
    const current = hasDateTimeInline;
    const prev = untrack(() => prevHasDateTime);
    if (current && !prev) {
      checkDated = true;
    } else if (!current && prev) {
      checkDated = false;
    }
    prevHasDateTime = current;
  });
  $effect(() => {
    const current = hasQuorumInline;
    const prev = untrack(() => prevHasQuorum);
    if (current && !prev) {
      checkQuorum = true;
    } else if (!current && prev) {
      checkQuorum = false;
    }
    prevHasQuorum = current;
  });

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

    const exampleContent = getExampleContent(lang);

    // If there's existing content, append the example; otherwise replace
    if (hasContent) {
      // Insert at end: add separator paragraphs then example content
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

  // Function to update conditionsBlock nodes with actual conditions content
  function updateConditionsBlocks(editor: Editor, conditions: JSONContent | null): void {
    if (!editor) return;
    
    const conditionsJson = conditions ? JSON.stringify(conditions) : null;
    
    // Collect all positions of conditionsBlock nodes first
    const positions: number[] = [];
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'conditionsBlock') {
        positions.push(pos);
      }
    });
    
    // Update all conditionsBlock nodes in a single transaction
    if (positions.length > 0) {
      const tr = editor.state.tr;
      positions.forEach((pos) => {
        const node = editor.state.doc.nodeAt(pos);
        if (node && node.type.name === 'conditionsBlock') {
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            conditions: conditionsJson,
          });
        }
      });
      editor.view.dispatch(tr);
    }
  }

  // Function to update quorumInline nodes with current threshold
  function updateQuorumInlines(editor: Editor, thresholdValue: number): void {
    if (!editor) return;
    
    // Collect all positions of quorumInline nodes first
    const positions: number[] = [];
    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'quorumInline') {
        positions.push(pos);
      }
    });
    
    // Update all quorumInline nodes in a single transaction
    if (positions.length > 0) {
      const tr = editor.state.tr;
      positions.forEach((pos) => {
        const node = editor.state.doc.nodeAt(pos);
        if (node && node.type.name === 'quorumInline') {
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            threshold: thresholdValue,
          });
        }
      });
      editor.view.dispatch(tr);
    }
  }

  // Function to update DOM for dateTimeInline nodes with current date/time
  function updateDateTimeDOM(): void {
    if (!editorElement) return;
    
    requestAnimationFrame(() => {
      const dateNodes = editorElement?.querySelectorAll('[data-type="datetime-inline"]');
      dateNodes?.forEach((node) => {
        const now = new Date();
        const formattedDate = now.toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        const formattedTime = now.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        });
        node.textContent = `${formattedDate}, ${formattedTime}`;
      });
    });
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
            // Keep: document, paragraph, text, bold, italic, underline, heading, bulletList, orderedList, listItem
          }),
          RecipientsBlock,
          ConditionsBlock,
          DateTimeInline,
          QuorumInline,
        ],
        content: getInitialContent(),
        editorProps: {
          attributes: {
            class: 'rich-editor-content',
            'data-placeholder': t.introEditor.placeholder,
          },
        },
        onUpdate: ({ editor: e }) => {
          messageJson = e.getJSON();
          editorVersion++; // Trigger reactivity for toolbar button states
          
          // Update conditions blocks when content changes (e.g., new block inserted)
          if (conditions !== undefined) {
            updateConditionsBlocks(e, conditions);
            updateConditionsDOM();
          }
        },
      });
      
      editor = newEditor;
      editorVersion++; // Trigger initial check for existing blocks
      
      // Update all dynamic content after editor is initialized
      // Use setTimeout to ensure editor is fully initialized
      setTimeout(() => {
        // Update conditions blocks
        if (conditions !== undefined) {
          updateConditionsBlocks(newEditor, conditions);
          updateConditionsDOM();
        }
        
        // Update quorumInline nodes with current threshold
        updateQuorumInlines(newEditor, threshold);
        
        // Update dateTimeInline nodes with current date/time
        updateDateTimeDOM();
      }, 0);
    }
  });

  // Helper function to update DOM for conditions blocks
  function updateConditionsDOM(): void {
    if (!editorElement) return;
    
    requestAnimationFrame(() => {
      const blocks = editorElement?.querySelectorAll('[data-type="conditions-block"]');
      blocks?.forEach((block) => {
        const conditionsJson = block.getAttribute('data-conditions');
        const contentDiv = block.querySelector('.conditions-content');
        
        if (conditionsJson && contentDiv) {
          try {
            const conditionsData: JSONContent = JSON.parse(conditionsJson);
            const html = generateHTML(conditionsData, [
              StarterKit.configure({
                blockquote: false,
                code: false,
                codeBlock: false,
                hardBreak: false,
                horizontalRule: false,
                strike: false,
                heading: false,
              }),
            ]);
            contentDiv.innerHTML = html;
          } catch (e) {
            console.error('Failed to render conditions:', e);
          }
        } else if (!conditionsJson) {
          // Remove content div if no conditions
          contentDiv?.remove();
        }
      });
    });
  }

  // Update all dynamic content (conditions, quorum, date) when props change
  // This ensures everything is up-to-date when returning to this screen
  // We track threshold and conditions to trigger updates when they change
  $effect(() => {
    if (editor) {
      // Update conditions blocks
      if (conditions !== undefined) {
        updateConditionsBlocks(editor, conditions);
        updateConditionsDOM();
      }
      
      // Update quorumInline nodes with current threshold
      updateQuorumInlines(editor, threshold);
      
      // Update dateTimeInline nodes with current date/time
      // Use setTimeout to ensure this runs after the editor is fully rendered
      setTimeout(() => {
        updateDateTimeDOM();
      }, 0);
    }
  });

  // Separate effect to update date when editor is first created
  // This ensures date is current even if threshold/conditions haven't changed
  $effect(() => {
    if (editor) {
      // Update date after editor is ready
      const timeoutId = setTimeout(() => {
        updateDateTimeDOM();
      }, 50);
      return () => clearTimeout(timeoutId);
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
      intro: {
        message: messageJson,
        checkboxState: state,
      },
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
  .rich-editor :global(.recipients-block) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    margin: 0.5rem 0;
    border-radius: 8px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 0.9rem;
    cursor: default;
    user-select: none;
    width: fit-content;
    background: rgba(96, 165, 250, 0.15);
    border: 1px solid rgba(96, 165, 250, 0.4);
    color: #93c5fd;
  }

  /* Conditions block - no box, just subtle color like dateTimeInline and quorumInline */
  .rich-editor :global(.conditions-block) {
    display: block;
    margin: 0.5rem 0;
    padding: 0;
    background: none;
    border: none;
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 1.05rem;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.75);
    cursor: default;
    user-select: none;
  }

  .rich-editor :global(.conditions-block.ProseMirror-selectednode) {
    outline: 2px solid rgba(255, 255, 255, 0.3);
    outline-offset: 1px;
    border-radius: 2px;
  }

  /* Conditions content styles - normal block display */
  .rich-editor :global(.conditions-block .conditions-content) {
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: 1.05rem;
    line-height: 1.7;
    color: rgba(255, 255, 255, 0.75);
    display: block;
  }

  .rich-editor :global(.conditions-block .conditions-content p) {
    margin-bottom: 0.75rem;
  }

  .rich-editor :global(.conditions-block .conditions-content ul),
  .rich-editor :global(.conditions-block .conditions-content ol) {
    margin: 0.75rem 0;
    padding-left: 1.5rem;
  }

  .rich-editor :global(.conditions-block .conditions-content li) {
    margin-bottom: 0.35rem;
  }

  .rich-editor :global(.recipients-block.ProseMirror-selectednode) {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: 2px;
  }

  .rich-editor :global(.block-icon) {
    font-size: 1.1rem;
  }

  .rich-editor :global(.block-label) {
    font-weight: 500;
  }

  /* Inline datetime styles */
  .rich-editor :global(.datetime-inline) {
    display: inline;
    color: rgba(255, 255, 255, 0.75);
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: inherit;
    white-space: nowrap;
    cursor: default;
    user-select: none;
  }

  .rich-editor :global(.datetime-inline.ProseMirror-selectednode) {
    outline: 2px solid rgba(255, 255, 255, 0.3);
    outline-offset: 1px;
  }

  /* Inline quorum styles */
  .rich-editor :global(.quorum-inline) {
    display: inline;
    color: rgba(255, 255, 255, 0.75);
    font-family: 'Georgia', 'Times New Roman', serif;
    font-size: inherit;
    white-space: nowrap;
    cursor: default;
    user-select: none;
  }

  .rich-editor :global(.quorum-inline.ProseMirror-selectednode) {
    outline: 2px solid rgba(255, 255, 255, 0.3);
    outline-offset: 1px;
  }

  @media (max-width: 600px) {
    .rich-editor {
      min-height: 200px;
    }
  }
</style>
