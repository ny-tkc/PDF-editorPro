import { useEffect, useRef, useCallback, useState } from 'react';
import { Canvas, FabricImage, FabricObject, Rect, Circle, Line } from 'fabric';
import { createRectangle, createCircle, createLine, createArrow, createTextbox } from '../utils/fabricHelpers';
import type { EditTool } from '../types';

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

export interface SelectedObjectProps {
  strokeWidth: number;
  stroke: string;
  fill: string;
  fontSize?: number;
  opacity: number;
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
  const drawingToolRef = useRef<EditTool>('select');
  const isDrawingRef = useRef(false);
  const drawStartRef = useRef({ x: 0, y: 0 });
  const previewObjRef = useRef<FabricObject | null>(null);
  const [selectedProps, setSelectedProps] = useState<SelectedObjectProps | null>(null);

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

    // Selection tracking for property panel
    c.on('selection:created', () => updateSelectedProps(c));
    c.on('selection:updated', () => updateSelectedProps(c));
    c.on('selection:cleared', () => setSelectedProps(null));

    // Grid snap
    c.on('object:moving', (e) => {
      if (!gridSnap || !e.target) return;
      const obj = e.target;
      obj.set({
        left: Math.round((obj.left ?? 0) / gridSize) * gridSize,
        top: Math.round((obj.top ?? 0) / gridSize) * gridSize,
      });
    });

    // --- Drag-to-draw with live preview ---
    c.on('mouse:down', (opt) => {
      const tool = drawingToolRef.current;
      if (tool === 'select') return;

      const pointer = c.getScenePoint(opt.e);
      isDrawingRef.current = true;
      drawStartRef.current = { x: pointer.x, y: pointer.y };
      c.selection = false;
    });

    c.on('mouse:move', (opt) => {
      if (!isDrawingRef.current) return;
      const tool = drawingToolRef.current;
      if (tool === 'select') return;

      const pointer = c.getScenePoint(opt.e);
      const sx = drawStartRef.current.x;
      const sy = drawStartRef.current.y;
      const ex = pointer.x;
      const ey = pointer.y;
      const w = Math.abs(ex - sx);
      const h = Math.abs(ey - sy);
      const minX = Math.min(sx, ex);
      const minY = Math.min(sy, ey);

      // Remove old preview
      if (previewObjRef.current) {
        c.remove(previewObjRef.current);
        previewObjRef.current = null;
      }

      if (w < 2 && h < 2) return;

      let preview: FabricObject | null = null;

      switch (tool) {
        case 'rectangle':
          preview = new Rect({
            left: minX, top: minY, width: w, height: h,
            fill: 'rgba(59,130,246,0.08)',
            stroke: '#3b82f6',
            strokeWidth: 2,
            strokeDashArray: [6, 4],
            selectable: false,
            evented: false,
          });
          break;
        case 'circle':
          preview = new Circle({
            left: minX, top: minY, radius: Math.max(w, h) / 2,
            fill: 'rgba(59,130,246,0.08)',
            stroke: '#3b82f6',
            strokeWidth: 2,
            strokeDashArray: [6, 4],
            selectable: false,
            evented: false,
          });
          break;
        case 'line':
        case 'arrow':
          preview = new Line([sx, sy, ex, ey], {
            stroke: '#3b82f6',
            strokeWidth: 2,
            strokeDashArray: [6, 4],
            selectable: false,
            evented: false,
          });
          break;
        case 'text':
          preview = new Rect({
            left: minX, top: minY, width: Math.max(w, 20), height: Math.max(h, 24),
            fill: 'rgba(59,130,246,0.05)',
            stroke: '#3b82f6',
            strokeWidth: 1,
            strokeDashArray: [4, 3],
            selectable: false,
            evented: false,
          });
          break;
      }

      if (preview) {
        c.add(preview);
        previewObjRef.current = preview;
        c.renderAll();
      }
    });

