/**
 * Custom TipTap extensions for non-editable atomic blocks and inline elements
 */

import { Node, mergeAttributes, type Editor, generateHTML } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import type { JSONContent } from '@tiptap/core';

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

/**
 * RecipientsBlock - Atomic block for displaying the list of recipients
 * Non-editable, can be inserted/deleted but not modified
 * Can only be inserted once per document
 */
export const RecipientsBlock = Node.create({
  name: 'recipientsBlock',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      recipients: {
        default: null,
        parseHTML: (element) => {
          const value = element.getAttribute('data-recipients');
          return value || null;
        },
        renderHTML: (attributes) => {
          if (attributes.recipients) {
            return {
              'data-recipients': attributes.recipients,
            };
          }
          return {};
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="recipients-block"]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const recipientsJson = node.attrs.recipients;
    const hasRecipients = !!recipientsJson;
    
    // Store recipients JSON in data attribute for later rendering
    const attrs = mergeAttributes(HTMLAttributes, {
      'data-type': 'recipients-block',
      'class': 'recipients-block',
      'contenteditable': 'false',
    });
    
    if (hasRecipients) {
      attrs['data-recipients'] = recipientsJson;
      return [
        'div',
        attrs,
        ['div', { class: 'recipients-content' }],
      ];
    }
    
    // Placeholder content when no recipients are available
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
        ({ commands, editor }) => {
          // Prevent inserting if already exists
          if (hasNodeTypeInEditor(editor, 'recipientsBlock')) {
            return false;
          }
          // Insert block followed by empty paragraph to ensure next content is on new line
          return commands.insertContent([
            { type: this.name },
            { type: 'paragraph' },
          ]);
        },
    };
  },
});

/**
 * Helper function to convert JSONContent to HTML string
 */
function conditionsJsonToHtml(conditionsJson: string | null): string | null {
  if (!conditionsJson) return null;
  
  try {
    const conditions: JSONContent = JSON.parse(conditionsJson);
    // Use TipTap to generate HTML from JSONContent
    const html = generateHTML(conditions, [
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
    return html;
  } catch (e) {
    console.error('Failed to parse conditions JSON:', e);
    return null;
  }
}

/**
 * ConditionsBlock - Atomic block for displaying the opening conditions
 * Non-editable, can be inserted/deleted but not modified
 * Can only be inserted once per document
 */
export const ConditionsBlock = Node.create({
  name: 'conditionsBlock',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      conditions: {
        default: null,
        parseHTML: (element) => {
          const value = element.getAttribute('data-conditions');
          return value || null;
        },
        renderHTML: (attributes) => {
          if (attributes.conditions) {
            return {
              'data-conditions': attributes.conditions,
            };
          }
          return {};
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="conditions-block"]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const conditionsJson = node.attrs.conditions;
    const hasConditions = !!conditionsJson;
    
    // Store conditions JSON in data attribute for later rendering
    const attrs = mergeAttributes(HTMLAttributes, {
      'data-type': 'conditions-block',
      'class': 'conditions-block',
      'contenteditable': 'false',
    });
    
    if (hasConditions) {
      attrs['data-conditions'] = conditionsJson;
      return [
        'div',
        attrs,
        ['div', { class: 'conditions-content' }],
      ];
    }
    
    // Placeholder content when no conditions are available (should not appear in normal flow)
    return [
      'div',
      attrs,
      "Conditions d'ouverture",
    ];
  },

  addCommands() {
    return {
      insertConditionsBlock:
        () =>
        ({ commands, editor }) => {
          // Prevent inserting if already exists
          if (hasNodeTypeInEditor(editor, 'conditionsBlock')) {
            return false;
          }
          // Insert block followed by empty paragraph to ensure next content is on new line
          return commands.insertContent([
            { type: this.name },
            { type: 'paragraph' },
          ]);
        },
    };
  },
});

/**
 * DateTimeInline - Inline element for displaying today's date and time
 * Non-editable, can be inserted anywhere inline with text
 * Can be inserted multiple times in the document
 */
export const DateTimeInline = Node.create({
  name: 'dateTimeInline',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  parseHTML() {
    return [
      {
        tag: 'span[data-type="datetime-inline"]',
      },
    ];
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
 * Non-editable, can be inserted anywhere inline with text
 * Can be inserted multiple times in the document
 */
export const QuorumInline = Node.create({
  name: 'quorumInline',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      threshold: {
        default: null,
        parseHTML: (element) => {
          const value = element.getAttribute('data-threshold');
          return value ? parseInt(value, 10) : null;
        },
        renderHTML: (attributes) => {
          if (attributes.threshold !== null && attributes.threshold !== undefined) {
            return {
              'data-threshold': String(attributes.threshold),
            };
          }
          return {};
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="quorum-inline"]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const threshold = node.attrs.threshold;
    const displayText = threshold !== null && threshold !== undefined ? String(threshold) : '[Quorum]';
    
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
        (options?: { threshold?: number }) =>
        ({ commands }) => {
          const attrs = options?.threshold !== undefined ? { threshold: options.threshold } : {};
          return commands.insertContent({ type: this.name, attrs });
        },
    };
  },
});

// Type augmentation for custom commands
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
      insertQuorumInline: (options?: { threshold?: number }) => ReturnType;
    };
  }
}
