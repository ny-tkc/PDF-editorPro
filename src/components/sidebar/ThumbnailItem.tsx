import { memo, useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { PageData } from '../../types';
import { renderPageToDataUrl } from '../../services/pdfRenderService';
import { THUMBNAIL_RENDER_SCALE } from '../../utils/constants';
import { useDocument } from '../../hooks/useDocument';

interface ThumbnailItemProps {
  page: PageData;
  index: number;
  isSelected: boolean;
  isActive: boolean;
  onSelect: (pageId: string, e: React.MouseEvent) => void;
  onActivate: (pageId: string) => void;
}

export const ThumbnailItem = memo(function ThumbnailItem({
  page,
  index,
  isSelected,
  isActive,
  onSelect,
  onActivate,
}: ThumbnailItemProps) {
  const { dispatch } = useDocument();
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
  };

  // Lazy thumbnail rendering
  const imgRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (page.thumbnailDataUrl || !page.pdfBytes) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          const { dataUrl } = await renderPageToDataUrl(page.pdfBytes!, 0, THUMBNAIL_RENDER_SCALE);
          dispatch({ type: 'UPDATE_THUMBNAIL', pageId: page.id, thumbnailDataUrl: dataUrl });
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, [page.thumbnailDataUrl, page.pdfBytes, page.id, dispatch]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        group relative flex flex-col items-center p-2 mx-2 mb-2 rounded-lg cursor-pointer
        transition-all duration-150
        ${isActive
          ? 'bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500'
          : isSelected
            ? 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-400'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
        }
      `}
      onClick={(e) => onSelect(page.id, e)}
      onDoubleClick={() => onActivate(page.id)}
    >
      <div
        ref={imgRef}
        className="relative w-full aspect-[3/4] bg-white dark:bg-gray-600 rounded shadow-sm overflow-hidden flex items-center justify-center"
        style={{
          transform: `rotate(${page.rotation}deg)`,
        }}
      >
        {page.thumbnailDataUrl ? (
          <img
            src={page.thumbnailDataUrl}
            alt={`Page ${index + 1}`}
            className="max-w-full max-h-full object-contain"
            draggable={false}
          />
        ) : (
          <div className="text-gray-400 text-xs">読込中...</div>
        )}
      </div>
      <span className="mt-1 text-xs text-gray-500 dark:text-gray-400 tabular-nums">
        {index + 1}
      </span>
    </div>
  );
});
