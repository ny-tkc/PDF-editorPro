import { pdfjsLib } from '../utils/pdfWorkerSetup';

export async function renderPageToDataUrl(
  pdfBytes: Uint8Array,
  pageIndex: number,
  scale: number
): Promise<{ dataUrl: string; width: number; height: number }> {
  const doc = await pdfjsLib.getDocument({ data: pdfBytes.slice() }).promise;
  const page = await doc.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d')!;

  await page.render({ canvasContext: ctx, viewport }).promise;

  const dataUrl = canvas.toDataURL('image/png');
  doc.destroy();

  return { dataUrl, width: viewport.width, height: viewport.height };
}

export async function getPdfPageCount(pdfBytes: Uint8Array): Promise<number> {
  const doc = await pdfjsLib.getDocument({ data: pdfBytes.slice() }).promise;
  const count = doc.numPages;
  doc.destroy();
  return count;
}

export async function getPdfPageSize(
  pdfBytes: Uint8Array,
  pageIndex: number
): Promise<{ width: number; height: number }> {
  const doc = await pdfjsLib.getDocument({ data: pdfBytes.slice() }).promise;
  const page = await doc.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale: 1.0 });
  doc.destroy();
  return { width: viewport.width, height: viewport.height };
}
