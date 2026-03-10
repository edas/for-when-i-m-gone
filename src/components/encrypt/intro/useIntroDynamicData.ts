import { useEffect, useMemo } from 'react';
import type { Editor } from '@tiptap/core';
import { useTranslation } from 'react-i18next';
import { useEncryptDataStore } from '../../../lib/dataStore';
import type { Recipient } from '../../../lib/types/recipient';
import { getContactTypeLabels } from '../introEditorUtils';

const noRecipients: Recipient[] = [];

export function useIntroDynamicData(editor: Editor | null) {
  const { t, i18n } = useTranslation();
  const recipients = useEncryptDataStore((state) => state.who?.recipients ?? noRecipients);
  const conditions = useEncryptDataStore((state) => state.how?.conditions ?? null);
  const threshold = useEncryptDataStore((state) => state.how?.threshold ?? 2);
  const contactTypeLabels = useMemo(() => getContactTypeLabels(t), [t]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.commands.setDynamicData({
      recipients,
      conditions,
      threshold,
      lang: i18n.language as 'fr' | 'en',
      contactTypeLabels,
    });
  }, [editor, recipients, conditions, threshold, i18n.language, contactTypeLabels]);
}
