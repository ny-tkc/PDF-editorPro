import { useRef, useCallback } from 'react';
import { useDocument } from '../../hooks/useDocument';
import { usePdfLoader } from '../../hooks/usePdfLoader';

export function EmptyState() {
  const { dispatch: docDispatch } = useDocument();
  const { loadFiles } = usePdfLoader();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = useCallback(() => {
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

  return (
    <div
      className="flex-1 flex items-center justify-center desk-bg cursor-pointer group"
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="text-center max-w-md transition-transform group-hover:scale-105 duration-200">
        <div className="relative mx-auto w-32 h-32 mb-6">
          {/* Stacked pages illustration */}
          <div className="absolute inset-0 bg-white dark:bg-gray-700 rounded-lg shadow-md transform rotate-6 translate-x-2" />
          <div className="absolute inset-0 bg-white dark:bg-gray-600 rounded-lg shadow-md transform -rotate-3 -translate-x-1" />
          <div className="absolute inset-0 bg-white dark:bg-gray-500 rounded-lg shadow-lg flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
            <svg className="w-12 h-12 text-gray-300 dark:text-gray-400 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          PDF編集デスク
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 leading-relaxed">
          クリックしてファイルを追加
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-6 leading-relaxed">
          またはPDFや画像ファイルをドロップ
        </p>

        <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-400 dark:text-gray-500">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-[10px]">Ctrl+V</kbd>
            スクリーンショット貼り付け
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-[10px]">D&D</kbd>
            ドラッグ＆ドロップ
          </span>
        </div>
      </div>
    </div>
  );
}
