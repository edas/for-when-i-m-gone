/**
 * TipTap DOM update utilities
 * 
 * Functions to refresh TipTap editor view when dynamic data changes.
 * The actual data is stored in dataProvider.ts and read by extensions.
 */

import type { Editor } from '@tiptap/core';
import { generateHTML } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { dynamicData } from './dataProvider';

// ============================================================================
// Utilities
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

// ============================================================================
// HTML Generation (for DOM updates)
// ============================================================================

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
// DOM Update Functions
// ============================================================================

/**
 * Update DOM for recipients blocks
 * Reads data from dynamicData and updates the DOM directly
 */
function updateRecipientsDOM(editorElement: HTMLElement | null): void {
  if (!editorElement) return;

  editorElement.querySelectorAll('[data-type="recipients-block"]').forEach((block) => {
    const html = generateRecipientsHtml();
    let contentDiv = block.querySelector('.recipients-content');

    if (html) {
      if (!contentDiv) {
        // Remove placeholder elements if present
        block.querySelector('.block-icon')?.remove();
        block.querySelector('.block-label')?.remove();

        contentDiv = document.createElement('div');
        contentDiv.className = 'recipients-content';
        block.appendChild(contentDiv);
      }
      contentDiv.innerHTML = html;
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
}

/**
 * Update DOM for conditions blocks
 * Reads data from dynamicData and updates the DOM directly
 */
function updateConditionsDOM(editorElement: HTMLElement | null): void {
  if (!editorElement) return;

  editorElement.querySelectorAll('[data-type="conditions-block"]').forEach((block) => {
    const html = generateConditionsHtml();
    let contentDiv = block.querySelector('.conditions-content');

    if (html) {
      if (!contentDiv) {
        // Remove placeholder text
        const textNodes = Array.from(block.childNodes).filter(n => n.nodeType === Node.TEXT_NODE);
        textNodes.forEach(n => n.remove());
        
        contentDiv = document.createElement('div');
        contentDiv.className = 'conditions-content';
        block.appendChild(contentDiv);
      }
      contentDiv.innerHTML = html;
    } else if (contentDiv) {
      contentDiv.remove();
      // Restore placeholder if needed
      if (!block.textContent?.trim()) {
        block.textContent = "Conditions d'ouverture";
      }
    }
  });
}

/**
 * Update DOM for quorum inline elements
 * Reads threshold from dynamicData
 */
function updateQuorumDOM(editorElement: HTMLElement | null): void {
  if (!editorElement) return;

  const { threshold } = dynamicData;
  const displayText = threshold > 0 ? String(threshold) : '[Quorum]';

  editorElement.querySelectorAll('[data-type="quorum-inline"]').forEach((node) => {
    node.textContent = displayText;
  });
}

/**
 * Update DOM for dateTimeInline nodes with current date/time
 */
function updateDateTimeDOM(editorElement: HTMLElement | null): void {
  if (!editorElement) return;

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
}

// ============================================================================
// Main Refresh Function
// ============================================================================

/**
 * Refresh all dynamic content in the TipTap editor
 * 
 * Call this after updating dynamicData to reflect changes in the editor.
 * This updates the DOM directly without modifying TipTap's internal state.
 * 
 * @param editor - The TipTap editor instance
 * @param editorElement - The editor's DOM element
 */
export function refreshDynamicContent(editor: Editor | null, editorElement: HTMLElement | null): void {
  if (!editor || !editorElement) return;

  requestAnimationFrame(() => {
    updateRecipientsDOM(editorElement);
    updateConditionsDOM(editorElement);
    updateQuorumDOM(editorElement);
    updateDateTimeDOM(editorElement);
  });
}
