'use client';

import {
  forwardRef,
  type ReactNode,
  type RefObject,
  useImperativeHandle,
} from 'react';
import { useCanvasDrawing } from '../../hooks/useCanvasDrawing';
import { CANVAS_ASPECT, exportDrawing } from '../../lib/canvas/drawing';
import type { Point, Stroke } from '../../types';

export interface DrawingCanvasHandle {
  undo: () => void;
  redo: () => void;
  clear: () => void;
  getStrokes: () => Stroke[];
  exportBase64: (maxWidth?: number) => string | null;
  // used by webcam gesture input to drive the same drawing logic as mouse/touch
  startStrokeAt: (point: Point) => void;
  extendStrokeTo: (point: Point) => void;
  endStroke: () => void;
}

interface DrawingCanvasProps {
  color?: string;
  lineWidth?: number;
  disabled?: boolean;
  onStrokesChange?: (strokeCount: number) => void;
  /** Overlay rendered above the canvas (round-over card, fingertip cursor…). */
  children?: ReactNode;
  /**
   * Shows the live webcam feed behind the canvas (mirrored, like the gesture
   * preview) and makes the canvas background transparent so strokes are drawn
   * directly over the video instead of over white.
   */
  showWebcamBackground?: boolean;
  /** Same video element the hand-tracking hook streams into — shared, not a second camera request. */
  videoRef?: RefObject<HTMLVideoElement | null>;
  /**
   * Allow mouse/touch drawing on the canvas. Set false in webcam mode so the
   * hand gesture is the only thing driving strokes — otherwise a stray mouse
   * move and the pinch gesture both write to the same in-progress stroke.
   */
  pointerInputEnabled?: boolean;
}

/**
 * Responsive drawing surface.
 *
 * The canvas element used to carry hard-coded width={800} height={600}
 * attributes, which overflowed every phone viewport and rendered blurry on
 * high-DPI screens. It is now fluid: CSS gives it a 4:3 box, and the hook sizes
 * the backing store to the real box × devicePixelRatio, so strokes stay sharp
 * and the drawing survives resizes and orientation changes.
 */
export const DrawingCanvas = forwardRef<
  DrawingCanvasHandle,
  DrawingCanvasProps
>(function DrawingCanvas(
  {
    color,
    lineWidth,
    disabled = false,
    onStrokesChange,
    children,
    showWebcamBackground = false,
    videoRef,
    pointerInputEnabled = true,
  },
  ref
) {
  const {
    canvasRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    startStrokeAt,
    extendStrokeTo,
    endStroke,
    getStrokes,
    undo,
    redo,
    clear,
  } = useCanvasDrawing({
    color,
    lineWidth,
    disabled,
    onStrokesChange,
    transparentBackground: showWebcamBackground,
    pointerInputEnabled,
  });

  useImperativeHandle(
    ref,
    () => ({
      undo,
      redo,
      clear,
      getStrokes,
      exportBase64: (maxWidth?: number) =>
        exportDrawing(getStrokes(), maxWidth),
      startStrokeAt,
      extendStrokeTo,
      endStroke,
    }),
    [undo, redo, clear, getStrokes, startStrokeAt, extendStrokeTo, endStroke]
  );

  return (
    <div className="relative w-full">
      {/* Amber offset slab — the logo's signature highlight, as a frame. */}
      <div
        aria-hidden
        className="absolute inset-0 translate-x-2 translate-y-2 rounded-2xl bg-nct-amber/85"
      />
      <div className="relative overflow-hidden rounded-2xl border border-nct-steel/40 bg-white shadow-[0_24px_60px_-30px_rgba(0,0,0,0.95)]">
        {showWebcamBackground && (
          // Mirrored to match the fingertip-mirroring applied to gesture
          // coordinates, so drawing lines up with what the user sees of
          // their own hand. Absolute + z-0 keeps it under the canvas
          // regardless of DOM order (positioned elements would otherwise
          // stack above the static-positioned canvas).
          <video
            ref={videoRef}
            playsInline
            muted
            aria-hidden
            className="absolute inset-0 z-0 h-full w-full -scale-x-100 object-cover"
          />
        )}
        <canvas
          ref={canvasRef}
          style={{ aspectRatio: CANVAS_ASPECT }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          aria-label="Drawing canvas"
          role="img"
          className={`nct-canvas relative z-10 block w-full ${
            disabled || !pointerInputEnabled ? 'pointer-events-none' : ''
          }`}
        />
        {children}
      </div>
    </div>
  );
});
