import { useState, useCallback } from 'react';
import type { Recipient } from '@/lib/types/recipient';

interface DragDropState {
  draggedItemId: string | null;
  activeDropZone: number | null;
}

function reorderOnDrop<T extends { id: string }>(
  insertIndex: number,
  items: T[],
  draggedItemId: string | null
): T[] | null {
  if (!draggedItemId) return null;
  const draggedIndex = items.findIndex((item) => item.id === draggedItemId);
  if (draggedIndex === -1) return null;
  if (insertIndex === draggedIndex || insertIndex === draggedIndex + 1) return null;
  const newItems = [...items];
  const [draggedItem] = newItems.splice(draggedIndex, 1);
  const adjustedIndex = draggedIndex < insertIndex ? insertIndex - 1 : insertIndex;
  newItems.splice(adjustedIndex, 0, draggedItem);
  return newItems;
}

export function useDragAndDrop(
  recipients: Recipient[],
  setRecipients: (recipients: Recipient[]) => void
) {
  const [dragState, setDragState] = useState<DragDropState>({
    draggedItemId: null,
    activeDropZone: null,
  });

  const updateDragState = useCallback((state: Partial<DragDropState>) => {
    setDragState((prev) => ({ ...prev, ...state }));
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, recipientId: string) => {
    if (!e.dataTransfer) return;
    setDragState((prev) => ({ ...prev, draggedItemId: recipientId }));
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', recipientId);
  }, []);

  const handleDragEnd = useCallback(() => {
    updateDragState({ draggedItemId: null, activeDropZone: null });
  }, [updateDragState]);

  const handleDropZoneDragOver = useCallback(
    (e: React.DragEvent, insertIndex: number) => {
      e.preventDefault();
      if (!e.dataTransfer || !dragState.draggedItemId) return;
      e.dataTransfer.dropEffect = 'move';
      updateDragState({ activeDropZone: insertIndex });
    },
    [dragState.draggedItemId, updateDragState]
  );

  const handleDropZoneDragLeave = useCallback(() => {
    updateDragState({ activeDropZone: null });
  }, [updateDragState]);

  const handleDropZoneDrop = useCallback(
    (e: React.DragEvent, insertIndex: number) => {
      e.preventDefault();
      const result = reorderOnDrop(insertIndex, recipients, dragState.draggedItemId);
      updateDragState({ draggedItemId: null, activeDropZone: null });
      if (result) setRecipients(result);
    },
    [recipients, dragState.draggedItemId, updateDragState, setRecipients]
  );

  const isDropZoneHidden = useCallback(
    (zoneIndex: number) => {
      if (!dragState.draggedItemId) return true;
      const draggedIndex = recipients.findIndex((r) => r.id === dragState.draggedItemId);
      return zoneIndex === draggedIndex || zoneIndex === draggedIndex + 1;
    },
    [recipients, dragState.draggedItemId]
  );

  return {
    dragState,
    handleDragStart,
    handleDragEnd,
    handleDropZoneDragOver,
    handleDropZoneDragLeave,
    handleDropZoneDrop,
    isDropZoneHidden,
  };
}
