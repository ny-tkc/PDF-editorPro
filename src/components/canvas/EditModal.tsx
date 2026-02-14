import { useRef, useEffect, useCallback, useMemo } from 'react';
import { useDocument } from '../../hooks/useDocument';
import { useEditor } from '../../hooks/useEditor';
import { useFabricCanvas } from '../../hooks/useFabricCanvas';
import { renderPageToDataUrl } from '../../services/pdfRenderService';
import { PDF_RENDER_SCALE } from '../../utils/constants';
import { CanvasToolbar } from './CanvasToolbar';

export function EditModal() {
  const { state: docState, dispatch: docDispatch } = useDocument();
  const { state: editorState, dispatch: editorDispatch } = useEditor();
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const editingPage = useMemo(
    () => docState.pages.find((p) => p.id === editorState.editingPageId) ?? null,
    [docState.pages, editorState.editingPageId]
  );

  // Render page image if needed
  useEffect(() => {
    if (!editingPage?.pdfBytes || editingPage.imageDataUrl) return;
    renderPageToDataUrl(editingPage.pdfBytes, 0, PDF_RENDER_SCALE).then(({ dataUrl }) => {
      docDispatch({ type: 'UPDATE_PAGE_IMAGE', pageId: editingPage.id, imageDataUrl: dataUrl });
    });
  }, [editingPage?.pdfBytes, editingPage?.imageDataUrl, editingPage?.id, docDispatch]);

  const canvasWidth = editingPage ? editingPage.width * PDF_RENDER_SCALE : 800;
  const canvasHeight = editingPage ? editingPage.height * PDF_RENDER_SCALE : 600;

  const handleModified = useCallback(
    (json: string) => {
      if (editingPage) {
        docDispatch({ type: 'UPDATE_PAGE_FABRIC', pageId: editingPage.id, fabricJSON: json });
      }
    },
    [editingPage, docDispatch]
  );

  const { addText, addRect, addCircle, addArrow, addLine, deleteSelected } = useFabricCanvas({
    canvasElRef,
    width: canvasWidth,
    height: canvasHeight,
    isEditMode: editorState.isEditMode,
    backgroundImageUrl: editingPage?.imageDataUrl ?? null,
    initialJSON: editingPage?.fabricJSON ?? null,
    onModified: handleModified,
    gridSnap: editorState.gridSnap,
    gridSize: editorState.gridSize,
  });

  // Tool actions
  const prevToolRef = useRef(editorState.activeTool);
  useEffect(() => {
    if (!editorState.isEditMode) return;
    if (prevToolRef.current === editorState.activeTool) return;
    prevToolRef.current = editorState.activeTool;

    switch (editorState.activeTool) {
      case 'text': addText(); editorDispatch({ type: 'SET_TOOL', tool: 'select' }); break;
      case 'arrow': addArrow(); editorDispatch({ type: 'SET_TOOL', tool: 'select' }); break;
      case 'rectangle': addRect(); editorDispatch({ type: 'SET_TOOL', tool: 'select' }); break;
      case 'circle': addCircle(); editorDispatch({ type: 'SET_TOOL', tool: 'select' }); break;
      case 'line': addLine(); editorDispatch({ type: 'SET_TOOL', tool: 'select' }); break;
    }
  }, [editorState.activeTool, editorState.isEditMode, addText, addArrow, addRect, addCircle, addLine, editorDispatch]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        editorDispatch({ type: 'EXIT_EDIT_MODE' });
      }
      if (e.key === 'Delete' && editorState.isEditMode) {
        deleteSelected();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editorState.isEditMode, editorDispatch, deleteSelected]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === backdropRef.current) {
        editorDispatch({ type: 'EXIT_EDIT_MODE' });
      }
    },
    [editorDispatch]
  );

  if (!editorState.isEditMode || !editingPage) return null;

  const pageIndex = docState.pages.findIndex((p) => p.id === editingPage.id);

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-[95vw] max-h-[95vh] overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              ページ編集
            </h2>
            <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full tabular-nums">
              {pageIndex + 1} / {docState.pages.length}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[200px]">
              {editingPage.sourceFileName}
            </span>
          </div>
          <button
            onClick={() => editorDispatch({ type: 'EXIT_EDIT_MODE' })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <span>閉じる</span>
            <kbd className="text-[10px] bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded">ESC</kbd>
          </button>
        </div>

        {/* Toolbar */}
        <CanvasToolbar onDeleteSelected={deleteSelected} />

        {/* Canvas area */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center justify-center min-h-full">
            <div className="shadow-2xl rounded-sm overflow-hidden">
              <canvas ref={canvasElRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
