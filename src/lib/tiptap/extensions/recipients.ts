import { Node, mergeAttributes, type Editor } from '@tiptap/core';
import type { ContactInfo, ContactType, Recipient } from '@/lib/types/recipient';
import { hasNodeTypeInEditor } from '../extensions';
import styles from '../extensions.module.css';

const RECIPIENTS_TYPE = 'recipientsBlock';
const RECIPIENTS_DATA_TYPE = 'recipients-block';
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

    renderHTML({ HTMLAttributes }) {
      return [
        'div',
        mergeAttributes(HTMLAttributes, {
          'data-type': RECIPIENTS_DATA_TYPE,
          class: `recipients-block ${styles.tiptapCustomNode}`,
          contenteditable: 'false',
        }),
      ];
    },

    // @todo: merge avec renderHTML
    addNodeView() {
      return () => {
        const dom = document.createElement('div');
        dom.setAttribute('data-type', RECIPIENTS_DATA_TYPE);
        dom.className = `recipients-block ${styles.tiptapCustomNode}`;
        dom.contentEditable = 'false';
        dom.innerHTML = renderedInjectedHtml;

        return {
          dom,
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
              { type: RECIPIENTS_TYPE },
              { type: 'paragraph' },
            ]);
          },
      } as any;
    },
  });
}
