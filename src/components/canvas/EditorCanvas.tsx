import { useRef, useEffect, useCallback, useMemo } from 'react';
import { useDocument } from '../../hooks/useDocument';
import { useEditor } from '../../hooks/useEditor';
import { useFabricCanvas } from '../../hooks/useFabricCanvas';
import { renderPageToDataUrl } from '../../services/pdfRenderService';
import { PDF_RENDER_SCALE } from '../../utils/constants';
import { CanvasToolbar } from './CanvasToolbar';

export function EditorCanvas() {
  const { state: docState, dispatch: docDispatch } = useDocument();
  const { state: editorState, dispatch: editorDispatch } = useEditor();
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activePage = useMemo(
    () => docState.pages.find((p) => p.id === docState.activePageId) ?? null,
    [docState.pages, docState.activePageId]
  );

  // Render page image if not yet rendered
  useEffect(() => {
    if (!activePage?.pdfBytes || activePage.imageDataUrl) return;

    renderPageToDataUrl(activePage.pdfBytes, 0, PDF_RENDER_SCALE).then(({ dataUrl }) => {
      docDispatch({
        type: 'UPDATE_PAGE_IMAGE',
        pageId: activePage.id,
        imageDataUrl: dataUrl,
      });
    });
  }, [activePage?.pdfBytes, activePage?.imageDataUrl, activePage?.id, docDispatch]);

  const canvasWidth = activePage ? activePage.width * PDF_RENDER_SCALE : 800;
  const canvasHeight = activePage ? activePage.height * PDF_RENDER_SCALE : 600;

  const handleModified = useCallback(
    (json: string) => {
      if (activePage) {
        docDispatch({ type: 'UPDATE_PAGE_FABRIC', pageId: activePage.id, fabricJSON: json });
      }
    },
    [activePage, docDispatch]
  );

  const { addText, addRect, addCircle, addArrow, addLine, deleteSelected } = useFabricCanvas({
    canvasElRef,
    width: canvasWidth,
    height: canvasHeight,
    isEditMode: editorState.isEditMode,
    backgroundImageUrl: activePage?.imageDataUrl ?? null,
    initialJSON: activePage?.fabricJSON ?? null,
    onModified: handleModified,
    gridSnap: editorState.gridSnap,
    gridSize: editorState.gridSize,
  });

  // Handle tool actions
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

  // Escape to exit edit mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && editorState.isEditMode) {
        editorDispatch({ type: 'EXIT_EDIT_MODE' });
      }
      if (e.key === 'Delete' && editorState.isEditMode) {
        deleteSelected();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editorState.isEditMode, editorDispatch, deleteSelected]);

  const handleDoubleClick = useCallback(() => {
    if (!activePage || editorState.isEditMode) return;
    editorDispatch({ type: 'ENTER_EDIT_MODE' });
  }, [activePage, editorState.isEditMode, editorDispatch]);

  if (!activePage) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <svg className="mx-auto w-20 h-20 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg text-gray-400 dark:text-gray-500 mb-2">
            PDFまたは画像ファイルを開いてください
          </p>
          <p className="text-sm text-gray-300 dark:text-gray-600">
            ドラッグ＆ドロップ、Ctrl+V、またはツールバーの＋ボタンから
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 relative overflow-auto bg-gray-100 dark:bg-gray-900"
    >
      {editorState.isEditMode && (
        <CanvasToolbar onDeleteSelected={deleteSelected} />
      )}

      <div
        className="flex items-center justify-center min-h-full p-8"
        style={{
          transform: `scale(${editorState.zoom})`,
          transformOrigin: 'center center',
        }}
      >
        {editorState.isEditMode ? (
          <div className="shadow-2xl">
            <canvas ref={canvasElRef} />
          </div>
        ) : (
          <div
            className="shadow-lg cursor-pointer hover:shadow-xl transition-shadow bg-white"
            onDoubleClick={handleDoubleClick}
            style={{
              transform: `rotate(${activePage.rotation}deg)`,
            }}
          >
            {activePage.imageDataUrl ? (
              <img
                src={activePage.imageDataUrl}
                alt="Page"
                className="max-w-full"
                draggable={false}
              />
            ) : (
              <div
                className="flex items-center justify-center bg-white"
                style={{ width: canvasWidth, height: canvasHeight }}
              >
                <span className="text-gray-400">レンダリング中...</span>
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/5">
              <span className="px-4 py-2 bg-black/60 text-white text-sm rounded-full">
                ダブルクリックで編集
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
