'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  applyCanvasTransform,
  CANVAS_BACKGROUND,
  drawStroke,
  getRelativePoint,
  redrawAll,
} from '../lib/canvas/drawing';
import type { Point, Stroke } from '../types';

interface UseCanvasDrawingOptions {
  lineWidth?: number;
  color?: string;
  /** Called after every structural change (stroke committed, undo, redo, clear). */
  onStrokesChange?: (strokeCount: number) => void;
  /** Blocks all input — used while the round-over overlay is up. */
  disabled?: boolean;
  /** Leaves the canvas background transparent so a layer behind it (webcam feed) shows through. */
  transparentBackground?: boolean;
  /**
   * Gates the pointer (mouse/touch) path only. Turned off in webcam mode so
   * the gesture source is the sole writer of the in-progress stroke — the
   * imperative startStrokeAt/extendStrokeTo/endStroke path is unaffected.
   */
  pointerInputEnabled?: boolean;
}

/**
 * Canvas drawing state: stroke capture, undo/redo/clear, repaint.
 *
 * Strokes live in refs, not React state. Two reasons:
 *
 *  1. Correctness. The previous version committed strokes with
 *     `setStrokes(prev => [...prev, currentStroke.current])` and then
 *     immediately set `currentStroke.current = null`. React runs that updater
 *     lazily during render, by which time the ref is already null — so every
 *     stroke after the first was stored as `null` and vanished on pointer-up.
 *     Capturing the value up-front removes that whole class of bug.
 *  2. Performance. A 60fps stroke should not schedule 60 React renders.
 *
 * `version` is bumped only on structural changes so the UI can enable/disable
 * undo, redo and "guess" buttons.
 *
 * External input (webcam hand-tracking) calls startStrokeAt / extendStrokeTo /
 * endStroke directly, so gesture drawing and pointer drawing share one path.
 */
