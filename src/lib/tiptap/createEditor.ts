/**
 * Shared StarterKit configuration for TipTap editors
 */

import StarterKit from '@tiptap/starter-kit';

/**
 * Base StarterKit configuration used by all editors.
 * @param enableHeadings - If false (default), heading is disabled; if true, uses StarterKit default.
 */
export function getBaseStarterKit(enableHeadings = false) {
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
