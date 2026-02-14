import { useEffect, useCallback } from 'react';

export function useClipboardPaste(onImagePasted: (dataUrl: string) => void) {
  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const blob = item.getAsFile();
          if (!blob) continue;

          const reader = new FileReader();
          reader.onload = () => {
            onImagePasted(reader.result as string);
          };
          reader.readAsDataURL(blob);
          return;
        }
      }
    },
    [onImagePasted]
  );

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);
}
