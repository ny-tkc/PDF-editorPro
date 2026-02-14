import { PDFDocument } from 'pdf-lib';

export async function extractPageBytes(
  pdfBytes: Uint8Array
): Promise<{ pageBytes: Uint8Array; width: number; height: number }[]> {
  const srcDoc = await PDFDocument.load(pdfBytes);
  const pageCount = srcDoc.getPageCount();
  const results: { pageBytes: Uint8Array; width: number; height: number }[] = [];

  for (let i = 0; i < pageCount; i++) {
    const newDoc = await PDFDocument.create();
    const [copiedPage] = await newDoc.copyPages(srcDoc, [i]);
    newDoc.addPage(copiedPage);
    const bytes = await newDoc.save();
    const { width, height } = copiedPage.getSize();
    results.push({ pageBytes: new Uint8Array(bytes), width, height });
  }

  return results;
}

export async function mergePages(pagesBytes: Uint8Array[]): Promise<Uint8Array> {
  const mergedDoc = await PDFDocument.create();

  for (const bytes of pagesBytes) {
    const srcDoc = await PDFDocument.load(bytes);
    const indices = srcDoc.getPageIndices();
    const copiedPages = await mergedDoc.copyPages(srcDoc, indices);
    for (const page of copiedPages) {
      mergedDoc.addPage(page);
    }
  }

  return new Uint8Array(await mergedDoc.save());
}

export async function rotatePdfPage(
  pageBytes: Uint8Array,
  rotation: 0 | 90 | 180 | 270
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pageBytes);
  const page = doc.getPage(0);
  page.setRotation({ type: 0, angle: rotation });
  return new Uint8Array(await doc.save());
}

export async function createPdfFromImage(
  imageDataUrl: string
): Promise<{ pdfBytes: Uint8Array; width: number; height: number }> {
  const doc = await PDFDocument.create();

  let image;
  if (imageDataUrl.includes('image/png')) {
    const base64 = imageDataUrl.split(',')[1];
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    image = await doc.embedPng(bytes);
  } else {
    const base64 = imageDataUrl.split(',')[1];
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    image = await doc.embedJpg(bytes);
  }

  const { width, height } = image.scale(1);
  const page = doc.addPage([width, height]);
  page.drawImage(image, { x: 0, y: 0, width, height });

  return { pdfBytes: new Uint8Array(await doc.save()), width, height };
}
