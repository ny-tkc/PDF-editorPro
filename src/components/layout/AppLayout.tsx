import { useRef, useCallback } from 'react';
import { useDocument } from '../../hooks/useDocument';
import { usePdfLoader } from '../../hooks/usePdfLoader';
import { useClipboardPaste } from '../../hooks/useClipboardPaste';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { Toolbar } from './Toolbar';
import { ThumbnailSidebar } from '../sidebar/ThumbnailSidebar';
import { EditorCanvas } from '../canvas/EditorCanvas';
import { DropZone } from '../ui/DropZone';

export function AppLayout() {
  const { dispatch } = useDocument();
  const { loadFiles, loadFromImageDataUrl } = usePdfLoader();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFilesDropped = useCallback(
    async (files: File[]) => {
      const pages = await loadFiles(files);
      dispatch({ type: 'ADD_PAGES', pages });
    },
    [loadFiles, dispatch]
  );

  const handleImagePasted = useCallback(
    async (dataUrl: string) => {
      const page = await loadFromImageDataUrl(dataUrl);
      dispatch({ type: 'ADD_PAGES', pages: [page] });
    },
    [loadFromImageDataUrl, dispatch]
  );

  const { isDragging } = useDragAndDrop(containerRef, handleFilesDropped);
  useClipboardPaste(handleImagePasted);

  return (
    <div
      ref={containerRef}
      className="h-full flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
    >
      <Toolbar />
      <div className="flex flex-1 overflow-hidden relative">
        <div className="w-[220px] flex-shrink-0">
          <ThumbnailSidebar />
        </div>
        <EditorCanvas />
        <DropZone isDragging={isDragging} />
      </div>
    </div>
  );
}
