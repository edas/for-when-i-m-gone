/**
 * Factory function for creating TipTap editors with common configuration
 */

import { Editor, type JSONContent, type AnyExtension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

interface TiptapEditorOptions {
  element: HTMLElement;
  content: JSONContent | null;
  placeholder: string;
  /** CSS class for the editor content area */
  contentClass?: string;
  /** Additional extensions beyond StarterKit (nodes, marks, extensions) */
  extensions?: AnyExtension[];
  /** Enable headings (default: false for compact editors) */
  enableHeadings?: boolean;
  /** Callback when content changes */
  onUpdate?: (json: JSONContent) => void;
}

/**
 * Base StarterKit configuration used by all editors
 */
function getBaseStarterKit(enableHeadings: boolean) {
  return StarterKit.configure({
    blockquote: false,
    code: false,
    codeBlock: false,
    hardBreak: false,
    horizontalRule: false,
    strike: false,
    heading: enableHeadings ? undefined : false,
  });
}

/**
 * Create a TipTap editor instance with common configuration
 */
export function createTiptapEditor(options: TiptapEditorOptions): Editor {
  const {
    element,
    content,
    placeholder,
    contentClass = 'tiptap-content',
    extensions = [],
    enableHeadings = false,
    onUpdate,
  } = options;

  const editor = new Editor({
    element,
    extensions: [
      getBaseStarterKit(enableHeadings),
      ...extensions,
    ],
    content: content ?? undefined,
    editorProps: {
      attributes: {
        class: contentClass,
        'data-placeholder': placeholder,
      },
    },
    onUpdate: onUpdate ? ({ editor: e }) => onUpdate(e.getJSON()) : undefined,
  });

  return editor;
}
