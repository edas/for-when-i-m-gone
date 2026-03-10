/**
 * TipTap extensions utilities (e.g. node-type checks in JSON and live editor).
 * Extension nodes (conditions, recipients, datetime, quorum) live in ./extensions/*.
 */

import type { Editor, JSONContent } from '@tiptap/core';

/**
 * Check if a node type exists in the editor's current document
 */
export function hasNodeTypeInEditor(editor: Editor, nodeType: string): boolean {
  let found = false;
  editor.state.doc.descendants((node) => {
    if (node.type.name === nodeType) {
      found = true;
      return false;
    }
    return true;
  });
  return found;
}

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
