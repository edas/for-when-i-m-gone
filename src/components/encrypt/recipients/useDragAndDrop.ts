import { useState, useCallback } from 'react';
import {
  handleDragStart as dndDragStart,
  handleDragEnd as dndDragEnd,
  handleDropZoneDragOver as dndDragOver,
  handleDropZoneDragLeave as dndDragLeave,
  handleDrop as dndDrop,
  isDropZoneHidden as dndIsHidden,
  type DragDropState,
} from '../../../lib/dragAndDrop';
import { type Recipient } from '../../../lib/types/recipient';

export function useDragAndDrop(recipients: Recipient[], setRecipients: (recipients: Recipient[]) => void) {
  const [dragState, setDragState] = useState<DragDropState>({ draggedItemId: null, activeDropZone: null });

  const updateDragState = useCallback((state: Partial<DragDropState>) => {
    setDragState(prev => ({ ...prev, ...state }));
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, recipientId: string) => {
    dndDragStart(e as unknown as DragEvent, recipientId, updateDragState);
  }, [updateDragState]);

  const handleDragEnd = useCallback(() => dndDragEnd(updateDragState), [updateDragState]);

  const handleDropZoneDragOver = useCallback((e: React.DragEvent, insertIndex: number) => {
    dndDragOver(e as unknown as DragEvent, insertIndex, dragState.draggedItemId, updateDragState);
  }, [dragState.draggedItemId, updateDragState]);

  const handleDropZoneDragLeave = useCallback(() => dndDragLeave(updateDragState), [updateDragState]);

  const handleDropZoneDrop = useCallback((e: React.DragEvent, insertIndex: number) => {
    const result = dndDrop(e as unknown as DragEvent, insertIndex, recipients, dragState.draggedItemId, updateDragState);
    if (result) setRecipients(result);
  }, [recipients, dragState.draggedItemId, updateDragState, setRecipients]);

  const isDropZoneHidden = useCallback((zoneIndex: number) => 
    dndIsHidden(zoneIndex, recipients, dragState.draggedItemId)
  , [recipients, dragState.draggedItemId]);

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
