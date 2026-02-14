import { useRef, useCallback } from 'react';
import { useDocument } from '../../hooks/useDocument';
import { usePdfLoader } from '../../hooks/usePdfLoader';
import { useClipboardPaste } from '../../hooks/useClipboardPaste';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { Toolbar } from './Toolbar';
import { DeskView } from '../views/DeskView';
import { GroupView } from '../views/GroupView';
import { BookView } from '../views/BookView';
import { EditModal } from '../canvas/EditModal';
import { DropZone } from '../ui/DropZone';
import { EmptyState } from '../ui/EmptyState';

export function AppLayout() {
  const { state, dispatch } = useDocument();
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

  const renderView = () => {
    if (state.pages.length === 0) {
      return <EmptyState />;
    }

    switch (state.viewMode) {
      case 'desk':
        return <DeskView />;
      case 'group':
        return <GroupView />;
      case 'book':
        return <BookView />;
    }
  };

  return (
    <div
      ref={containerRef}
      className="h-full flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
    >
      <Toolbar />
      <div className="flex-1 flex overflow-hidden relative">
        {renderView()}
        <DropZone isDragging={isDragging} />
      </div>
      <EditModal />
    </div>
  );
}
