/**
 * TipTap utility functions
 */

import type { JSONContent } from '@tiptap/core';

/**
 * Check if JSONContent has meaningful content (not just empty paragraphs)
 */
export function hasJsonContent(json: JSONContent | null | undefined): boolean {
  if (!json) return false;
  const content = json.content;
  if (!content || content.length === 0) return false;
  
  // Check if it's just an empty paragraph
  if (content.length === 1 && content[0].type === 'paragraph' && !content[0].content) {
    return false;
  }
  return true;
}

/**
 * Recursively update all nodes of a specific type with new attributes
 */
export function updateNodeAttrs(
  content: JSONContent,
  nodeType: string,
  attrs: Record<string, unknown>
): JSONContent {
  function updateNode(node: JSONContent): JSONContent {
    if (node.type === nodeType) {
      return {
        ...node,
        attrs: { ...(node.attrs || {}), ...attrs },
      };
    }
    if (node.content) {
      return {
        ...node,
        content: node.content.map(updateNode),
      };
    }
    return node;
  }
  
  return updateNode(content);
}
