import { useCallback, memo } from 'react';
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
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDocument } from '../../hooks/useDocument';
import { useEditor } from '../../hooks/useEditor';
import type { PageData } from '../../types';

const PageCard = memo(function PageCard({
  page,
  index,
  isSelected,
  onSelect,
  onDoubleClick,
}: {
  page: PageData;
  index: number;
  isSelected: boolean;
  onSelect: (id: string, e: React.MouseEvent) => void;
  onDoubleClick: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        page-card relative flex flex-col items-center cursor-pointer select-none
        rounded-lg p-3
        ${isSelected ? 'ring-3 ring-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : ''}
      `}
      onClick={(e) => onSelect(page.id, e)}
      onDoubleClick={() => onDoubleClick(page.id)}
    >
      <div
        className="bg-white dark:bg-gray-700 rounded-md shadow-lg overflow-hidden"
        style={{ transform: `rotate(${page.rotation}deg)` }}
      >
        {page.thumbnailDataUrl ? (
          <img
            src={page.thumbnailDataUrl}
            alt={`Page ${index + 1}`}
            className="w-40 h-auto object-contain"
            draggable={false}
          />
        ) : (
          <div className="w-40 h-56 flex items-center justify-center text-gray-400 text-xs">
            読込中...
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 tabular-nums">
          {index + 1}
        </span>
        {page.fabricJSON && (
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400" title="編集済み" />
        )}
      </div>
      <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate max-w-[160px]">
        {page.sourceFileName}
      </span>
    </div>
  );
});

export function DeskView() {
  const { state, dispatch } = useDocument();
  const { dispatch: editorDispatch } = useEditor();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const from = state.pages.findIndex((p) => p.id === active.id);
      const to = state.pages.findIndex((p) => p.id === over.id);
      if (from !== -1 && to !== -1) {
        dispatch({ type: 'REORDER_PAGES', fromIndex: from, toIndex: to });
      }
    },
    [state.pages, dispatch]
  );

  const handleSelect = useCallback(
    (id: string, e: React.MouseEvent) => {
      if (e.ctrlKey || e.metaKey) {
        dispatch({ type: 'TOGGLE_SELECTION', pageId: id });
      } else if (e.shiftKey && state.selectedPageIds.length > 0) {
        const lastSelected = state.selectedPageIds[state.selectedPageIds.length - 1];
        const lastIdx = state.pages.findIndex((p) => p.id === lastSelected);
        const curIdx = state.pages.findIndex((p) => p.id === id);
        const [start, end] = lastIdx < curIdx ? [lastIdx, curIdx] : [curIdx, lastIdx];
        const ids = state.pages.slice(start, end + 1).map((p) => p.id);
        dispatch({ type: 'SET_SELECTION', pageIds: ids });
      } else {
        dispatch({ type: 'SET_SELECTION', pageIds: [id] });
        dispatch({ type: 'SET_ACTIVE_PAGE', pageId: id });
      }
    },
    [state.pages, state.selectedPageIds, dispatch]
  );

  const handleDoubleClick = useCallback(
    (id: string) => {
      dispatch({ type: 'SET_ACTIVE_PAGE', pageId: id });
      editorDispatch({ type: 'ENTER_EDIT_MODE', pageId: id });
    },
    [dispatch, editorDispatch]
  );

  return (
    <div className="flex-1 overflow-auto desk-bg p-8">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={state.pages.map((p) => p.id)} strategy={rectSortingStrategy}>
          <div className="flex flex-wrap gap-4 justify-center max-w-6xl mx-auto">
            {state.pages.map((page, i) => (
              <PageCard
                key={page.id}
                page={page}
                index={i}
                isSelected={state.selectedPageIds.includes(page.id)}
                onSelect={handleSelect}
                onDoubleClick={handleDoubleClick}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
