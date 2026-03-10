import styles from '../WhoEditor.module.css';

interface DropZoneProps {
  index: number;
  isActive: boolean;
  isHidden: boolean;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, index: number) => void;
}

export function DropZone({ index, isActive, isHidden, onDragOver, onDragLeave, onDrop }: DropZoneProps) {
  return (
    <div 
      className={`${styles.dropZone} ${isActive ? styles.active : ''} ${isHidden ? styles.hidden : ''}`}
      role="presentation"
      onDragOver={(e) => onDragOver(e, index)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, index)}
    >
      <div className={styles.dropZoneIndicator}></div>
    </div>
  );
}
