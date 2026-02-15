import { Rect, Circle, Line, Textbox, Group, Triangle } from 'fabric';
import { SHAPE_DEFAULTS, TEXT_DEFAULTS, ARROW_HEAD_LENGTH } from './constants';

export function createRectangle(left: number, top: number, width: number, height: number) {
  return new Rect({
    left,
    top,
    width,
    height,
    ...SHAPE_DEFAULTS,
  });
}

export function createCircle(left: number, top: number, radius: number) {
  return new Circle({
    left,
    top,
    radius,
    ...SHAPE_DEFAULTS,
  });
}

export function createLine(x1: number, y1: number, x2: number, y2: number) {
  return new Line([x1, y1, x2, y2], {
    ...SHAPE_DEFAULTS,
    fill: undefined,
  });
}

export function createArrow(x1: number, y1: number, x2: number, y2: number) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLen = ARROW_HEAD_LENGTH;

  const line = new Line([x1, y1, x2, y2], {
    stroke: SHAPE_DEFAULTS.stroke,
    strokeWidth: SHAPE_DEFAULTS.strokeWidth,
  });

  const triangle = new Triangle({
    left: x2,
    top: y2,
    width: headLen,
    height: headLen,
    fill: SHAPE_DEFAULTS.stroke,
    angle: (angle * 180) / Math.PI + 90,
    originX: 'center',
    originY: 'center',
  });

  const group = new Group([line, triangle], {
    ...SHAPE_DEFAULTS,
    fill: undefined,
  });

  return group;
}

export function createTextbox(left: number, top: number, width: number) {
  return new Textbox('テキスト', {
    left,
    top,
    width,
    ...TEXT_DEFAULTS,
    ...SHAPE_DEFAULTS,
    fill: TEXT_DEFAULTS.fill,
    stroke: undefined,
    strokeWidth: 0,
    editable: true,
  });
}