export function useCanvasDrawing(options: UseCanvasDrawingOptions = {}) {
  const {
    lineWidth = 6,
    color = '#1F2844',
    onStrokesChange,
    disabled = false,
    transparentBackground = false,
    pointerInputEnabled = true,
  } = options;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const redoRef = useRef<Stroke[]>([]);
  const currentRef = useRef<Stroke | null>(null);
  const activePointerId = useRef<number | null>(null);

  const [version, setVersion] = useState(0);
  const [strokeCount, setStrokeCount] = useState(0);
  const [canRedo, setCanRedo] = useState(false);

  // Keep the latest brush settings, disabled flag and callback reachable from
  // event handlers without re-creating the handlers (and without stale-closure
  // bugs). Written in effects, never during render — a render can be discarded
  // or replayed, and a ref mutated there would leak that work.
  const brush = useRef({ color, lineWidth });
  const disabledRef = useRef(disabled);
  const onStrokesChangeRef = useRef(onStrokesChange);
  const transparentRef = useRef(transparentBackground);
  const pointerInputEnabledRef = useRef(pointerInputEnabled);

  useEffect(() => {
    brush.current = { color, lineWidth };
  }, [color, lineWidth]);

  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  useEffect(() => {
    onStrokesChangeRef.current = onStrokesChange;
  }, [onStrokesChange]);

  /** Full repaint, including any in-progress stroke. */
  const repaint = useCallback(() => {
    if (!canvasRef.current) return;
    redrawAll(
      canvasRef.current,
      strokesRef.current,
      currentRef.current,
      transparentRef.current ? null : CANVAS_BACKGROUND
    );
  }, []);

  // Switching in/out of webcam mode changes whether the background should be
  // transparent; repaint immediately instead of waiting for the next stroke.
  useEffect(() => {
    transparentRef.current = transparentBackground;
    repaint();
  }, [transparentBackground, repaint]);

  const commitChange = useCallback(() => {
    setStrokeCount(strokesRef.current.length);
    setCanRedo(redoRef.current.length > 0);
    setVersion((v) => v + 1);
    onStrokesChangeRef.current?.(strokesRef.current.length);
  }, []);

  // ---------------------------------------------------------------- input ---

  const startStrokeAt = useCallback((point: Point) => {
    if (disabledRef.current) return;
    currentRef.current = {
      points: [point],
      color: brush.current.color,
      lineWidth: brush.current.lineWidth,
    };
    // Paint the dot immediately so a tap gives instant feedback.
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) drawStroke(ctx, currentRef.current);
  }, []);

  const extendStrokeTo = useCallback((point: Point) => {
    const stroke = currentRef.current;
    const canvas = canvasRef.current;
    if (!stroke || !canvas) return;

    const pts = stroke.points;
    const last = pts[pts.length - 1];
    // Drop sub-pixel duplicates: they add nothing visually and bloat the payload
    // sent to the AI (hand tracking emits ~60 points/second).
    if (
      last &&
      Math.abs(last.x - point.x) < 0.6 &&
      Math.abs(last.y - point.y) < 0.6
    )
      return;

    pts.push(point);

    // Fast path: draw only the new segment instead of repainting everything.
    const ctx = canvas.getContext('2d');
    if (!ctx || pts.length < 2) return;
    const prev = pts[pts.length - 2];
    ctx.save();
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    ctx.restore();
  }, []);

  const endStroke = useCallback(() => {
    // Read the ref into a local BEFORE clearing it — see the note above.
    const finished = currentRef.current;
    currentRef.current = null;
    if (!finished || finished.points.length === 0) return;

    strokesRef.current = [...strokesRef.current, finished];
    redoRef.current = []; // a new stroke invalidates the redo stack
    repaint(); // repaint once so the committed stroke gets the smoothed render
    commitChange();
  }, [repaint, commitChange]);

  // ------------------------------------------------------- pointer events ---

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (
        disabledRef.current ||
        !pointerInputEnabledRef.current ||
        !canvasRef.current
      )
        return;
      if (e.pointerType === 'mouse' && e.button !== 0) return; // ignore right/middle click

      // Pointer capture keeps the stroke alive when the cursor leaves the
      // canvas, and guarantees we receive the matching pointerup.
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* not fatal — some browsers refuse capture for synthetic pointers */
      }
      activePointerId.current = e.pointerId;
      startStrokeAt(getRelativePoint(canvasRef.current, e.clientX, e.clientY));
    },
    [startStrokeAt]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (
        !pointerInputEnabledRef.current ||
        !canvasRef.current ||
        currentRef.current === null
      )
        return;
      if (
        activePointerId.current !== null &&
        e.pointerId !== activePointerId.current
      )
        return;

      // Coalesced events give every sample the OS captured between frames,
      // which makes fast strokes smooth instead of jagged.
      const events =
        typeof e.nativeEvent.getCoalescedEvents === 'function'
          ? e.nativeEvent.getCoalescedEvents()
          : [];
      const samples = events.length > 0 ? events : [e.nativeEvent];
      for (const sample of samples) {
        extendStrokeTo(
          getRelativePoint(canvasRef.current, sample.clientX, sample.clientY)
        );
      }
    },
    [extendStrokeTo]
  );

  const handlePointerUp = useCallback(
    (e?: React.PointerEvent<HTMLCanvasElement>) => {
      if (
        e &&
        activePointerId.current !== null &&
        e.pointerId !== activePointerId.current
      )
        return;
      if (e) {
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
          /* already released */
        }
      }
      activePointerId.current = null;
      endStroke();
    },
    [endStroke]
  );

  // Mirrored in an effect (not during render) so toggling the mode never
  // re-creates the pointer handlers. If pointer input is switched off while a
  // drag is in progress — e.g. the user flips to webcam mode mid-stroke —
  // commit what was drawn instead of leaving it stuck in currentRef.
  useEffect(() => {
    pointerInputEnabledRef.current = pointerInputEnabled;
    if (!pointerInputEnabled && activePointerId.current !== null)
      handlePointerUp();
  }, [pointerInputEnabled, handlePointerUp]);

  // ------------------------------------------------------------- history ---

  const undo = useCallback(() => {
    if (strokesRef.current.length === 0) return;
    const next = strokesRef.current.slice(0, -1);
    const removed = strokesRef.current[strokesRef.current.length - 1];
    strokesRef.current = next;
    redoRef.current = [...redoRef.current, removed];
    repaint();
    commitChange();
  }, [repaint, commitChange]);

  const redo = useCallback(() => {
    if (redoRef.current.length === 0) return;
    const restored = redoRef.current[redoRef.current.length - 1];
    redoRef.current = redoRef.current.slice(0, -1);
    strokesRef.current = [...strokesRef.current, restored];
    repaint();
    commitChange();
  }, [repaint, commitChange]);

  const clear = useCallback(() => {
    if (strokesRef.current.length === 0 && !currentRef.current) return;
    strokesRef.current = [];
    redoRef.current = [];
    currentRef.current = null;
    repaint();
    commitChange();
  }, [repaint, commitChange]);

  const getStrokes = useCallback(() => strokesRef.current, []);

  // ------------------------------------------------------ mount & resize ---

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    applyCanvasTransform(canvas);
    repaint();

    // Repaint on resize; the backing store is reallocated, so without this the
    // drawing would be lost every time the layout changes.
    const observer = new ResizeObserver(() => repaint());
    observer.observe(canvas);

    const onDpr = () => repaint();
    window.addEventListener('resize', onDpr);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', onDpr);
    };
  }, [repaint]);

  return {
    canvasRef,
    version,
    strokeCount,
    canUndo: strokeCount > 0,
    canRedo,
    getStrokes,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    // exposed so webcam gesture input drives the exact same code path
    startStrokeAt,
    extendStrokeTo,
    endStroke,
    undo,
    redo,
    clear,
    repaint,
  };
}
