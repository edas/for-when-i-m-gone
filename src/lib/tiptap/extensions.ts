/**
 * Custom TipTap extensions for non-editable atomic blocks
 */

import { Node, mergeAttributes } from '@tiptap/core';

/**
 * RecipientsBlock - Atomic block for displaying the list of recipients
 * Non-editable, can be inserted/deleted but not modified
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
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
          });
        },
    };
  },
});

/**
 * ConditionsBlock - Atomic block for displaying the opening conditions
 * Non-editable, can be inserted/deleted but not modified
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
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
          });
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
  }
}
