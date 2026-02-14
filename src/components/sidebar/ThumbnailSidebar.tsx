import { useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDocument } from '../../hooks/useDocument';
import { useEditor } from '../../hooks/useEditor';
import { ThumbnailItem } from './ThumbnailItem';

export function ThumbnailSidebar() {
  const { state: docState, dispatch: docDispatch } = useDocument();
  const { dispatch: editorDispatch } = useEditor();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const fromIndex = docState.pages.findIndex((p) => p.id === active.id);
      const toIndex = docState.pages.findIndex((p) => p.id === over.id);

      if (fromIndex !== -1 && toIndex !== -1) {
        docDispatch({ type: 'REORDER_PAGES', fromIndex, toIndex });
      }
    },
    [docState.pages, docDispatch]
  );

  const handleSelect = useCallback(
    (pageId: string, e: React.MouseEvent) => {
      if (e.ctrlKey || e.metaKey) {
        docDispatch({ type: 'TOGGLE_SELECTION', pageId });
      } else if (e.shiftKey && docState.activePageId) {
        const activeIdx = docState.pages.findIndex((p) => p.id === docState.activePageId);
        const clickIdx = docState.pages.findIndex((p) => p.id === pageId);
        const start = Math.min(activeIdx, clickIdx);
        const end = Math.max(activeIdx, clickIdx);
        const ids = docState.pages.slice(start, end + 1).map((p) => p.id);
        docDispatch({ type: 'SET_SELECTION', pageIds: ids });
      } else {
        docDispatch({ type: 'SET_SELECTION', pageIds: [] });
        docDispatch({ type: 'SET_ACTIVE_PAGE', pageId });
      }
    },
    [docState.activePageId, docState.pages, docDispatch]
  );

  const handleActivate = useCallback(
    (pageId: string) => {
      docDispatch({ type: 'SET_ACTIVE_PAGE', pageId });
      editorDispatch({ type: 'ENTER_EDIT_MODE' });
    },
    [docDispatch, editorDispatch]
  );

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
        ページ ({docState.pages.length})
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={docState.pages.map((p) => p.id)}
            strategy={verticalListSortingStrategy}
          >
            {docState.pages.map((page, index) => (
              <ThumbnailItem
                key={page.id}
                page={page}
                index={index}
                isSelected={docState.selectedPageIds.includes(page.id)}
                isActive={page.id === docState.activePageId}
                onSelect={handleSelect}
                onActivate={handleActivate}
              />
            ))}
          </SortableContext>
        </DndContext>

        {docState.pages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              PDFまたは画像を<br />ドロップして開始
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
