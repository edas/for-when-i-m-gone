import type { Editor } from '@tiptap/core';
import { hasRecipientsBlock, hasConditionsBlock } from '../../lib/tiptap/extensions';
import { Icon, type IconName } from './Icons';
import styles from './RichTextToolbar.module.css';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface BaseLabels {
  bold: string;
  italic: string;
  underline: string;
  bulletList: string;
  numberedList: string;
}

interface FullLabels extends BaseLabels {
  heading: string;
  paragraph: string;
  insertRecipients: string;
  insertConditions: string;
  insertDateTime: string;
  insertQuorum: string;
}

interface RichTextToolbarProps {
  editor: Editor | null;
  labels: BaseLabels | FullLabels;
  compact?: boolean;
  editorVersion?: number;
  threshold?: number;
}

function isFullLabels(l: BaseLabels | FullLabels): l is FullLabels {
  return 'heading' in l;
}

interface ToolbarButton {
  icon: IconName;
  label: string;
  action: () => void;
  disabled?: boolean;
}

export function RichTextToolbar({ 
  editor, 
  compact = false,
}: RichTextToolbarProps) {

  const { t } = useTranslation();
  const labels = useMemo(() => ({
    bold: t('howEditor.toolbar.bold'),
    italic: t('howEditor.toolbar.italic'),
    underline: t('howEditor.toolbar.underline'),
    bulletList: t('howEditor.toolbar.bulletList'),
    numberedList: t('howEditor.toolbar.numberedList'),
  }), [t]);
  
  const recipientsBlockExists = hasRecipientsBlock(editor);
  const conditionsBlockExists = hasConditionsBlock(editor);

  // Editor commands
  const toggleHeading = () => editor?.chain().focus().toggleHeading({ level: 2 }).run();
  const setParagraph = () => editor?.chain().focus().setParagraph().run();
  const toggleBold = () => editor?.chain().focus().toggleBold().run();
  const toggleItalic = () => editor?.chain().focus().toggleItalic().run();
  const toggleUnderline = () => editor?.chain().focus().toggleUnderline().run();
  const toggleBulletList = () => editor?.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor?.chain().focus().toggleOrderedList().run();
  const insertRecipientsBlock = () => editor?.chain().focus().insertRecipientsBlock().run();
  const insertConditionsBlock = () => editor?.chain().focus().insertConditionsBlock().run();
  const insertDateTimeInline = () => editor?.chain().focus().insertDateTimeInline().run();
  const insertQuorumInline = () => editor?.chain().focus().insertQuorumInline().run();

  const formatButtons: ToolbarButton[] | null = !compact && isFullLabels(labels)
    ? [
        { icon: 'heading', label: labels.heading, action: toggleHeading },
        { icon: 'paragraph', label: labels.paragraph, action: setParagraph },
      ]
    : null;

  const styleButtons: ToolbarButton[] = [
    { icon: 'bold', label: labels.bold, action: toggleBold },
    { icon: 'italic', label: labels.italic, action: toggleItalic },
    { icon: 'underline', label: labels.underline, action: toggleUnderline },
  ];

  const listButtons: ToolbarButton[] = [
    { icon: 'list-bullet', label: labels.bulletList, action: toggleBulletList },
    { icon: 'list-numbered', label: labels.numberedList, action: toggleOrderedList },
  ];

  const insertButtons: ToolbarButton[] | null = !compact && isFullLabels(labels)
    ? [
        { icon: 'calendar', label: labels.insertDateTime, action: insertDateTimeInline },
        { icon: 'quorum', label: labels.insertQuorum, action: insertQuorumInline },    
        { icon: 'lock', label: labels.insertConditions, action: insertConditionsBlock, disabled: conditionsBlockExists },
        { icon: 'users', label: labels.insertRecipients, action: insertRecipientsBlock, disabled: recipientsBlockExists },
      ]
    : null;

  const renderButtonGroup = (buttons: ToolbarButton[], isInsert = false) => (
    <div className={styles.toolbarGroup}>
      {buttons.map((btn) => (
        <button 
          key={btn.icon}
          className={`${styles.toolbarBtn} ${isInsert ? styles.insertBtn : ''} ${btn.disabled ? styles.alreadyInserted : ''}`}
          onClick={btn.action} 
          title={btn.label}
          disabled={!editor || btn.disabled}
        >
          <Icon name={btn.icon} size={18} />
        </button>
      ))}
    </div>
  );

  return (
    <div className={`${styles.toolbar} ${compact ? styles.compact : ''}`}>
      {formatButtons && (
        <>
          {renderButtonGroup(formatButtons)}
          <div className={styles.toolbarDivider}></div>
        </>
      )}
      
      {renderButtonGroup(styleButtons)}
      <div className={styles.toolbarDivider}></div>
      {renderButtonGroup(listButtons)}
      
      {insertButtons && (
        <>
          <div className={styles.toolbarDivider}></div>
          {renderButtonGroup(insertButtons, true)}
        </>
      )}
    </div>
  );
}

export default RichTextToolbar;
