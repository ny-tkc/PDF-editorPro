import { useMemo, useCallback, memo } from 'react';
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
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDocument } from '../../hooks/useDocument';
import { useEditor } from '../../hooks/useEditor';
import type { PageData } from '../../types';

const MiniPage = memo(function MiniPage({
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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: page.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        flex-shrink-0 cursor-pointer select-none rounded-lg p-2
        transition-all duration-150
        ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 'hover:bg-white/50 dark:hover:bg-gray-700/30'}
      `}
      onClick={(e) => onSelect(page.id, e)}
      onDoubleClick={() => onDoubleClick(page.id)}
    >
      <div
        className="bg-white dark:bg-gray-700 rounded shadow-md overflow-hidden"
        style={{ transform: `rotate(${page.rotation}deg)` }}
      >
        {page.thumbnailDataUrl ? (
          <img src={page.thumbnailDataUrl} alt={`Page ${index + 1}`} className="w-28 h-auto" draggable={false} />
        ) : (
          <div className="w-28 h-40 flex items-center justify-center text-xs text-gray-400">...</div>
        )}
      </div>
      <p className="mt-1 text-[10px] text-center text-gray-500 dark:text-gray-400 tabular-nums">{index + 1}</p>
    </div>
  );
});

export function GroupView() {
  const { state, dispatch } = useDocument();
  const { dispatch: editorDispatch } = useEditor();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Group pages by sourceGroupId
  const groups = useMemo(() => {
    const map = new Map<string, { name: string; pages: PageData[]; globalIndices: number[] }>();
    state.pages.forEach((page, idx) => {
      const key = page.sourceGroupId;
      if (!map.has(key)) {
        map.set(key, { name: page.sourceFileName, pages: [], globalIndices: [] });
      }
      const g = map.get(key)!;
      g.pages.push(page);
      g.globalIndices.push(idx);
    });
    return Array.from(map.values());
  }, [state.pages]);

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
      } else {
        dispatch({ type: 'SET_SELECTION', pageIds: [id] });
        dispatch({ type: 'SET_ACTIVE_PAGE', pageId: id });
      }
    },
    [dispatch]
  );

  const handleDoubleClick = useCallback(
    (id: string) => {
      dispatch({ type: 'SET_ACTIVE_PAGE', pageId: id });
      editorDispatch({ type: 'ENTER_EDIT_MODE', pageId: id });
    },
    [dispatch, editorDispatch]
  );

  return (
    <div className="flex-1 overflow-auto desk-bg p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {groups.map((group, gi) => (
          <div key={gi} className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3 px-1">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                {group.name}
              </h3>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                ({group.pages.length}ページ)
              </span>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={group.pages.map((p) => p.id)} strategy={horizontalListSortingStrategy}>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {group.pages.map((page, pi) => (
                    <MiniPage
                      key={page.id}
                      page={page}
                      index={group.globalIndices[pi]}
                      isSelected={state.selectedPageIds.includes(page.id)}
                      onSelect={handleSelect}
                      onDoubleClick={handleDoubleClick}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        ))}
      </div>
    </div>
  );
}
