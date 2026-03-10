import { EditorContent } from '@tiptap/react';
import type { Editor } from '@tiptap/core';
import tiptap from '@/components/ui/TipTapEditor.module.css';
import introStyles from '../IntroMessageEditor.module.css';
import { RichTextToolbar, type ToolbarButton } from '@/components/ui/RichTextToolbar';
import { useTranslation } from 'react-i18next';
import { hasConditionsBlock, hasRecipientsBlock } from '@/lib/tiptap/extensions';

export function IntroEditor({ editor }: { editor: Editor | null }) {
  const { t } = useTranslation();
  const insertButtons: ToolbarButton[] = [
    { icon: 'calendar', label: t('introEditor.toolbar.insertDateTime'), action: () => editor?.chain().focus().insertDateTimeInline().run() },
    { icon: 'quorum', label: t('introEditor.toolbar.insertQuorum'), action: () => editor?.chain().focus().insertQuorumInline().run() },
    {
      icon: 'lock',
      label: t('introEditor.toolbar.insertConditions'),
      action: () => editor?.chain().focus().insertConditionsBlock().run(),
      disabled: hasConditionsBlock(editor),
    },
    {
      icon: 'users',
      label: t('introEditor.toolbar.insertRecipients'),
      action: () => editor?.chain().focus().insertRecipientsBlock().run(),
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