import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import type { PageData } from '../types';

export async function exportToPdf(pages: PageData[]): Promise<Uint8Array> {
  const finalDoc = await PDFDocument.create();

  for (const page of pages) {
    if (page.fabricJSON) {
      // Page has annotations — we need to render fabric canvas to image
      // This will be called with a pre-rendered flattened image
      const dataUrl = page.imageDataUrl;
      if (!dataUrl) continue;

      const base64 = dataUrl.split(',')[1];
      const imgBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

      let image;
      if (dataUrl.includes('image/png')) {
        image = await finalDoc.embedPng(imgBytes);
      } else {
        image = await finalDoc.embedJpg(imgBytes);
      }

      const { width, height } = image.scale(1);
      const pdfPage = finalDoc.addPage([width, height]);
      pdfPage.drawImage(image, { x: 0, y: 0, width, height });

      if (page.rotation) {
        pdfPage.setRotation({ type: 0, angle: page.rotation });
      }
    } else if (page.pdfBytes) {
      // No annotations — copy original page
      const srcDoc = await PDFDocument.load(page.pdfBytes);
      const [copiedPage] = await finalDoc.copyPages(srcDoc, [0]);
      if (page.rotation) {
        copiedPage.setRotation({ type: 0, angle: page.rotation });
      }
      finalDoc.addPage(copiedPage);
    } else if (page.imageDataUrl) {
      // Image-only page
      const base64 = page.imageDataUrl.split(',')[1];
      const imgBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

      let image;
      if (page.imageDataUrl.includes('image/png')) {
        image = await finalDoc.embedPng(imgBytes);
      } else {
        image = await finalDoc.embedJpg(imgBytes);
      }

      const { width, height } = image.scale(1);
      const pdfPage = finalDoc.addPage([width, height]);
      pdfPage.drawImage(image, { x: 0, y: 0, width, height });

      if (page.rotation) {
        pdfPage.setRotation({ type: 0, angle: page.rotation });
      }
    }
  }

  return new Uint8Array(await finalDoc.save());
}

export function downloadPdf(bytes: Uint8Array, fileName: string): void {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  saveAs(blob, fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);
}
