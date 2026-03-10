/**
 * Custom TipTap extensions for non-editable atomic blocks and inline elements
 * 
 * Uses factory functions with closures to capture dynamic data,
 * and NodeViews for reactive rendering when data changes.
 */

import { Node, mergeAttributes, type Editor, Extension } from '@tiptap/core';
import type { JSONContent } from '@tiptap/core';
import { generateHTML } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import type { Recipient } from '../types/recipient';
import type { Language } from '../i18n';
export { DateTimeInline } from './extensions/datetime';
export { createConditionsBlock } from './extensions/conditions';
export { createRecipientsBlock } from './extensions/recipients';
export { createQuorumInline } from './extensions/quorum';

// ============================================================================
// Types
// ============================================================================

/**
 * Contact type labels for rendering recipients
 */
export interface ContactTypeLabels {
  phone: string;
  email: string;
  address: string;
  x: string;
  bluesky: string;
  mastodon: string;
  facebook: string;
  telegram: string;
  whatsapp: string;
  signal: string;
  instagram: string;
  snapchat: string;
  linkedin: string;
  web: string;
  other: string;
}

/**
 * Dynamic data passed to extension factories
 */
interface DynamicExtensionData {
  recipients: Recipient[];
  conditions: JSONContent | null;
  threshold: number;
  lang: Language;
  contactTypeLabels: ContactTypeLabels;
}

/**
 * Storage interface for dynamic data extension
 */
