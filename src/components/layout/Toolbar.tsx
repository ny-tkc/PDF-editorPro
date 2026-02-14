import { useCallback, useRef } from 'react';
import { useDocument } from '../../hooks/useDocument';
import { useEditor } from '../../hooks/useEditor';
import { usePdfLoader } from '../../hooks/usePdfLoader';
import { exportToPdf, downloadPdf } from '../../services/exportService';
import { writeImageToClipboard } from '../../services/clipboardService';
import { renderPageToDataUrl } from '../../services/pdfRenderService';
import { IconButton } from '../ui/IconButton';
import type { ViewMode } from '../../types';

export function Toolbar() {
  const { state: docState, dispatch: docDispatch } = useDocument();
  const { state: editorState, dispatch: editorDispatch } = useEditor();
  const { loadFiles } = usePdfLoader();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedIds = docState.selectedPageIds;
  const hasSelection = selectedIds.length > 0;
  const hasPages = docState.pages.length > 0;
  const activePage = docState.pages.find((p) => p.id === docState.activePageId);

  const handleOpenFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length === 0) return;
      const pages = await loadFiles(files);
      docDispatch({ type: 'ADD_PAGES', pages });
      e.target.value = '';
    },
    [loadFiles, docDispatch]
  );

  const handleDelete = useCallback(() => {
    const targets = hasSelection ? selectedIds : activePage ? [activePage.id] : [];
    if (targets.length > 0) docDispatch({ type: 'DELETE_PAGES', pageIds: targets });
  }, [hasSelection, selectedIds, activePage, docDispatch]);

  const handleRotateCW = useCallback(() => {
    const targets = hasSelection ? selectedIds : activePage ? [activePage.id] : [];
    targets.forEach((id) => docDispatch({ type: 'ROTATE_PAGE', pageId: id, angle: 90 }));
  }, [hasSelection, selectedIds, activePage, docDispatch]);

  const handleDuplicate = useCallback(() => {
    const targets = hasSelection ? selectedIds : activePage ? [activePage.id] : [];
    if (targets.length > 0) docDispatch({ type: 'DUPLICATE_PAGES', pageIds: targets });
  }, [hasSelection, selectedIds, activePage, docDispatch]);

  const handleDownload = useCallback(async () => {
    if (!hasPages) return;
    const bytes = await exportToPdf(docState.pages);
    downloadPdf(bytes, docState.fileName);
  }, [hasPages, docState.pages, docState.fileName]);

  const handleCopyToClipboard = useCallback(async () => {
    if (!activePage?.pdfBytes) return;
    const { dataUrl } = await renderPageToDataUrl(activePage.pdfBytes, 0, 2.0);
    await writeImageToClipboard(dataUrl);
  }, [activePage]);

  const handleToggleDarkMode = useCallback(() => {
    editorDispatch({ type: 'TOGGLE_DARK_MODE' });
  }, [editorDispatch]);

  const viewModes: { id: ViewMode; label: string; icon: JSX.Element }[] = [
    {
      id: 'desk',
      label: 'デスク',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      id: 'group',
      label: 'グループ',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      id: 'book',
      label: 'ブック',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex items-center gap-1 px-3 h-12 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 select-none">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* File add */}
      <IconButton onClick={handleOpenFile} tooltip="ファイルを追加 (PDF・画像)">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </IconButton>

      <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />

      {/* Page ops */}
      <IconButton onClick={handleDelete} disabled={!hasPages} tooltip="削除">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </IconButton>
      <IconButton onClick={handleDuplicate} disabled={!hasPages} tooltip="複製">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </IconButton>
      <IconButton onClick={handleRotateCW} disabled={!hasPages} tooltip="回転">
        <svg className="w-5 h-5 scale-x-[-1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h4l-1.5-1.5A7 7 0 0112 5a7 7 0 110 14 7 7 0 01-5-2.1" />
        </svg>
      </IconButton>

      <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />

      {/* View mode switcher */}
      <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
        {viewModes.map((vm) => (
          <button
            key={vm.id}
            onClick={() => docDispatch({ type: 'SET_VIEW_MODE', mode: vm.id })}
            className={`
              flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer
              ${docState.viewMode === vm.id
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }
            `}
            title={vm.label}
          >
            {vm.icon}
            <span className="hidden sm:inline">{vm.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1" />

      {/* Page info */}
      {hasPages && (
        <span className="text-xs text-gray-400 dark:text-gray-500 mr-2 tabular-nums">
          {docState.pages.length}ページ
          {hasSelection && ` (${selectedIds.length}選択中)`}
        </span>
      )}

      {/* Export */}
      <IconButton onClick={handleCopyToClipboard} disabled={!activePage} tooltip="クリップボードにコピー">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </IconButton>
      <IconButton onClick={handleDownload} disabled={!hasPages} tooltip="PDFダウンロード">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </IconButton>

      <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />

      <IconButton onClick={handleToggleDarkMode} tooltip="ダークモード">
        {editorState.darkMode ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </IconButton>
    </div>
  );
}
