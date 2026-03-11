/**
 * Shared StarterKit configuration for TipTap editors
 */

import StarterKit from '@tiptap/starter-kit';
import type { HeadingOptions } from '@tiptap/extension-heading';

export function getBaseStarterKit(levels: Partial<HeadingOptions> | undefined) {
  return StarterKit.configure({
    blockquote: false,
    code: false,
    codeBlock: false,
    hardBreak: false,
    horizontalRule: false,
    strike: false,
    heading: levels ?? false,
  });
}
