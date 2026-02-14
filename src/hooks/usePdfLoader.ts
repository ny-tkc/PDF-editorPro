import { useCallback } from 'react';
import type { PageData } from '../types';
import { generateId } from '../utils/idGenerator';
import { extractPageBytes, createPdfFromImage } from '../services/pdfService';
import { renderPageToDataUrl } from '../services/pdfRenderService';
import { fileToArrayBuffer, fileToDataUrl, isImageFile, isPdfFile } from '../services/imageService';
import { PDF_RENDER_SCALE, THUMBNAIL_RENDER_SCALE } from '../utils/constants';

export function usePdfLoader() {
  const loadFromPdfBytes = useCallback(async (bytes: Uint8Array): Promise<PageData[]> => {
    const extracted = await extractPageBytes(bytes);
    const pages: PageData[] = [];

    for (const { pageBytes, width, height } of extracted) {
      const { dataUrl: imageDataUrl } = await renderPageToDataUrl(pageBytes, 0, PDF_RENDER_SCALE);
      const { dataUrl: thumbnailDataUrl } = await renderPageToDataUrl(pageBytes, 0, THUMBNAIL_RENDER_SCALE);

      pages.push({
        id: generateId(),
        sourceType: 'pdf',
        pdfBytes: pageBytes,
        imageDataUrl,
        fabricJSON: null,
        rotation: 0,
        width,
        height,
        thumbnailDataUrl,
      });
    }

    return pages;
  }, []);

  const loadFromFile = useCallback(async (file: File): Promise<PageData[]> => {
    if (isPdfFile(file)) {
      const buffer = await fileToArrayBuffer(file);
      return loadFromPdfBytes(new Uint8Array(buffer));
    }

    if (isImageFile(file)) {
      const dataUrl = await fileToDataUrl(file);
      return [await loadFromImageDataUrl(dataUrl)];
    }

    return [];
  }, [loadFromPdfBytes]);

  const loadFromImageDataUrl = useCallback(async (dataUrl: string): Promise<PageData> => {
    const { pdfBytes, width, height } = await createPdfFromImage(dataUrl);
    const { dataUrl: thumbnailDataUrl } = await renderPageToDataUrl(pdfBytes, 0, THUMBNAIL_RENDER_SCALE);

    return {
      id: generateId(),
      sourceType: 'image',
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
    const allPages: PageData[] = [];
    for (const file of files) {
      const pages = await loadFromFile(file);
      allPages.push(...pages);
    }
    return allPages;
  }, [loadFromFile]);

  return { loadFromFile, loadFiles, loadFromPdfBytes, loadFromImageDataUrl };
}
