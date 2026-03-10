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
 * True if the document has at least one node with meaningful content (not only empty paragraphs/headings or whitespace).
 */
export function hasJsonContent(json: JSONContent | null | undefined): boolean {
  if (!json?.content?.length) return false;
  return json.content.some(
    (node) =>
      (node.type !== 'paragraph' && node.type !== 'heading') || !isNodeContentEmpty(node)
  );
}