interface DynamicDataStorage {
  data: DynamicExtensionData;
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Check if a node type already exists in the editor document
 */
function hasNodeTypeInEditor(editor: Editor, nodeType: string): boolean {
  let found = false;
  editor.state.doc.descendants((node) => {
    if (node.type.name === nodeType) {
      found = true;
      return false;
    }
    return true;
  });
  return found;
}

/**
 * Helper to check if recipients block exists in an editor
 */
export function hasRecipientsBlock(editor: Editor | null): boolean {
  if (!editor) return false;
  return hasNodeTypeInEditor(editor, 'recipientsBlock');
}

/**
 * Helper to check if conditions block exists in an editor
 */
export function hasConditionsBlock(editor: Editor | null): boolean {
  if (!editor) return false;
  return hasNodeTypeInEditor(editor, 'conditionsBlock');
}

/**
 * Check if a node type exists in JSONContent
 */
export function hasNodeTypeInJSON(json: JSONContent | null, nodeType: string): boolean {
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

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * StarterKit configuration for rendering conditions JSON to HTML
 */
const starterKitConfig = StarterKit.configure({
  blockquote: false,
  code: false,
  codeBlock: false,
  hardBreak: false,
  horizontalRule: false,
  strike: false,
  heading: false,
});

// ============================================================================
// HTML Generation Functions (closures over data)
// ============================================================================

/**
 * Create a function that generates recipients HTML from captured data
 */
function createRecipientsRenderer(getData: () => DynamicExtensionData): () => RenderResult {
  return () => {
    const { recipients, contactTypeLabels, lang } = getData();
    
    const publicRecipients = recipients.filter((r) => !r.isPrivate);
    
    // No recipients at all - show placeholder
    if (recipients.length === 0) {
      return { hasData: false, html: '' };
    }
    
    // Has recipients (even if all private or no displayable info) - don't show placeholder
    const colonSeparator = lang === 'fr' ? '\u00A0: ' : ': ';

    const items = publicRecipients
      .map((recipient) => {
        const contactParts = recipient.contacts
          .filter((c) => c.value.trim())
          .map((contact) => {
            const label = contactTypeLabels[contact.type as keyof typeof contactTypeLabels] || contact.type;
            return contact.type !== 'other'
              ? `${label}${colonSeparator}${escapeHtml(contact.value)}`
              : escapeHtml(contact.value);
          });

        if (!recipient.name.trim() && contactParts.length === 0) return null;

        const namePart = recipient.name.trim()
          ? `<strong>${escapeHtml(recipient.name)}</strong>`
          : '';
        const separator = namePart && contactParts.length > 0 ? ' — ' : '';

        return `<li>${namePart}${separator}${contactParts.join(' — ')}</li>`;
      })
      .filter(Boolean);

    const html = items.length > 0 ? `<ul>${items.join('')}</ul>` : '';
    return { hasData: true, html };
  };
}

/**
 * Create a function that generates conditions HTML from captured data
 */
function createConditionsRenderer(getData: () => DynamicExtensionData): () => RenderResult {
  return () => {
    const { conditions } = getData();
    
    // No conditions data - show placeholder
    if (!conditions) {
      return { hasData: false, html: '' };
    }
    
    // Has conditions data - render it
    try {
      const html = generateHTML(conditions, [starterKitConfig]);
      return { hasData: true, html };
    } catch (e) {
      console.error('Failed to render conditions:', e);
      return { hasData: true, html: '' };
    }
  };
}

// ============================================================================
// Dynamic Data Extension
// ============================================================================

/**
 * Extension that stores dynamic data and provides commands to update it
 */
export const DynamicDataExtension = Extension.create<{}, DynamicDataStorage>({
  name: 'dynamicData',

  addStorage() {
    return {
      data: {
        recipients: [],
        conditions: null,
        threshold: 0,
        lang: 'en' as Language,
        contactTypeLabels: {
          phone: 'Phone',
          email: 'Email',
          address: 'Address',
          x: 'X',
          bluesky: 'Bluesky',
          mastodon: 'Mastodon',
          facebook: 'Facebook',
          telegram: 'Telegram',
          whatsapp: 'WhatsApp',
          signal: 'Signal',
          instagram: 'Instagram',
          snapchat: 'Snapchat',
          linkedin: 'LinkedIn',
          web: 'Web',
          other: 'Other',
        },
      },
    };
  },

  addCommands() {
    return {
      setDynamicData: (data: Partial<DynamicExtensionData>) => ({ editor }) => {
        Object.assign(editor.storage.dynamicData.data, data);
        // Update all registered NodeViews with new data
        updateAllNodeViews(editor);
        return true;
      },
    };
  },
});

/**
 * Get dynamic data from editor storage
 */
function getDataFromEditor(editor: Editor): DynamicExtensionData {
  return editor.storage.dynamicData?.data ?? {
    recipients: [],
    conditions: null,
    threshold: 0,
    lang: 'en',
    contactTypeLabels: {} as ContactTypeLabels,
  };
}

// ============================================================================
// NodeView Registry (for reactive updates)
// ============================================================================

/**
 * Registry of active NodeView render functions, keyed by editor instance
 * This allows us to update all NodeViews when dynamic data changes
 */
const nodeViewRegistry = new WeakMap<Editor, Set<() => void>>();

/**
 * Register a NodeView render function for an editor
 */
function registerNodeView(editor: Editor, renderFn: () => void): void {
  if (!nodeViewRegistry.has(editor)) {
    nodeViewRegistry.set(editor, new Set());
  }
  nodeViewRegistry.get(editor)!.add(renderFn);
}

/**
 * Unregister a NodeView render function
 */
function unregisterNodeView(editor: Editor, renderFn: () => void): void {
  nodeViewRegistry.get(editor)?.delete(renderFn);
}

/**
 * Update all registered NodeViews for an editor
 */
function updateAllNodeViews(editor: Editor): void {
  const renderFns = nodeViewRegistry.get(editor);
  if (renderFns) {
    renderFns.forEach(fn => fn());
  }
}

// ============================================================================
// NodeView Helpers
// ============================================================================

/**
 * Create a block NodeView with reactive rendering
 */
/**
 * Result of rendering dynamic content
 * - hasData: true if there's source data (even if nothing to display)
 * - html: the generated HTML content
 */
interface RenderResult {
  hasData: boolean;
  html: string;
}

function createBlockNodeView(
  className: string,
  dataType: string,
  renderContent: (data: DynamicExtensionData) => RenderResult,
  placeholderIcon: string,
  placeholderLabel: string,
  showDeleteButton: boolean = false
) {
  return ({ editor, getPos }: { editor: Editor; getPos: () => number | undefined }) => {
    const dom = document.createElement('div');
    dom.setAttribute('data-type', dataType);
    dom.className = className;
    dom.contentEditable = 'false';
    dom.style.position = 'relative';

    // Create delete button if needed
    let deleteButton: HTMLButtonElement | null = null;
    if (showDeleteButton) {
      deleteButton = document.createElement('button');
      deleteButton.className = 'block-delete-button';
      deleteButton.innerHTML = '×';
      deleteButton.setAttribute('aria-label', 'Retirer ce composant');
      deleteButton.setAttribute('type', 'button');
      
      deleteButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const pos = getPos();
        if (pos !== undefined) {
          // Select the node at this position and delete it
          const tr = editor.state.tr;
          const node = tr.doc.nodeAt(pos);
          if (node) {
            tr.delete(pos, pos + node.nodeSize);
            editor.view.dispatch(tr);
          }
        }
      });
      
      dom.appendChild(deleteButton);
    }

    const render = () => {
      const data = getDataFromEditor(editor);
      const { hasData, html } = renderContent(data);
      
      // Get the content container (or create it)
      let contentContainer = dom.querySelector(`.${className.replace('block', 'content')}`) as HTMLElement;
      if (!contentContainer) {
        contentContainer = document.createElement('div');
        contentContainer.className = className.replace('block', 'content');
        // Insert before delete button if it exists
        if (deleteButton && dom.contains(deleteButton)) {
          dom.insertBefore(contentContainer, deleteButton);
        } else {
          dom.appendChild(contentContainer);
        }
      }
      
      if (hasData) {
        // Data exists - show content (even if empty)
        contentContainer.innerHTML = html || '';
      } else {
        // No data - show placeholder
        contentContainer.innerHTML = `<span class="block-icon">${placeholderIcon}</span><span class="block-label">${placeholderLabel}</span>`;
      }
    };

    // Register this NodeView for reactive updates
    registerNodeView(editor, render);

    // Initial render
    render();

    return {
      dom,
      update: () => {
        render();
        return true;
      },
      destroy: () => {
        unregisterNodeView(editor, render);
      },
      ignoreMutation: () => true,
    };
  };
}

