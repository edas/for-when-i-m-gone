import { useCallback } from 'react';
import type { JSONContent } from '@tiptap/core';
import { type EncryptStoreActions, useEncryptDataStore } from '@/lib/dataStore';

export function useHowActions() {
  const setData: EncryptStoreActions['setData'] = useEncryptDataStore((state) => state.setData);

  const setConditions = useCallback((conditions: JSONContent | null) => {
    setData((prev) => ({
      how: {
        threshold: prev.how?.threshold ?? 999,
        hasNoOpenConditions: false,
        ...prev.how,
        conditions,
      },
    }));
  }, [setData]);

  return { setConditions };
}
