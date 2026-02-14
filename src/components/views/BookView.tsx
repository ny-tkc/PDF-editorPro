import { useEffect, useCallback, useRef } from 'react';
import { useDocument } from '../../hooks/useDocument';
import { useEditor } from '../../hooks/useEditor';
import { renderPageToDataUrl } from '../../services/pdfRenderService';
import { PDF_RENDER_SCALE } from '../../utils/constants';

export function BookView() {
  const { state, dispatch } = useDocument();
  const { dispatch: editorDispatch } = useEditor();
  const containerRef = useRef<HTMLDivElement>(null);

  const currentIndex = state.bookCurrentIndex;
  const currentPage = state.pages[currentIndex] ?? null;
  const total = state.pages.length;

  // Render current page image if needed
  useEffect(() => {
    if (!currentPage?.pdfBytes || currentPage.imageDataUrl) return;
    renderPageToDataUrl(currentPage.pdfBytes, 0, PDF_RENDER_SCALE).then(({ dataUrl }) => {
      dispatch({ type: 'UPDATE_PAGE_IMAGE', pageId: currentPage.id, imageDataUrl: dataUrl });
    });
  }, [currentPage?.pdfBytes, currentPage?.imageDataUrl, currentPage?.id, dispatch]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        dispatch({ type: 'SET_BOOK_INDEX', index: currentIndex + 1 });
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        dispatch({ type: 'SET_BOOK_INDEX', index: currentIndex - 1 });
      } else if (e.key === 'Home') {
        e.preventDefault();
        dispatch({ type: 'SET_BOOK_INDEX', index: 0 });
      } else if (e.key === 'End') {
        e.preventDefault();
        dispatch({ type: 'SET_BOOK_INDEX', index: total - 1 });
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex, total, dispatch]);

  // Wheel navigation
  const wheelTimer = useRef<ReturnType<typeof setTimeout>>();
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      clearTimeout(wheelTimer.current);
      wheelTimer.current = setTimeout(() => {
        if (e.deltaY > 0) {
          dispatch({ type: 'SET_BOOK_INDEX', index: currentIndex + 1 });
        } else if (e.deltaY < 0) {
          dispatch({ type: 'SET_BOOK_INDEX', index: currentIndex - 1 });
        }
      }, 50);
    },
    [currentIndex, dispatch]
  );

  const handleDoubleClick = useCallback(() => {
    if (!currentPage) return;
    dispatch({ type: 'SET_ACTIVE_PAGE', pageId: currentPage.id });
    editorDispatch({ type: 'ENTER_EDIT_MODE', pageId: currentPage.id });
  }, [currentPage, dispatch, editorDispatch]);

  if (!currentPage) {
    return (
      <div className="flex-1 flex items-center justify-center desk-bg">
        <p className="text-gray-400">ページがありません</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col items-center justify-center desk-bg relative overflow-hidden"
      onWheel={handleWheel}
    >
      {/* Stacked pages underneath (visual only) */}
      <div className="relative" onDoubleClick={handleDoubleClick}>
        {/* Shadow layers for stack effect */}
        {total > 2 && (
          <div className="absolute inset-0 translate-x-2 translate-y-2 bg-gray-200 dark:bg-gray-700 rounded-sm" />
        )}
        {total > 1 && (
          <div className="absolute inset-0 translate-x-1 translate-y-1 bg-gray-100 dark:bg-gray-600 rounded-sm" />
        )}

        {/* Current page */}
        <div
          className="relative bg-white dark:bg-gray-700 rounded-sm shadow-2xl book-page cursor-pointer"
          style={{ transform: `rotate(${currentPage.rotation}deg)` }}
        >
          {currentPage.imageDataUrl ? (
            <img
              src={currentPage.imageDataUrl}
              alt={`Page ${currentIndex + 1}`}
              className="max-h-[70vh] max-w-[80vw] object-contain"
              draggable={false}
            />
          ) : (
            <div className="w-[500px] h-[700px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                <span className="text-sm text-gray-400">レンダリング中...</span>
              </div>
            </div>
          )}

          {/* Edit hint overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <span className="px-4 py-2 bg-black/60 text-white text-sm rounded-full backdrop-blur-sm">
              ダブルクリックで編集
            </span>
          </div>
        </div>
      </div>

      {/* Navigation controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full px-5 py-2.5 shadow-lg">
        <button
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
          onClick={() => dispatch({ type: 'SET_BOOK_INDEX', index: 0 })}
          disabled={currentIndex === 0}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
        <button
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
          onClick={() => dispatch({ type: 'SET_BOOK_INDEX', index: currentIndex - 1 })}
          disabled={currentIndex === 0}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[80px] text-center tabular-nums">
          {currentIndex + 1} / {total}
        </span>

        <button
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
          onClick={() => dispatch({ type: 'SET_BOOK_INDEX', index: currentIndex + 1 })}
          disabled={currentIndex >= total - 1}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 transition-colors"
          onClick={() => dispatch({ type: 'SET_BOOK_INDEX', index: total - 1 })}
          disabled={currentIndex >= total - 1}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Page source info */}
      <div className="absolute top-4 right-4 text-xs text-gray-400 dark:text-gray-500 bg-white/70 dark:bg-gray-800/70 px-3 py-1 rounded-full backdrop-blur-sm">
        {currentPage.sourceFileName}
      </div>
    </div>
  );
}