// ============================================================================
// Block Extensions
// ============================================================================

/**
 * RecipientsBlock - Atomic block for displaying the list of recipients
 */
export const RecipientsBlock = Node.create({
  name: 'recipientsBlock',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  parseHTML() {
    return [{ tag: 'div[data-type="recipients-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'recipients-block',
        'class': 'recipients-block',
        'contenteditable': 'false',
      }),
      ['span', { class: 'block-icon' }, '👥'],
      ['span', { class: 'block-label' }, 'Liste des destinataires'],
    ];
  },

  addNodeView() {
    return createBlockNodeView(
      'recipients-block',
      'recipients-block',
      (data) => {
        const renderHtml = createRecipientsRenderer(() => data);
        return renderHtml();
      },
      '👥',
      'Liste des destinataires',
      true // Show delete button
    );
  },

  addCommands() {
    return {
      insertRecipientsBlock:
        () =>
        ({ commands, editor }: { commands: any; editor: Editor }) => {
          if (hasNodeTypeInEditor(editor, 'recipientsBlock')) {
            return false;
          }
          return commands.insertContent([
            { type: 'recipientsBlock' },
            { type: 'paragraph' },
          ]);
        },
    };
  },
});

/**
 * ConditionsBlock - Atomic block for displaying the opening conditions
 */
export const ConditionsBlock = Node.create({
  name: 'conditionsBlock',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  parseHTML() {
    return [{ tag: 'div[data-type="conditions-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'conditions-block',
        'class': 'conditions-block',
        'contenteditable': 'false',
      }),
      "Conditions d'ouverture",
    ];
  },

  addNodeView() {
    return createBlockNodeView(
      'conditions-block',
      'conditions-block',
      (data) => {
        const renderHtml = createConditionsRenderer(() => data);
        return renderHtml();
      },
      '📋',
      "Conditions d'ouverture",
      true // Show delete button
    );
  },

  addCommands() {
    return {
      insertConditionsBlock:
        () =>
        ({ commands, editor }: { commands: any; editor: Editor }) => {
          if (hasNodeTypeInEditor(editor, 'conditionsBlock')) {
            return false;
          }
          return commands.insertContent([
            { type: 'conditionsBlock' },
            { type: 'paragraph' },
          ]);
        },
    };
  },
});

// ============================================================================
// Type Augmentation
// =========================================================================
