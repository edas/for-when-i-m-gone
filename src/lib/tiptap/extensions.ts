/**
 * Custom TipTap extensions for non-editable atomic blocks and inline elements
 */

import { Node, mergeAttributes, type Editor } from '@tiptap/core';

/**
 * Check if a node type already exists in the document
 */
function hasNodeType(editor: Editor, nodeType: string): boolean {
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
 * Helper to check if recipients block exists in an editor
 */
export function hasRecipientsBlock(editor: Editor | null): boolean {
  if (!editor) return false;
  return hasNodeType(editor, 'recipientsBlock');
}

/**
 * Helper to check if conditions block exists in an editor
 */
export function hasConditionsBlock(editor: Editor | null): boolean {
  if (!editor) return false;
  return hasNodeType(editor, 'conditionsBlock');
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

  parseHTML() {
    return [
      {
        tag: 'div[data-type="recipients-block"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'recipients-block',
        'class': 'recipients-block',
        'contenteditable': 'false',
      }),
      // Placeholder content - will be replaced with actual recipient list later
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
          if (hasNodeType(editor, 'recipientsBlock')) {
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

  parseHTML() {
    return [
      {
        tag: 'div[data-type="conditions-block"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'conditions-block',
        'class': 'conditions-block',
        'contenteditable': 'false',
      }),
      // Placeholder content - will be replaced with actual conditions later
      ['span', { class: 'block-icon' }, '🔐'],
      ['span', { class: 'block-label' }, "Conditions d'ouverture"],
    ];
  },

  addCommands() {
    return {
      insertConditionsBlock:
        () =>
        ({ commands, editor }) => {
          // Prevent inserting if already exists
          if (hasNodeType(editor, 'conditionsBlock')) {
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
      `📅 ${formattedDate}, ${formattedTime}`,
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

  parseHTML() {
    return [
      {
        tag: 'span[data-type="quorum-inline"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'quorum-inline',
        'class': 'quorum-inline',
        'contenteditable': 'false',
      }),
      '👥 [Quorum]',
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
      insertQuorumInline: () => ReturnType;
    };
  }
}
