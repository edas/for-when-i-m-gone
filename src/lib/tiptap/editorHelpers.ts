/**
 * Helper functions for TipTap editor initialization and common operations
 */

import type { Editor, JSONContent } from '@tiptap/core';
import { toStorageDateTimeValue } from './extensions/datetime';

interface IntroDynamicExampleValues {
  quorum: number;
  date?: Date;
}

function injectIntroDynamicValues(
  node: JSONContent,
  values: IntroDynamicExampleValues
): JSONContent {
  const updatedNode: JSONContent = { ...node };

  if (updatedNode.type === 'quorumInline') {
    updatedNode.attrs = {
      ...(updatedNode.attrs ?? {}),
      quorum: values.quorum,
    };
  }

  if (updatedNode.type === 'docDatetime') {
    updatedNode.attrs = {
      ...(updatedNode.attrs ?? {}),
      datetime: toStorageDateTimeValue(values.date ?? new Date()),
    };
  }

  if (Array.isArray(updatedNode.content)) {
    updatedNode.content = updatedNode.content.map((child) =>
      injectIntroDynamicValues(child, values)
    );
  }

  return updatedNode;
}

/**
 * Generate example content in TipTap editor
 * If editor has content, appends example. Otherwise, replaces content.
 */
export function generateExampleInEditor(
  editor: Editor | null,
  exampleContent: JSONContent,
  hasContent: boolean,
  introDynamicValues?: IntroDynamicExampleValues
): void {
  if (!editor) return;
  const contentToInsert = introDynamicValues
    ? injectIntroDynamicValues(exampleContent, introDynamicValues)
    : exampleContent;

  if (hasContent) {
    editor.commands.setTextSelection(editor.state.doc.content.size);
    editor.commands.insertContent([
      { type: 'paragraph' },
      { type: 'paragraph' },
      ...(contentToInsert.content ?? []),
    ]);
  } else {
    editor.commands.setContent(contentToInsert);
  }
}
