export function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center desk-bg">
      <div className="text-center max-w-md">
        <div className="relative mx-auto w-32 h-32 mb-6">
          {/* Stacked pages illustration */}
          <div className="absolute inset-0 bg-white dark:bg-gray-700 rounded-lg shadow-md transform rotate-6 translate-x-2" />
          <div className="absolute inset-0 bg-white dark:bg-gray-600 rounded-lg shadow-md transform -rotate-3 -translate-x-1" />
          <div className="absolute inset-0 bg-white dark:bg-gray-500 rounded-lg shadow-lg flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-300 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          PDF編集デスク
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
          PDFや画像ファイルをドロップするか、<br />
          ツールバーの <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-200 dark:bg-gray-600 rounded text-xs font-bold align-middle">+</span> ボタンから追加してください
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
