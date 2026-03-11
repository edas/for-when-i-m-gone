import { Node, type Editor } from '@tiptap/core';
import type { ContactInfo, ContactType, Recipient } from '@/lib/types/recipient';
import { hasNodeTypeInEditor } from '../extensions';
import styles from '../extensions.module.css';

const RECIPIENTS_TYPE = 'recipientsBlock';
const RECIPIENTS_DATA_TYPE = 'recipients-block';
const RECIPIENTS_DATA_ATTR = 'data-recipients';
type ContactTypeLabelsMap = Record<ContactType, string>;

export function hasRecipientsBlock(editor: Editor | null): boolean {
  if (!editor) return false;
  return hasNodeTypeInEditor(editor, RECIPIENTS_TYPE);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function assertInjectedRecipients(value: unknown): asserts value is Recipient[] {
  if (!Array.isArray(value)) {
    throw new Error('Injected recipients must be an array.');
  }
}

function assertRecipient(recipient: Recipient, index: number): void {
  if (!recipient || typeof recipient !== 'object') {
    throw new Error(`Invalid recipient at index ${index}.`);
  }
  if (!Array.isArray(recipient.contacts)) {
    throw new Error(`Recipient contacts must be an array at index ${index}.`);
  }
}

function assertContactTypeLabels(value: unknown): asserts value is ContactTypeLabelsMap {
  if (!value || typeof value !== 'object') {
    throw new Error('Injected contact type labels must be an object.');
  }
}

function getContactLabel(
  contactType: ContactType,
  injectedContactTypeLabels: ContactTypeLabelsMap
): string {
  const label = injectedContactTypeLabels[contactType];
  if (typeof label !== 'string' || !label.trim()) {
    throw new Error(`Missing translated label for contact type "${contactType}".`);
  }

  return label;
}

function formatContact(
  contact: ContactInfo,
  injectedContactTypeLabels: ContactTypeLabelsMap
): string {
  if (!contact || typeof contact !== 'object') {
    throw new Error('Invalid contact value.');
  }

  if (typeof contact.type !== 'string' || !contact.type.trim()) {
    throw new Error('Contact type is required.');
  }

  if (typeof contact.value !== 'string') {
    throw new Error('Contact value must be a string.');
  }

  const value = contact.value.trim();
  if (!value) {
    return '';
  }

  const translatedTypeLabel = getContactLabel(contact.type, injectedContactTypeLabels);

  return `${escapeHtml(translatedTypeLabel)}: ${escapeHtml(value)}`;
}

function renderInjectedRecipientsAsHtml(
  injectedRecipients: Recipient[],
  injectedContactTypeLabels: ContactTypeLabelsMap
): string {
  assertInjectedRecipients(injectedRecipients);
  assertContactTypeLabels(injectedContactTypeLabels);

  const visibleRecipients = injectedRecipients.filter((recipient, index) => {
    assertRecipient(recipient, index);
    return !recipient.isPrivate;
  });

  const listItems = visibleRecipients.map((recipient, index) => {
    if (typeof recipient.name !== 'string') {
      throw new Error(`Recipient name must be a string at index ${index}.`);
    }

    const safeName = recipient.name.trim();
    const contacts = recipient.contacts
      .map((contact) => formatContact(contact, injectedContactTypeLabels))
      .filter(Boolean)
      .join(' — ');

    return `<li><strong>${escapeHtml(safeName)}&nbsp;:</strong> ${contacts}</li>`;
  });

  return `<ul>${listItems.join('')}</ul>`;
}

function createNode(html: string): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.setAttribute('data-type', RECIPIENTS_DATA_TYPE);
  wrapper.setAttribute(RECIPIENTS_DATA_ATTR, html);
  wrapper.className = `recipients-block ${styles.tiptapCustomNode} ${styles.tiptapBlockWithRemove}`;
  wrapper.contentEditable = 'false';

  const content = document.createElement('div');
  content.innerHTML = html;
  wrapper.appendChild(content);
  return wrapper;
}

export function createRecipientsBlock(
  injectedRecipients: Recipient[],
  injectedContactTypeLabels: ContactTypeLabelsMap
) {
  const renderedInjectedHtml = renderInjectedRecipientsAsHtml(
    injectedRecipients,
    injectedContactTypeLabels
  );

  return Node.create({
    name: RECIPIENTS_TYPE,
    group: 'block',
    atom: true,
    draggable: true,
    selectable: true,

    parseHTML() {
      return [{ tag: `div[data-type="${RECIPIENTS_DATA_TYPE}"]` }];
    },

    renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
      return createNode(
        renderedInjectedHtml ?? HTMLAttributes?.[RECIPIENTS_DATA_ATTR]?.toString() ?? ''
      );
    },

    addNodeView() {
      return ({ node, editor, getPos }) => {
        const wrapper = createNode(
          renderedInjectedHtml ?? node?.attrs?.[RECIPIENTS_DATA_ATTR]?.toString() ?? ''
        );

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = styles.tiptapBlockRemove;
        removeBtn.setAttribute('aria-label', 'Retirer le bloc');
        removeBtn.innerHTML = '×';
        removeBtn.addEventListener('click', () => {
          if (typeof getPos === 'function') {
            const pos = getPos();
            if (typeof pos === 'number') {
              const { from, to } = { from: pos, to: pos + node.nodeSize };
              editor.view.dispatch(editor.state.tr.delete(from, to));
            }
          }
        });
        wrapper.appendChild(removeBtn);

        return {
          dom: wrapper,
          ignoreMutation: () => true,
        };
      };
    },

    addCommands() {
      return {
        insertRecipientsBlock:
          () =>
          ({ commands, editor }: { commands: any; editor: Editor }) => {
            if (hasNodeTypeInEditor(editor, RECIPIENTS_TYPE)) {
              return false;
            }

            return commands.insertContent([
              {
                type: RECIPIENTS_TYPE,
                attrs: { [RECIPIENTS_DATA_ATTR]: renderedInjectedHtml ?? '' },
              },
              { type: 'paragraph' },
            ]);
          },
      } as any;
    },
  });
}
