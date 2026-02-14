import { Rect, Circle, Line, Textbox, Group, Triangle } from 'fabric';
import { SHAPE_DEFAULTS, TEXT_DEFAULTS, ARROW_HEAD_LENGTH } from './constants';

export function createRectangle(left = 100, top = 100) {
  return new Rect({
    left,
    top,
    width: 150,
    height: 100,
    ...SHAPE_DEFAULTS,
  });
}

export function createCircle(left = 150, top = 150) {
  return new Circle({
    left,
    top,
    radius: 50,
    ...SHAPE_DEFAULTS,
  });
}

export function createLine(x1 = 100, y1 = 100, x2 = 300, y2 = 100) {
  return new Line([x1, y1, x2, y2], {
    ...SHAPE_DEFAULTS,
    fill: undefined,
  });
}

export function createArrow(x1 = 100, y1 = 200, x2 = 300, y2 = 200) {
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

export function createTextbox(left = 100, top = 100, text = 'テキスト') {
  return new Textbox(text, {
    left,
    top,
    width: 200,
    ...TEXT_DEFAULTS,
    ...SHAPE_DEFAULTS,
    fill: TEXT_DEFAULTS.fill,
    stroke: undefined,
    strokeWidth: 0,
    editable: true,
  });
}
