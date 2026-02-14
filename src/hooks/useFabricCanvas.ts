import { useEffect, useRef, useCallback } from 'react';
import { Canvas, FabricImage } from 'fabric';
import { createRectangle, createCircle, createLine, createArrow, createTextbox } from '../utils/fabricHelpers';

interface UseFabricCanvasOptions {
  canvasElRef: React.RefObject<HTMLCanvasElement | null>;
  width: number;
  height: number;
  isEditMode: boolean;
  backgroundImageUrl: string | null;
  initialJSON: string | null;
  onModified: (json: string) => void;
  gridSnap: boolean;
  gridSize: number;
}

export function useFabricCanvas({
  canvasElRef,
  width,
  height,
  isEditMode,
  backgroundImageUrl,
  initialJSON,
  onModified,
  gridSnap,
  gridSize,
}: UseFabricCanvasOptions) {
  const canvasRef = useRef<Canvas | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (!canvasElRef.current || !isEditMode) return;

    const c = new Canvas(canvasElRef.current, {
      width,
      height,
      selection: true,
      backgroundColor: '#ffffff',
    });
    canvasRef.current = c;

    const fireModified = () => {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        const json = JSON.stringify(c.toJSON(['id']));
        onModified(json);
      }, 300);
    };

    c.on('object:modified', fireModified);
    c.on('object:added', fireModified);
    c.on('object:removed', fireModified);

    // Grid snap
    c.on('object:moving', (e) => {
      if (!gridSnap || !e.target) return;
      const obj = e.target;
      obj.set({
        left: Math.round((obj.left ?? 0) / gridSize) * gridSize,
        top: Math.round((obj.top ?? 0) / gridSize) * gridSize,
      });
    });

    // Load background image
    if (backgroundImageUrl) {
      FabricImage.fromURL(backgroundImageUrl).then((img) => {
        img.set({ selectable: false, evented: false });
        img.scaleToWidth(width);
        c.set('backgroundImage', img);
        c.renderAll();

        // Load annotations after background
        if (initialJSON) {
          try {
            const json = JSON.parse(initialJSON);
            c.loadFromJSON(json).then(() => {
              // Re-set background after loadFromJSON
              FabricImage.fromURL(backgroundImageUrl).then((bg) => {
                bg.set({ selectable: false, evented: false });
                bg.scaleToWidth(width);
                c.set('backgroundImage', bg);
                c.renderAll();
              });
            });
          } catch {
            c.renderAll();
          }
        }
      });
    }

    return () => {
      clearTimeout(debounceTimer.current);
      c.dispose();
      canvasRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, backgroundImageUrl, width, height]);

  const addText = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.add(createTextbox());
    c.renderAll();
  }, []);

  const addRect = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.add(createRectangle());
    c.renderAll();
  }, []);

  const addCircle = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.add(createCircle());
    c.renderAll();
  }, []);

  const addArrow = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.add(createArrow());
    c.renderAll();
  }, []);

  const addLine = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    c.add(createLine());
    c.renderAll();
  }, []);

  const deleteSelected = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const active = c.getActiveObjects();
    active.forEach((obj) => c.remove(obj));
    c.discardActiveObject();
    c.renderAll();
  }, []);

  const toDataURL = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return null;
    return c.toDataURL({ format: 'png', multiplier: 1 });
  }, []);

  const getJSON = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return null;
    return JSON.stringify(c.toJSON(['id']));
  }, []);

  return {
    canvas: canvasRef,
    addText,
    addRect,
    addCircle,
    addArrow,
    addLine,
    deleteSelected,
    toDataURL,
    getJSON,
  };
}
