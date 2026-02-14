interface DropZoneProps {
  isDragging: boolean;
}

export function DropZone({ isDragging }: DropZoneProps) {
  if (!isDragging) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-blue-500/20 backdrop-blur-sm border-4 border-dashed border-blue-500 rounded-lg pointer-events-none">
      <div className="text-center">
        <svg className="mx-auto w-16 h-16 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-xl font-semibold text-blue-700 dark:text-blue-300">
          ファイルをドロップして追加
        </p>
        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
          PDF・画像ファイルに対応
        </p>
      </div>
    </div>
  );
}
