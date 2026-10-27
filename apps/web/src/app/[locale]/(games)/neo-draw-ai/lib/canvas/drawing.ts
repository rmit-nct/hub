import type { Point, Stroke, StrokeBounds } from '../../types';

/**
 * Pure canvas drawing helpers.
 *
 * Coordinate model
 * ----------------
 * Every stroke is stored in a fixed LOGICAL space (800x600). The visible canvas
 * can be any CSS size and any devicePixelRatio; `applyCanvasTransform` maps
 * logical -> device pixels at paint time. That keeps drawings sharp on retina
 * screens, keeps them intact when the window is resized, and lets webcam
 * (normalised 0-1) and pointer input feed the exact same numbers.
 */

export const LOGICAL_WIDTH = 800;
export const LOGICAL_HEIGHT = 600;
export const CANVAS_ASPECT = LOGICAL_WIDTH / LOGICAL_HEIGHT;

export const CANVAS_BACKGROUND = '#FFFFFF';

/**
 * Size the backing store for the current CSS box + DPR and set a transform so
 * all subsequent drawing can use logical (800x600) coordinates.
 * Returns false when the canvas has no layout box yet.
 */
export function applyCanvasTransform(canvas: HTMLCanvasElement): boolean {
  const rect = canvas.getBoundingClientRect();
  if (rect.width < 1 || rect.height < 1) return false;

  const dpr = Math.min(window.devicePixelRatio || 1, 3); // cap: 4x DPR backing stores get expensive
  const targetW = Math.round(rect.width * dpr);
  const targetH = Math.round(rect.height * dpr);

  // Only resize when needed — assigning width/height wipes the canvas.
  if (canvas.width !== targetW || canvas.height !== targetH) {
    canvas.width = targetW;
    canvas.height = targetH;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  const scale = targetW / LOGICAL_WIDTH;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  return true;
}

export function drawStroke(
  ctx: CanvasRenderingContext2D,
  stroke: Stroke | null | undefined
) {
  if (!stroke?.points?.length) return;

  ctx.save();
  ctx.strokeStyle = stroke.color;
  ctx.fillStyle = stroke.color;
  ctx.lineWidth = stroke.lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const pts = stroke.points;

  // A tap / click with no drag is a dot, not a no-op.
  if (pts.length === 1) {
    ctx.beginPath();
    ctx.arc(pts[0].x, pts[0].y, stroke.lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // Quadratic smoothing through midpoints — removes the polygonal look of raw
  // pointer samples and most of the jitter in hand-tracked points.
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length - 1; i++) {
    const midX = (pts[i].x + pts[i + 1].x) / 2;
    const midY = (pts[i].y + pts[i + 1].y) / 2;
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
  }
  ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
  ctx.stroke();
  ctx.restore();
}

/**
 * Repaint everything: background + committed strokes + the in-progress stroke.
 * Pass `backgroundColor: null` (webcam mode) to leave the canvas transparent
 * so a video layer behind it shows through.
 */
export function redrawAll(
  canvas: HTMLCanvasElement,
  strokes: Stroke[],
  current?: Stroke | null,
  backgroundColor: string | null = CANVAS_BACKGROUND
) {
  if (!applyCanvasTransform(canvas)) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  if (backgroundColor) {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  }

  for (const stroke of strokes) drawStroke(ctx, stroke);
  if (current) drawStroke(ctx, current);
}

/** Client (viewport) coordinates -> logical canvas coordinates, clamped to the canvas. */
export function getRelativePoint(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number
): Point {
  const rect = canvas.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * LOGICAL_WIDTH;
  const y = ((clientY - rect.top) / rect.height) * LOGICAL_HEIGHT;
  return { x: clamp(x, 0, LOGICAL_WIDTH), y: clamp(y, 0, LOGICAL_HEIGHT) };
}

/** Normalised 0-1 coordinates (MediaPipe) -> logical canvas coordinates. */
export function normalizedToLogical(
  nx: number,
  ny: number,
  mirrorX = true
): Point {
  return {
    x: clamp((mirrorX ? 1 - nx : nx) * LOGICAL_WIDTH, 0, LOGICAL_WIDTH),
    y: clamp(ny * LOGICAL_HEIGHT, 0, LOGICAL_HEIGHT),
  };
}

export function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

/** True when there is nothing but background on the canvas. */
export function isBlank(strokes: Stroke[]): boolean {
  return strokes.every((s) => !s.points || s.points.length === 0);
}

/**
 * Bounding box (logical coords) of every point across the given strokes, or
 * null if none of them have any points. Used to approximate "what part of
 * the drawing changed" between two guesses — see StrokeBounds.
 */
export function computeStrokeBounds(strokes: Stroke[]): StrokeBounds | null {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const stroke of strokes) {
    for (const p of stroke.points) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
  }

  if (!Number.isFinite(minX)) return null;
  return {
    x: minX,
    y: minY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
  };
}

/**
 * Render the drawing to an offscreen canvas and return a base64 PNG.
 * Off-screen so the export is identical no matter how large the canvas is on
 * screen, and always on opaque white (transparent PNGs confuse vision models).
 */
export function exportDrawing(
  strokes: Stroke[],
  maxWidth = LOGICAL_WIDTH
): string | null {
  if (typeof document === 'undefined') return null;

  const scale = Math.min(1, maxWidth / LOGICAL_WIDTH);
  const off = document.createElement('canvas');
  off.width = Math.round(LOGICAL_WIDTH * scale);
  off.height = Math.round(LOGICAL_HEIGHT * scale);

  const ctx = off.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = CANVAS_BACKGROUND;
  ctx.fillRect(0, 0, off.width, off.height);
  ctx.scale(scale, scale);
  for (const stroke of strokes) drawStroke(ctx, stroke);

  return off.toDataURL('image/png').split(',')[1] ?? null;
}

/** Export the visible canvas element as a base64 PNG (no data-url prefix). */
export function canvasToBase64(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png').split(',')[1];
}
