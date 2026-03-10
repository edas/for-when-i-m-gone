import { Node, mergeAttributes } from '@tiptap/core';
import styles from '../extensions.module.css';

const QUORUM_TYPE = 'quorumInline';

function normalizeQuorum(value: unknown): number {
  const asNumber = Number(value);
  if (!Number.isFinite(asNumber)) {
    throw new Error(`Quorum must be a finite number, got: ${value}`);
  }
  const asInteger = Math.trunc(asNumber);
  if (asInteger !== asNumber) {
    throw new Error(`Quorum must be an integer, got: ${value}`);
  }
  if (asInteger < 1) {
    throw new Error(`Quorum must be a positive integer, got: ${value}`);
  }
  return asInteger;
}

function parseQuorumFromElement(element: Element): number {
  const stored = element.getAttribute('data-quorum');
  return normalizeQuorum(stored);
}

export function createQuorumInline(injectedQuorum: number) {
  const normalizedInjectedQuorum = normalizeQuorum(injectedQuorum);

  return Node.create({
    name: QUORUM_TYPE,
    group: 'inline',
    inline: true,
    atom: true,
    selectable: true,

    addAttributes() {
      return {
        quorum: {
          default: normalizedInjectedQuorum,
          parseHTML: (element: Element) => parseQuorumFromElement(element),
          renderHTML: () => ({
            'data-quorum': String(normalizedInjectedQuorum),
          }),
        },
      };
    },

    parseHTML() {
      return [{ tag: `span[data-type="${QUORUM_TYPE}"]` }];
    },

    renderHTML({ HTMLAttributes }) {
      return [
        'span',
        mergeAttributes(HTMLAttributes, {
          'data-type': QUORUM_TYPE,
          class: `${styles.tiptapCustomNode}`,
          'contenteditable': 'false',
          'data-quorum': String(normalizedInjectedQuorum),
        }),
        String(normalizedInjectedQuorum),
      ];
    },

    addCommands() {
      return {
        insertQuorumInline:
          () =>
          ({ commands }: { commands: any }) => {
            return commands.insertContent({
              type: this.name,
              attrs: { quorum: normalizedInjectedQuorum },
            });
          },
      } as any;
    },
  });
}
