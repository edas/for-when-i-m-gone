/**
 * Reusable drag-and-drop utilities for reorderable lists
 */

/**
 * Item with an ID for identification during drag-and-drop
 */
export interface DraggableItem {
  id: string;
}

/**
 * Drag-and-drop state
 */
export interface DragDropState {
  draggedItemId: string | null;
  activeDropZone: number | null;
}

/**
 * Create drag-and-drop state with initial values
 */
export function createDragDropState(): DragDropState {
  return {
    draggedItemId: null,
    activeDropZone: null,
  };
}

/**
 * Handle drag start event
 */
export function handleDragStart(
  e: DragEvent,
  itemId: string,
  setState: (state: Partial<DragDropState>) => void
): void {
  if (!e.dataTransfer) return;
  setState({ draggedItemId: itemId });
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', itemId);
}

/**
 * Handle drag end event (reset state)
 */
export function handleDragEnd(
  setState: (state: Partial<DragDropState>) => void
): void {
  setState({ draggedItemId: null, activeDropZone: null });
}

/**
 * Handle drag over a drop zone
 */
export function handleDropZoneDragOver(
  e: DragEvent,
  insertIndex: number,
  draggedItemId: string | null,
  setState: (state: Partial<DragDropState>) => void
): void {
  e.preventDefault();
  if (!e.dataTransfer || !draggedItemId) return;
  e.dataTransfer.dropEffect = 'move';
  setState({ activeDropZone: insertIndex });
}

/**
 * Handle drag leave from a drop zone
 */
export function handleDropZoneDragLeave(
  setState: (state: Partial<DragDropState>) => void
): void {
  setState({ activeDropZone: null });
}

/**
 * Handle drop on a drop zone
 * Returns the reordered items array, or null if no change needed
 */
export function handleDrop<T extends DraggableItem>(
  e: DragEvent,
  insertIndex: number,
  items: T[],
  draggedItemId: string | null,
  setState: (state: Partial<DragDropState>) => void
): T[] | null {
  e.preventDefault();
  
  if (!draggedItemId) {
    setState({ draggedItemId: null, activeDropZone: null });
    return null;
  }

  const draggedIndex = items.findIndex(item => item.id === draggedItemId);
  if (draggedIndex === -1) {
    setState({ draggedItemId: null, activeDropZone: null });
    return null;
  }

  // Don't move if dropping in same position or adjacent position
  if (insertIndex === draggedIndex || insertIndex === draggedIndex + 1) {
    setState({ draggedItemId: null, activeDropZone: null });
    return null;
  }

  // Remove the dragged item
  const newItems = [...items];
  const [draggedItem] = newItems.splice(draggedIndex, 1);
  
  // Adjust insert index if we removed an item before the insert point
  const adjustedIndex = draggedIndex < insertIndex ? insertIndex - 1 : insertIndex;
  
  // Insert at new position
  newItems.splice(adjustedIndex, 0, draggedItem);
  
  // Reset state
  setState({ draggedItemId: null, activeDropZone: null });
  
  return newItems;
}

/**
 * Check if a drop zone should be hidden (adjacent to dragged item)
 */
export function isDropZoneHidden<T extends DraggableItem>(
  zoneIndex: number,
  items: T[],
  draggedItemId: string | null
): boolean {
  if (!draggedItemId) return true;
  const draggedIndex = items.findIndex(item => item.id === draggedItemId);
  // Hide zones immediately before or after the dragged item
  return zoneIndex === draggedIndex || zoneIndex === draggedIndex + 1;
}
