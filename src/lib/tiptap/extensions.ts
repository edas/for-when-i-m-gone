/**
 * Custom TipTap extensions for non-editable atomic blocks and inline elements
 * 
 * These extensions read dynamic data from dataProvider instead of storing
 * data in node attributes, keeping the TipTap JSON clean.
 */

import { Node, mergeAttributes, type Editor } from '@tiptap/core';
import type { JSONContent } from '@tiptap/core';
import { generateHTML } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { dynamicData } from './dataProvider';

/**
 * Check if a node type already exists in the editor document
 */
function hasNodeTypeInEditor(editor: Editor, nodeType: string): boolean {
  let found = false;
  editor.state.doc.descendants((node) => {
    if (node.type.name === nodeType) {
      found = true;
      return false; // Stop traversal
    }
    return true;
  });
  return found;
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

// ============================================================================
// HTML Generation Utilities
// ============================================================================

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

/**
 * Generate HTML for the recipients list from dynamicData
 */
function generateRecipientsHtml(): string {
  const { recipients, contactTypeLabels, lang } = dynamicData;
  
  // Filter out recipients that are marked as private
  const publicRecipients = recipients.filter((r) => !r.isPrivate);
  
  if (publicRecipients.length === 0) return '';
  
  // French typography: non-breaking space before colon; English: no space
  const colonSeparator = lang === 'fr' ? '\u00A0: ' : ': ';

  const items = publicRecipients
    .map((recipient) => {
      const contactParts = recipient.contacts
        .filter((c) => c.value.trim())
        .map((contact) => {
          const label = contactTypeLabels[contact.type as keyof typeof contactTypeLabels] || contact.type;
          const valueStr =
            contact.type !== 'other'
              ? `${label}${colonSeparator}${escapeHtml(contact.value)}`
              : escapeHtml(contact.value);
          return contact.comment.trim()
            ? `${valueStr} (${escapeHtml(contact.comment)})`
            : valueStr;
        });

      if (!recipient.name.trim() && contactParts.length === 0) return null;

      const namePart = recipient.name.trim()
        ? `<strong>${escapeHtml(recipient.name)}</strong>`
        : '';
      const separator = namePart && contactParts.length > 0 ? ' — ' : '';

      return `<li>${namePart}${separator}${contactParts.join(' — ')}</li>`;
    })
    .filter(Boolean);

  return items.length > 0 ? `<ul>${items.join('')}</ul>` : '';
}

/**
 * Generate HTML for conditions from dynamicData
 */
function generateConditionsHtml(): string {
  const { conditions } = dynamicData;
  if (!conditions) return '';
  
  try {
    return generateHTML(conditions, [starterKitConfig]);
  } catch (e) {
    console.error('Failed to render conditions:', e);
    return '';
  }
}

// ============================================================================
// Block Extensions
// ============================================================================

/**
 * RecipientsBlock - Atomic block for displaying the list of recipients
 * Reads data from dynamicData.recipients instead of node attributes
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
    const html = generateRecipientsHtml();
    const hasData = html.length > 0;

    const attrs = mergeAttributes(HTMLAttributes, {
      'data-type': 'recipients-block',
      'class': 'recipients-block',
      'contenteditable': 'false',
    });

    if (hasData) {
      // Return structure with content div - innerHTML will be set via NodeView or DOM update
      const wrapper = document.createElement('div');
      Object.entries(attrs).forEach(([key, value]) => {
        wrapper.setAttribute(key, value as string);
      });
      const contentDiv = document.createElement('div');
      contentDiv.className = 'recipients-content';
      contentDiv.innerHTML = html;
      wrapper.appendChild(contentDiv);
      
      return ['div', attrs, ['div', { class: 'recipients-content' }]];
    }

    // Placeholder content
    return [
      'div',
      attrs,
      ['span', { class: 'block-icon' }, '👥'],
      ['span', { class: 'block-label' }, 'Liste des destinataires'],
    ];
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
 * Reads data from dynamicData.conditions instead of node attributes
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
    const html = generateConditionsHtml();
    const hasData = html.length > 0;

    const attrs = mergeAttributes(HTMLAttributes, {
      'data-type': 'conditions-block',
      'class': 'conditions-block',
      'contenteditable': 'false',
    });

    if (hasData) {
      return ['div', attrs, ['div', { class: 'conditions-content' }]];
    }

    // Placeholder content
    return ['div', attrs, "Conditions d'ouverture"];
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
// Inline Extensions
// ============================================================================

/**
 * DateTimeInline - Inline element for displaying today's date and time
 * Non-editable, can be inserted anywhere inline with text
 */
export const DateTimeInline = Node.create({
  name: 'dateTimeInline',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  parseHTML() {
    return [{ tag: 'span[data-type="datetime-inline"]' }];
  },

  renderHTML({ HTMLAttributes }) {
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

    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'datetime-inline',
        'class': 'datetime-inline',
        'contenteditable': 'false',
      }),
      `${formattedDate}, ${formattedTime}`,
    ];
  },

  addCommands() {
    return {
      insertDateTimeInline:
        () =>
        ({ commands }) => {
          return commands.insertContent({ type: this.name });
        },
    };
  },
});

/**
 * QuorumInline - Inline element for displaying the required quorum
 * Reads threshold from dynamicData instead of node attributes
 */
export const QuorumInline = Node.create({
  name: 'quorumInline',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  parseHTML() {
    return [{ tag: 'span[data-type="quorum-inline"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const { threshold } = dynamicData;
    const displayText = threshold > 0 ? String(threshold) : '[Quorum]';

    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'quorum-inline',
        'class': 'quorum-inline',
        'contenteditable': 'false',
      }),
      displayText,
    ];
  },

  addCommands() {
    return {
      insertQuorumInline:
        () =>
        ({ commands }) => {
          return commands.insertContent({ type: this.name });
        },
    };
  },
});

// ============================================================================
// Type Augmentation
// ============================================================================

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    recipientsBlock: {
      insertRecipientsBlock: () => ReturnType;
    };
    conditionsBlock: {
      insertConditionsBlock: () => ReturnType;
    };
    dateTimeInline: {
      insertDateTimeInline: () => ReturnType;
    };
    quorumInline: {
      insertQuorumInline: () => ReturnType;
    };
  }
}
