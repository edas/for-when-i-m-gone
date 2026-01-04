/**
 * Custom TipTap extensions for non-editable atomic blocks and inline elements
 */

import { Node, mergeAttributes, type Editor } from '@tiptap/core';
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

// ============================================================================
// Atomic Block Factory
// ============================================================================

interface AtomicBlockConfig {
  /** Node name (e.g. 'recipientsBlock') */
  name: string;
  /** Data attribute key (e.g. 'recipients' -> data-recipients) */
  attrKey: string;
  /** CSS class name */
  className: string;
  /** Content class for when data is present */
  contentClass: string;
  /** Placeholder content when no data [icon, label] or just text */
  placeholder: [string, string] | string;
  /** Command name (e.g. 'insertRecipientsBlock') */
  commandName: string;
}

/**
 * Factory to create atomic block extensions with similar behavior.
 * These blocks are non-editable, draggable, and can only be inserted once per document.
 */
function createAtomicBlock(config: AtomicBlockConfig) {
  const { name, attrKey, className, contentClass, placeholder, commandName } = config;
  const dataType = name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  const dataAttr = `data-${attrKey}`;

  return Node.create({
    name,
    group: 'block',
    atom: true,
    draggable: true,
    selectable: true,

    addAttributes() {
      return {
        [attrKey]: {
          default: null,
          parseHTML: (element: Element) => element.getAttribute(dataAttr) || null,
          renderHTML: (attributes: Record<string, unknown>) => {
            if (attributes[attrKey]) {
              return { [dataAttr]: attributes[attrKey] };
            }
            return {};
          },
        },
      };
    },

    parseHTML() {
      return [{ tag: `div[data-type="${dataType}"]` }];
    },

    renderHTML({ node, HTMLAttributes }) {
      const dataValue = node.attrs[attrKey];
      const hasData = !!dataValue;

      const attrs = mergeAttributes(HTMLAttributes, {
        'data-type': dataType,
        'class': className,
        'contenteditable': 'false',
      });

      if (hasData) {
        attrs[dataAttr] = dataValue;
        return ['div', attrs, ['div', { class: contentClass }]];
      }

      // Placeholder content
      if (Array.isArray(placeholder)) {
        return [
          'div',
          attrs,
          ['span', { class: 'block-icon' }, placeholder[0]],
          ['span', { class: 'block-label' }, placeholder[1]],
        ];
      }
      return ['div', attrs, placeholder];
    },

    addCommands() {
      return {
        [commandName]:
          () =>
          ({ commands, editor }: { commands: any; editor: Editor }) => {
            if (hasNodeTypeInEditor(editor, name)) {
              return false;
            }
            return commands.insertContent([
              { type: name },
              { type: 'paragraph' },
            ]);
          },
      };
    },
  });
}

// ============================================================================
// Block Extensions
// ============================================================================

/**
 * RecipientsBlock - Atomic block for displaying the list of recipients
 */
export const RecipientsBlock = createAtomicBlock({
  name: 'recipientsBlock',
  attrKey: 'recipients',
  className: 'recipients-block',
  contentClass: 'recipients-content',
  placeholder: ['👥', 'Liste des destinataires'],
  commandName: 'insertRecipientsBlock',
});

/**
 * ConditionsBlock - Atomic block for displaying the opening conditions
 */
export const ConditionsBlock = createAtomicBlock({
  name: 'conditionsBlock',
  attrKey: 'conditions',
  className: 'conditions-block',
  contentClass: 'conditions-content',
  placeholder: "Conditions d'ouverture",
  commandName: 'insertConditionsBlock',
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
 * Non-editable, can be inserted anywhere inline with text
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
            return { 'data-threshold': String(attributes.threshold) };
          }
          return {};
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-type="quorum-inline"]' }];
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
      insertQuorumInline: (options?: { threshold?: number }) => ReturnType;
    };
  }
}
