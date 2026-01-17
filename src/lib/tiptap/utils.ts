/**
 * TipTap utility functions
 */

import type { JSONContent } from '@tiptap/core';

/**
 * Check if a text node contains only whitespace
 */
function isWhitespaceOnly(text: string | undefined): boolean {
  return !text || text.trim() === '';
}

/**
 * Check if a paragraph node is empty or contains only whitespace
 */
function isParagraphEmpty(paragraph: JSONContent): boolean {
  if (!paragraph.content || paragraph.content.length === 0) {
    return true;
  }
  
  // Check if all text nodes are whitespace-only
  return paragraph.content.every(node => {
    if (node.type === 'text') {
      return isWhitespaceOnly(node.text);
    }
    // Non-text nodes (images, etc.) count as content
    return false;
  });
}

/**
 * Check if a heading node is empty or contains only whitespace
 */
function isHeadingEmpty(heading: JSONContent): boolean {
  if (!heading.content || heading.content.length === 0) {
    return true;
  }
  
  // Check if all text nodes are whitespace-only
  return heading.content.every(node => {
    if (node.type === 'text') {
      return isWhitespaceOnly(node.text);
    }
    // Non-text nodes count as content
    return false;
  });
}

/**
 * Check if JSONContent has meaningful content (not just empty paragraphs, headings, or whitespace)
 */
export function hasJsonContent(json: JSONContent | null | undefined): boolean {
  if (!json) return false;
  const content = json.content;
  if (!content || content.length === 0) return false;
  
  // Check if all nodes are empty paragraphs or headings
  return !content.every(node => {
    if (node.type === 'paragraph') {
      return isParagraphEmpty(node);
    }
    if (node.type === 'heading') {
      return isHeadingEmpty(node);
    }
    // Non-paragraph/heading nodes (lists, etc.) count as content
    return false;
  });
}
