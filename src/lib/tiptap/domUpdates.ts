/**
 * TipTap DOM update utilities
 * Functions to synchronize TipTap editor content with dynamic data
 */

import { generateHTML, type Editor, type JSONContent } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import type { Recipient } from '../types/recipient';

// ============================================================================
// Utilities
// ============================================================================

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * StarterKit configuration for rendering JSON to HTML
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
// Generic Editor Node Updates
// ============================================================================

/**
 * Generic function to update all nodes of a given type in the editor
 */
function updateEditorNodes(
  editor: Editor,
  nodeType: string,
  getNewAttrs: (currentAttrs: Record<string, unknown>) => Record<string, unknown>
): void {
  if (!editor) return;

  const positions: number[] = [];
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === nodeType) {
      positions.push(pos);
    }
  });

  if (positions.length > 0) {
    const tr = editor.state.tr;
    positions.forEach((pos) => {
      const node = editor.state.doc.nodeAt(pos);
      if (node && node.type.name === nodeType) {
        tr.setNodeMarkup(pos, undefined, getNewAttrs(node.attrs));
      }
    });
    editor.view.dispatch(tr);
  }
}

// ============================================================================
// Editor Node Update Functions
// ============================================================================

/**
 * Update conditionsBlock nodes in the editor with actual conditions content
 */
export function updateConditionsBlocks(editor: Editor, conditions: JSONContent | null): void {
  const conditionsJson = conditions ? JSON.stringify(conditions) : null;
  updateEditorNodes(editor, 'conditionsBlock', (attrs) => ({
    ...attrs,
    conditions: conditionsJson,
  }));
}

/**
 * Update recipientsBlock nodes in the editor with actual recipients data
 */
export function updateRecipientsBlocks(editor: Editor, recipientsList: Recipient[] | undefined): void {
  const recipientsJson = recipientsList?.length ? JSON.stringify(recipientsList) : null;
  updateEditorNodes(editor, 'recipientsBlock', (attrs) => ({
    ...attrs,
    recipients: recipientsJson,
  }));
}

/**
 * Update quorumInline nodes in the editor with current threshold
 */
export function updateQuorumInlines(editor: Editor, thresholdValue: number): void {
  updateEditorNodes(editor, 'quorumInline', (attrs) => ({
    ...attrs,
    threshold: thresholdValue,
  }));
}

// ============================================================================
// DOM Update Functions
// ============================================================================

/**
 * Update DOM for conditions blocks (renders the conditions content)
 */
export function updateConditionsDOM(editorElement: HTMLElement | null): void {
  if (!editorElement) return;

  requestAnimationFrame(() => {
    editorElement.querySelectorAll('[data-type="conditions-block"]').forEach((block) => {
      const conditionsJson = block.getAttribute('data-conditions');
      const contentDiv = block.querySelector('.conditions-content');

      if (conditionsJson && contentDiv) {
        try {
          const conditionsData: JSONContent = JSON.parse(conditionsJson);
          contentDiv.innerHTML = generateHTML(conditionsData, [starterKitConfig]);
        } catch (e) {
          console.error('Failed to render conditions:', e);
        }
      } else if (!conditionsJson) {
        contentDiv?.remove();
      }
    });
  });
}

/**
 * Update DOM for dateTimeInline nodes with current date/time
 */
export function updateDateTimeDOM(editorElement: HTMLElement | null): void {
  if (!editorElement) return;

  requestAnimationFrame(() => {
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
    const dateTimeText = `${formattedDate}, ${formattedTime}`;

    editorElement.querySelectorAll('[data-type="datetime-inline"]').forEach((node) => {
      node.textContent = dateTimeText;
    });
  });
}

// ============================================================================
// Recipients HTML Generation
// ============================================================================

/**
 * Contact type labels interface for generateRecipientsHtml
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
 * Options for generating recipients HTML
 */
export interface GenerateRecipientsHtmlOptions {
  contactTypeLabels: ContactTypeLabels;
  lang: 'en' | 'fr';
}

/**
 * Generate HTML for recipients list
 */
export function generateRecipientsHtml(
  recipientsList: Recipient[],
  options: GenerateRecipientsHtmlOptions
): string {
  const { contactTypeLabels, lang } = options;
  // French typography: non-breaking space before colon; English: no space
  const colonSeparator = lang === 'fr' ? '\u00A0: ' : ': ';

  // Filter out recipients that are marked as private
  const publicRecipients = recipientsList.filter((r) => !r.isPrivate);

  const items = publicRecipients
    .map((recipient) => {
      const contactParts = recipient.contacts
        .filter((c) => c.value.trim())
        .map((contact) => {
          const valueStr =
            contact.type !== 'other'
              ? `${contactTypeLabels[contact.type as keyof ContactTypeLabels] || contact.type}${colonSeparator}${escapeHtml(contact.value)}`
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
 * Update DOM for recipients blocks
 */
export function updateRecipientsDOM(
  editorElement: HTMLElement | null,
  options: GenerateRecipientsHtmlOptions
): void {
  if (!editorElement) return;

  requestAnimationFrame(() => {
    editorElement.querySelectorAll('[data-type="recipients-block"]').forEach((block) => {
      const recipientsJson = block.getAttribute('data-recipients');
      let contentDiv = block.querySelector('.recipients-content');

      if (recipientsJson) {
        try {
          const recipientsList: Recipient[] = JSON.parse(recipientsJson);
          const html = generateRecipientsHtml(recipientsList, options);

          if (!contentDiv) {
            // Remove placeholder elements if present
            block.querySelector('.block-icon')?.remove();
            block.querySelector('.block-label')?.remove();

            contentDiv = document.createElement('div');
            contentDiv.className = 'recipients-content';
            block.appendChild(contentDiv);
          }

          contentDiv.innerHTML = html;
        } catch (e) {
          console.error('Failed to render recipients:', e);
        }
      } else if (contentDiv) {
        // If no recipients data, restore placeholder
        contentDiv.remove();
        if (!block.querySelector('.block-icon')) {
          const icon = document.createElement('span');
          icon.className = 'block-icon';
          icon.textContent = '👥';
          const label = document.createElement('span');
          label.className = 'block-label';
          label.textContent = 'Liste des destinataires';
          block.appendChild(icon);
          block.appendChild(label);
        }
      }
    });
  });
}
