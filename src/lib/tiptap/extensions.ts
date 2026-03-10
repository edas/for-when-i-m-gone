/**
 * TipTap extensions utilities (e.g. node-type checks in JSON).
 * Extension nodes (conditions, recipients, datetime, quorum) live in ./extensions/*.
 */

import type { JSONContent } from '@tiptap/core';

/**
 * Check if a node type exists in JSONContent
 */
export function hasNodeTypeInJSON(json: JSONContent | null, nodeType: string): boolean {
  if (!json) return false;

  function searchNode(node: JSONContent): boolean {
    if (node.type === nodeType) return true;
    if (node.content) {
      for (const child of node.content) {
        if (searchNode(child)) return true;
      }
    }
    return false;
  }

  return searchNode(json);
}
