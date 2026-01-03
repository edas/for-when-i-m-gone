/**
 * HTML to TipTap JSON parsing utilities
 * Converts HTML strings to TipTap JSONContent format
 */

import type { JSONContent } from '@tiptap/core';

/**
 * Parse inline content (text, bold, italic, underline) from an element
 */
export function parseInlineContent(el: Element): JSONContent[] {
  const result: JSONContent[] = [];
  
  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (text) {
        result.push({ type: 'text', text });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const childEl = node as Element;
      const marks: { type: string }[] = [];
      
      if (childEl.tagName === 'STRONG' || childEl.tagName === 'B') {
        marks.push({ type: 'bold' });
      }
      if (childEl.tagName === 'EM' || childEl.tagName === 'I') {
        marks.push({ type: 'italic' });
      }
      if (childEl.tagName === 'U') {
        marks.push({ type: 'underline' });
      }
      
      const text = childEl.textContent;
      if (text) {
        if (marks.length > 0) {
          result.push({ type: 'text', text, marks });
        } else {
          result.push({ type: 'text', text });
        }
      }
    }
  });
  
  return result;
}

/**
 * Parse list items (li elements) from a list element
 */
export function parseListItems(el: Element): JSONContent[] {
  const items: JSONContent[] = [];
  
  el.querySelectorAll(':scope > li').forEach((li) => {
    items.push({
      type: 'listItem',
      content: [{
        type: 'paragraph',
        content: parseInlineContent(li),
      }],
    });
  });
  
  return items;
}

/**
 * Parse HTML string to TipTap JSONContent
 * Supports paragraphs, bullet lists, ordered lists, and inline formatting
 */
export function parseHtmlToJson(html: string): JSONContent {
  // Create a temporary div to parse the HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  const content: JSONContent[] = [];
  
  temp.childNodes.forEach((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      if (el.tagName === 'P') {
        content.push({
          type: 'paragraph',
          content: parseInlineContent(el),
        });
      } else if (el.tagName === 'UL') {
        content.push({
          type: 'bulletList',
          content: parseListItems(el),
        });
      } else if (el.tagName === 'OL') {
        content.push({
          type: 'orderedList',
          content: parseListItems(el),
        });
      }
    }
  });
  
  return { type: 'doc', content };
}
