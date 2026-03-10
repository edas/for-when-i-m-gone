import { EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import tiptap from '@/components/ui/TipTapEditor.module.css';
import introStyles from '../IntroMessageEditor.module.css';
import { RichTextToolbar, type ToolbarButton } from '@/components/ui/RichTextToolbar';
import { useTranslation } from 'react-i18next';
import { hasConditionsBlock } from '@/lib/tiptap/extensions/conditions';
import { hasRecipientsBlock } from '@/lib/tiptap/extensions/recipients';

/** Chain type including custom intro-editor commands (not in @tiptap/core typings) */
type IntroEditorChain = ReturnType<Editor['chain']> & {
  insertDateTimeInline(): IntroEditorChain;
  insertQuorumInline(): IntroEditorChain;
  insertConditionsBlock(): IntroEditorChain;
  insertRecipientsBlock(): IntroEditorChain;
};

export function IntroEditor({ editor }: { editor: Editor | null }) {
  const { t } = useTranslation();
  const chain = () => editor?.chain()?.focus() as IntroEditorChain | undefined;
  const insertButtons: ToolbarButton[] = [
    { icon: 'calendar', label: t('introEditor.toolbar.insertDateTime'), action: () => chain()?.insertDateTimeInline().run() },
    { icon: 'quorum', label: t('introEditor.toolbar.insertQuorum'), action: () => chain()?.insertQuorumInline().run() },
    {
      icon: 'lock',
      label: t('introEditor.toolbar.insertConditions'),
      action: () => chain()?.insertConditionsBlock().run(),
      disabled: hasConditionsBlock(editor),
    },
    {
      icon: 'users',
      label: t('introEditor.toolbar.insertRecipients'),
      action: () => chain()?.insertRecipientsBlock().run(),
      disabled: hasRecipientsBlock(editor),
    },
  ];

  return (
    <section className={introStyles.section}>
      <label className={introStyles.sectionSubtitle}>{t('introEditor.subtitle')}</label>
      <div className={tiptap.editorWrapper}>
        <RichTextToolbar editor={editor} insertButtons={insertButtons} />
        <EditorContent editor={editor} className={tiptap.tiptapEditor} />
      </div>
    </section>
  );
}