import { useCallback } from 'react';
import type { PageData } from '../types';
import { generateId } from '../utils/idGenerator';
import { extractPageBytes, createPdfFromImage } from '../services/pdfService';
import { renderPageToDataUrl } from '../services/pdfRenderService';
import { fileToArrayBuffer, fileToDataUrl, isImageFile, isPdfFile } from '../services/imageService';
import { THUMBNAIL_RENDER_SCALE } from '../utils/constants';

export function usePdfLoader() {
  const loadFromPdfBytes = useCallback(async (bytes: Uint8Array, fileName = 'document.pdf'): Promise<PageData[]> => {
    const groupId = generateId();
    const extracted = await extractPageBytes(bytes);

    // Render thumbnails in parallel (skip high-res imageDataUrl for speed)
    const thumbnailPromises = extracted.map(({ pageBytes }) =>
      renderPageToDataUrl(pageBytes, 0, THUMBNAIL_RENDER_SCALE)
    );
    const thumbnails = await Promise.all(thumbnailPromises);

    const pages: PageData[] = extracted.map(({ pageBytes, width, height }, i) => ({
      id: generateId(),
      sourceType: 'pdf' as const,
      sourceFileName: fileName,
      sourceGroupId: groupId,
      pdfBytes: pageBytes,
      imageDataUrl: null, // Deferred: rendered on demand when entering edit mode
      fabricJSON: null,
      rotation: 0,
      width,
      height,
      thumbnailDataUrl: thumbnails[i].dataUrl,
    }));

    return pages;
  }, []);

  const loadFromFile = useCallback(async (file: File): Promise<PageData[]> => {
    if (isPdfFile(file)) {
      const buffer = await fileToArrayBuffer(file);
      return loadFromPdfBytes(new Uint8Array(buffer), file.name);
    }

    if (isImageFile(file)) {
      const dataUrl = await fileToDataUrl(file);
      return [await loadFromImageDataUrl(dataUrl, file.name)];
    }

    return [];
  }, [loadFromPdfBytes]);

  const loadFromImageDataUrl = useCallback(async (dataUrl: string, fileName = 'image.png'): Promise<PageData> => {
    const { pdfBytes, width, height } = await createPdfFromImage(dataUrl);
    const { dataUrl: thumbnailDataUrl } = await renderPageToDataUrl(pdfBytes, 0, THUMBNAIL_RENDER_SCALE);
    const groupId = generateId();

    return {
      id: generateId(),
      sourceType: 'image',
      sourceFileName: fileName,
      sourceGroupId: groupId,
      pdfBytes,
      imageDataUrl: dataUrl,
      fabricJSON: null,
      rotation: 0,
      width,
      height,
      thumbnailDataUrl,
    };
  }, []);

  const loadFiles = useCallback(async (files: File[]): Promise<PageData[]> => {
    // Process files in parallel for better speed
    const results = await Promise.all(files.map((file) => loadFromFile(file)));
    return results.flat();
  }, [loadFromFile]);

  return { loadFromFile, loadFiles, loadFromPdfBytes, loadFromImageDataUrl };
}
