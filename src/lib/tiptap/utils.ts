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
 * Check if a node (paragraph, heading, etc.) is empty or contains only whitespace
 */
function isNodeContentEmpty(node: JSONContent): boolean {
  if (!node.content || node.content.length === 0) return true;
  return node.content.every(n =>
    n.type === 'text' ? isWhitespaceOnly(n.text) : false
  );
}

/**
 * Check if JSONContent has meaningful content (not just empty paragraphs, headings, or whitespace)
 */
export function hasJsonContent(json: JSONContent | null | undefined): boolean {
  if (!json) return false;
  const content = json.content;
  if (!content || content.length === 0) return false;
  return !content.every(node =>
    (node.type === 'paragraph' || node.type === 'heading')
      ? isNodeContentEmpty(node)
      : false
  );
}
