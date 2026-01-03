/**
 * TipTap DOM update utilities
 * Functions to synchronize TipTap editor content with dynamic data
 */

import { generateHTML, type Editor, type JSONContent } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import type { Recipient, ContactInfo } from '../../components/WhoEditor.svelte';

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Update conditionsBlock nodes in the editor with actual conditions content
 */
export function updateConditionsBlocks(editor: Editor, conditions: JSONContent | null): void {
  if (!editor) return;
  
  const conditionsJson = conditions ? JSON.stringify(conditions) : null;
  
  // Collect all positions of conditionsBlock nodes first
  const positions: number[] = [];
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'conditionsBlock') {
      positions.push(pos);
    }
  });
  
  // Update all conditionsBlock nodes in a single transaction
  if (positions.length > 0) {
    const tr = editor.state.tr;
    positions.forEach((pos) => {
      const node = editor.state.doc.nodeAt(pos);
      if (node && node.type.name === 'conditionsBlock') {
        tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          conditions: conditionsJson,
        });
      }
    });
    editor.view.dispatch(tr);
  }
}

/**
 * Update DOM for conditions blocks (renders the conditions content)
 */
export function updateConditionsDOM(editorElement: HTMLElement | null): void {
  if (!editorElement) return;
  
  requestAnimationFrame(() => {
    const blocks = editorElement?.querySelectorAll('[data-type="conditions-block"]');
    blocks?.forEach((block) => {
      const conditionsJson = block.getAttribute('data-conditions');
      const contentDiv = block.querySelector('.conditions-content');
      
      if (conditionsJson && contentDiv) {
        try {
          const conditionsData: JSONContent = JSON.parse(conditionsJson);
          const html = generateHTML(conditionsData, [
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
          contentDiv.innerHTML = html;
        } catch (e) {
          console.error('Failed to render conditions:', e);
        }
      } else if (!conditionsJson) {
        // Remove content div if no conditions
        contentDiv?.remove();
      }
    });
  });
}

/**
 * Update quorumInline nodes in the editor with current threshold
 */
export function updateQuorumInlines(editor: Editor, thresholdValue: number): void {
  if (!editor) return;
  
  // Collect all positions of quorumInline nodes first
  const positions: number[] = [];
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'quorumInline') {
      positions.push(pos);
    }
  });
  
  // Update all quorumInline nodes in a single transaction
  if (positions.length > 0) {
    const tr = editor.state.tr;
    positions.forEach((pos) => {
      const node = editor.state.doc.nodeAt(pos);
      if (node && node.type.name === 'quorumInline') {
        tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          threshold: thresholdValue,
        });
      }
    });
    editor.view.dispatch(tr);
  }
}

/**
 * Update DOM for dateTimeInline nodes with current date/time
 */
export function updateDateTimeDOM(editorElement: HTMLElement | null): void {
  if (!editorElement) return;
  
  requestAnimationFrame(() => {
    const dateNodes = editorElement?.querySelectorAll('[data-type="datetime-inline"]');
    dateNodes?.forEach((node) => {
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
      node.textContent = `${formattedDate}, ${formattedTime}`;
    });
  });
}

/**
 * Update recipientsBlock nodes in the editor with actual recipients data
 */
export function updateRecipientsBlocks(editor: Editor, recipientsList: Recipient[] | undefined): void {
  if (!editor) return;
  
  const recipientsJson = recipientsList && recipientsList.length > 0 
    ? JSON.stringify(recipientsList) 
    : null;
  
  // Collect all positions of recipientsBlock nodes first
  const positions: number[] = [];
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === 'recipientsBlock') {
      positions.push(pos);
    }
  });
  
  // Update all recipientsBlock nodes in a single transaction
  if (positions.length > 0) {
    const tr = editor.state.tr;
    positions.forEach((pos) => {
      const node = editor.state.doc.nodeAt(pos);
      if (node && node.type.name === 'recipientsBlock') {
        tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          recipients: recipientsJson,
        });
      }
    });
    editor.view.dispatch(tr);
  }
}

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
  const items: string[] = [];
  const { contactTypeLabels, lang } = options;
  // French typography: non-breaking space before colon; English: no space
  const colonSeparator = lang === 'fr' ? '\u00A0: ' : ': ';
  
  // Filter out recipients that are marked as private
  const publicRecipients = recipientsList.filter(r => !r.isPrivate);
  
  for (const recipient of publicRecipients) {
    // Build contacts list
    const contactParts: string[] = [];
    for (const contact of recipient.contacts) {
      if (!contact.value.trim()) continue;
      
      let contactStr = '';
      
      // Add type prefix (except for "other")
      if (contact.type !== 'other') {
        const typeLabel = contactTypeLabels[contact.type as keyof ContactTypeLabels] || contact.type;
        contactStr = `${typeLabel}${colonSeparator}${escapeHtml(contact.value)}`;
      } else {
        contactStr = escapeHtml(contact.value);
      }
      
      // Add comment in parentheses if present
      if (contact.comment.trim()) {
        contactStr += ` (${escapeHtml(contact.comment)})`;
      }
      
      contactParts.push(contactStr);
    }
    
    // Skip if no name and no contacts
    if (!recipient.name.trim() && contactParts.length === 0) continue;
    
    // Build the list item
    let itemHtml = '';
    
    // Add name in bold if present
    if (recipient.name.trim()) {
      itemHtml += `<strong>${escapeHtml(recipient.name)}</strong>`;
      if (contactParts.length > 0) {
        itemHtml += ' — ';
      }
    }
    
    // Add contacts
    itemHtml += contactParts.join(' — ');
    
    items.push(`<li>${itemHtml}</li>`);
  }
  
  if (items.length === 0) return '';
  
  return `<ul>${items.join('')}</ul>`;
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
    const blocks = editorElement?.querySelectorAll('[data-type="recipients-block"]');
    blocks?.forEach((block) => {
      const recipientsJson = block.getAttribute('data-recipients');
      let contentDiv = block.querySelector('.recipients-content');
      
      if (recipientsJson) {
        try {
          const recipientsList: Recipient[] = JSON.parse(recipientsJson);
          const html = generateRecipientsHtml(recipientsList, options);
          
          // Create content div if it doesn't exist
          if (!contentDiv) {
            // Remove placeholder elements if present
            const icon = block.querySelector('.block-icon');
            const label = block.querySelector('.block-label');
            icon?.remove();
            label?.remove();
            
            contentDiv = document.createElement('div');
            contentDiv.className = 'recipients-content';
            block.appendChild(contentDiv);
          }
          
          contentDiv.innerHTML = html;
        } catch (e) {
          console.error('Failed to render recipients:', e);
        }
      } else if (!recipientsJson && contentDiv) {
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
