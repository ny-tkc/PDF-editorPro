import { useState, useEffect, useCallback, type RefObject } from 'react';

export function useDragAndDrop(
  dropZoneRef: RefObject<HTMLElement | null>,
  onFilesDropped: (files: File[]) => void
) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer?.files ?? []);
      if (files.length > 0) {
        onFilesDropped(files);
      }
    },
    [onFilesDropped]
  );

  useEffect(() => {
    const el = dropZoneRef.current;
    if (!el) return;

    el.addEventListener('dragover', handleDragOver);
    el.addEventListener('dragleave', handleDragLeave);
    el.addEventListener('drop', handleDrop);

    return () => {
      el.removeEventListener('dragover', handleDragOver);
      el.removeEventListener('dragleave', handleDragLeave);
      el.removeEventListener('drop', handleDrop);
    };
  }, [dropZoneRef, handleDragOver, handleDragLeave, handleDrop]);

  return { isDragging };
}