    c.on('mouse:up', (opt) => {
      const tool = drawingToolRef.current;
      if (!isDrawingRef.current || tool === 'select') return;
      isDrawingRef.current = false;
      c.selection = true;

      // Remove preview
      if (previewObjRef.current) {
        c.remove(previewObjRef.current);
        previewObjRef.current = null;
      }

      const pointer = c.getScenePoint(opt.e);
      const sx = drawStartRef.current.x;
      const sy = drawStartRef.current.y;
      const ex = pointer.x;
      const ey = pointer.y;

      const w = Math.abs(ex - sx);
      const h = Math.abs(ey - sy);
      const minX = Math.min(sx, ex);
      const minY = Math.min(sy, ey);

      // Minimum drag distance to create
      if (w < 5 && h < 5) return;

      let obj: FabricObject | null = null;

      switch (tool) {
        case 'rectangle':
          obj = createRectangle(minX, minY, w, h);
          break;
        case 'circle':
          obj = createCircle(minX, minY, Math.max(w, h) / 2);
          break;
        case 'line':
          obj = createLine(sx, sy, ex, ey);
          break;
        case 'arrow':
          obj = createArrow(sx, sy, ex, ey);
          break;
        case 'text':
          obj = createTextbox(minX, minY, Math.max(w, 100));
          break;
      }

      if (obj) {
        c.add(obj);
        c.setActiveObject(obj);
        c.renderAll();
      }
    });

    // Load background image
    if (backgroundImageUrl) {
      FabricImage.fromURL(backgroundImageUrl).then((img) => {
        img.set({ selectable: false, evented: false });
        img.scaleToWidth(width);
        c.set('backgroundImage', img);
        c.renderAll();

        if (initialJSON) {
          try {
            const json = JSON.parse(initialJSON);
            c.loadFromJSON(json).then(() => {
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
      previewObjRef.current = null;
      c.dispose();
      canvasRef.current = null;
      setSelectedProps(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, backgroundImageUrl, width, height]);

  const updateSelectedProps = (c: Canvas) => {
    const obj = c.getActiveObject();
    if (!obj) { setSelectedProps(null); return; }
    setSelectedProps({
      strokeWidth: (obj.strokeWidth as number) ?? 5,
      stroke: (obj.stroke as string) ?? '#ef4444',
      fill: (obj.fill as string) ?? 'transparent',
      fontSize: 'fontSize' in obj ? (obj as { fontSize: number }).fontSize : undefined,
      opacity: obj.opacity ?? 1,
    });
  };

  const setDrawingTool = useCallback((tool: EditTool) => {
    drawingToolRef.current = tool;
    const c = canvasRef.current;
    if (!c) return;
    if (tool === 'select') {
      c.selection = true;
      c.defaultCursor = 'default';
      c.getObjects().forEach((o) => o.set({ selectable: true, evented: true }));
    } else {
      c.discardActiveObject();
      c.selection = false;
      c.defaultCursor = 'crosshair';
      c.getObjects().forEach((o) => o.set({ selectable: false, evented: false }));
    }
    c.renderAll();
  }, []);

  const updateSelectedObject = useCallback((props: Partial<SelectedObjectProps>) => {
    const c = canvasRef.current;
    if (!c) return;
    const obj = c.getActiveObject();
    if (!obj) return;

    if (props.strokeWidth !== undefined) obj.set('strokeWidth', props.strokeWidth);
    if (props.stroke !== undefined) obj.set('stroke', props.stroke);
    if (props.fill !== undefined) obj.set('fill', props.fill);
    if (props.opacity !== undefined) obj.set('opacity', props.opacity);
    if (props.fontSize !== undefined && 'fontSize' in obj) {
      (obj as { fontSize: number }).fontSize = props.fontSize;
    }

    c.renderAll();
    updateSelectedProps(c);

    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      onModified(JSON.stringify(c.toJSON(['id'])));
    }, 300);
  }, [onModified]);

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
    setDrawingTool,
    deleteSelected,
    toDataURL,
    getJSON,
    selectedProps,
    updateSelectedObject,
  };
}
