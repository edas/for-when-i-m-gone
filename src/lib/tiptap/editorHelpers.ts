/**
 * Helper functions for TipTap editor initialization and common operations
 */

import type { Editor, JSONContent } from '@tiptap/core';
import { createTiptapEditor, type TiptapEditorOptions } from './createEditor';

/**
 * Initialize TipTap editor with common pattern
 */
export function initializeTiptapEditor(
  editorElement: HTMLElement | null,
  options: Omit<TiptapEditorOptions, 'element'>
): Editor | null {
  if (!editorElement) return null;
  
  return createTiptapEditor({
    element: editorElement,
    ...options,
  });
}

/**
 * Generate example content in TipTap editor
 * If editor has content, appends example. Otherwise, replaces content.
 */
export function generateExampleInEditor(
  editor: Editor | null,
  exampleContent: JSONContent,
  hasContent: boolean
): void {
  if (!editor) return;

  if (hasContent) {
    editor.commands.setTextSelection(editor.state.doc.content.size);
    editor.commands.insertContent([
      { type: 'paragraph' },
      { type: 'paragraph' },
      ...(exampleContent.content ?? []),
    ]);
  } else {
    editor.commands.setContent(exampleContent);
  }
}
