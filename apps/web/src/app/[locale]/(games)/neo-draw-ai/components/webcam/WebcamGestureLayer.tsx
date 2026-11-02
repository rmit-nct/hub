'use client';

import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useHandTracking } from '../../hooks/useHandTracking';
import { normalizedToLogical } from '../../lib/canvas/drawing';
import type { HandTrackingResult, Point } from '../../types';
import type { DrawingCanvasHandle } from '../canvas/DrawingCanvas';

interface WebcamGestureLayerProps {
  enabled: boolean;
  canvasHandle: React.RefObject<DrawingCanvasHandle | null>;
  /** Reports the fingertip in logical canvas space so the page can draw a cursor. */
  onCursorChange?: (cursor: (Point & { pinching: boolean }) | null) => void;
  paused?: boolean;
  /** Shared with the canvas's webcam-background layer — one stream, rendered in two places. */
  videoRef?: RefObject<HTMLVideoElement | null>;
  /** Hold a fist to fire. */
  onUndo?: () => void;
  /** Hold an open palm to fire. */
  onClear?: () => void;
  /** Hold a peace sign to fire. */
  onCycleColor?: () => void;
  /** Hold a thumbs up to fire. */
  onCycleBrushSize?: () => void;
  /** Hold a pointing finger to fire. */
  onGuessNow?: () => void;
}

/** The static shapes that act as one-shot, hold-to-fire commands. */
type HeldGesture =
  | 'none'
  | 'fist'
  | 'openPalm'
  | 'peace'
  | 'thumbsUp'
  | 'point';

/** How long a shape must be held, stationary, before it fires. */
const GESTURE_HOLD_MS = 550;

export const GESTURE_EMOJI: Record<
  'pinch' | Exclude<HeldGesture, 'none'>,
  string
> = {
  pinch: '🤏',
  fist: '✊',
  openPalm: '✋',
  peace: '✌️',
  thumbsUp: '👍',
  point: '👉',
};

const GESTURE_HINT: Record<Exclude<HeldGesture, 'none'>, string> = {
  fist: 'a fist — undoing',
  openPalm: 'an open palm — clearing',
  peace: 'a peace sign — changing colour',
  thumbsUp: 'a thumbs up — changing brush size',
  point: 'a pointing finger — guessing now',
};

/**
 * Webcam gesture input.
 *
 * "Pen down" is a pinch (thumb + index finger together); moving the pinched
 * hand draws; releasing lifts the pen. It routes through the same
 * startStrokeAt / extendStrokeTo / endStroke calls as mouse and touch, so
 * drawing behaviour never diverges by input source.
 *
 * The <video> is now visible (mirrored, like a selfie camera) instead of
 * `display:none`. Beyond being what users expect — you need to see your hand to
 * aim it — browsers are entitled to throttle or skip frame delivery for a
 * display:none video, which starved the detector of frames.
 */
export function WebcamGestureLayer({
  enabled,
  canvasHandle,
  onCursorChange,
  paused = false,
  videoRef,
  onUndo,
  onClear,
  onCycleColor,
  onCycleBrushSize,
  onGuessNow,
}: WebcamGestureLayerProps) {
  const wasPinching = useRef(false);
  const pausedRef = useRef(paused);
  const onCursorChangeRef = useRef(onCursorChange);
  const onUndoRef = useRef(onUndo);
  const onClearRef = useRef(onClear);
  const onCycleColorRef = useRef(onCycleColor);
  const onCycleBrushSizeRef = useRef(onCycleBrushSize);
  const onGuessNowRef = useRef(onGuessNow);

  const [handVisible, setHandVisible] = useState(false);
  // Which held-shape command is currently being tracked, and any brief
  // "it fired" confirmation to show while it's still fresh.
  const [heldGesture, setHeldGesture] = useState<HeldGesture>('none');
  const [firedMessage, setFiredMessage] = useState<string | null>(null);

  // Not React state: the hold timer is read/written every single detection
  // frame (up to 60/s), and only the discrete transitions below need a render.
  const gestureRef = useRef<{
    gesture: HeldGesture;
    since: number;
    fired: boolean;
  }>({
    gesture: 'none',
    since: 0,
    fired: false,
  });
  const firedMessageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mirrored into refs in effects (not during render) so the detection callback
  // stays referentially stable and never restarts the webcam pipeline.
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    onCursorChangeRef.current = onCursorChange;
  }, [onCursorChange]);

  useEffect(() => {
    onUndoRef.current = onUndo;
  }, [onUndo]);

  useEffect(() => {
    onClearRef.current = onClear;
  }, [onClear]);

  useEffect(() => {
    onCycleColorRef.current = onCycleColor;
  }, [onCycleColor]);

  useEffect(() => {
    onCycleBrushSizeRef.current = onCycleBrushSize;
  }, [onCycleBrushSize]);

  useEffect(() => {
    onGuessNowRef.current = onGuessNow;
  }, [onGuessNow]);

  const flashFired = useCallback((message: string) => {
    setFiredMessage(message);
    if (firedMessageTimer.current) clearTimeout(firedMessageTimer.current);
    firedMessageTimer.current = setTimeout(() => setFiredMessage(null), 900);
  }, []);

  useEffect(() => {
    return () => {
      if (firedMessageTimer.current) clearTimeout(firedMessageTimer.current);
    };
  }, []);

  const handleResult = useCallback(
    (result: HandTrackingResult) => {
      const handle = canvasHandle.current;

      // Hand left the frame (or the round ended): finish the stroke cleanly
      // rather than leaving the pen stuck down.
      if (!handle || !result.indexFingerTip || pausedRef.current) {
        if (wasPinching.current) handle?.endStroke();
        wasPinching.current = false;
        setHandVisible(false);
        onCursorChangeRef.current?.(null);
        if (gestureRef.current.gesture !== 'none') {
          gestureRef.current = { gesture: 'none', since: 0, fired: false };
          setHeldGesture('none');
        }
        return;
      }

      setHandVisible(true);

      // MediaPipe returns normalised coords from a non-mirrored frame; mirror x
      // so moving your hand right moves the pen right.
      const point = normalizedToLogical(
        result.indexFingerTip.x,
        result.indexFingerTip.y,
        true
      );
      onCursorChangeRef.current?.({ ...point, pinching: result.isPinching });

      if (result.isPinching && !wasPinching.current) {
        handle.startStrokeAt(point);
      } else if (result.isPinching && wasPinching.current) {
        handle.extendStrokeTo(point);
      } else if (!result.isPinching && wasPinching.current) {
        handle.endStroke();
      }

      wasPinching.current = result.isPinching;

      // Static-shape commands: fist/open-palm/peace/thumbs-up/point fire once
      // after being held steady for GESTURE_HOLD_MS, then require the hand to
      // change shape again before they can re-fire — so holding a fist
      // doesn't undo the whole drawing in one go.
      const shape: HeldGesture =
        result.gesture === 'fist' ||
        result.gesture === 'openPalm' ||
        result.gesture === 'peace' ||
        result.gesture === 'thumbsUp' ||
        result.gesture === 'point'
          ? result.gesture
          : 'none';

      const tracked = gestureRef.current;
      if (shape !== tracked.gesture) {
        gestureRef.current = {
          gesture: shape,
          since: performance.now(),
          fired: false,
        };
        setHeldGesture(shape);
      } else if (
        shape !== 'none' &&
        !tracked.fired &&
        performance.now() - tracked.since >= GESTURE_HOLD_MS
      ) {
        tracked.fired = true;
        if (shape === 'fist') {
          onUndoRef.current?.();
          flashFired('Undid last stroke');
        } else if (shape === 'openPalm') {
          onClearRef.current?.();
          flashFired('Canvas cleared');
        } else if (shape === 'peace') {
          onCycleColorRef.current?.();
          flashFired('Colour changed');
        } else if (shape === 'thumbsUp') {
          onCycleBrushSizeRef.current?.();
          flashFired('Brush size changed');
        } else if (shape === 'point') {
          onGuessNowRef.current?.();
          flashFired('Guessing now');
        }
      }
    },
    [canvasHandle, flashFired]
  );

  const { status, error, retry } = useHandTracking({
    enabled,
    onResult: handleResult,
    videoRef,
  });

  const statusText: Record<typeof status, string> = {
    idle: 'Webcam off',
    'requesting-camera': 'Waiting for camera permission…',
    'loading-model': 'Loading the hand-tracking model…',
    ready: handVisible
      ? 'Hand detected — pinch to draw'
      : 'Show your hand to the camera',
    error: 'Webcam unavailable',
  };

  const dotColor =
    status === 'ready'
      ? handVisible
        ? 'bg-nct-success'
        : 'bg-nct-amber'
      : status === 'error'
        ? 'bg-nct-danger'
        : 'bg-nct-steel';

  return (
    <section
      className="nct-panel overflow-hidden"
      aria-label="Webcam gesture input"
    >
      <header className="flex items-center gap-2 border-nct-steel/20 border-b px-3 py-2">
        <span
          className={`h-2 w-2 rounded-full ${dotColor} ${status === 'ready' && handVisible ? 'nct-pulse' : ''}`}
        />
        <span className="nct-label !text-nct-steel-light">Webcam</span>
        <span className="ml-auto truncate text-[0.7rem] text-nct-muted">
          {statusText[status]}
        </span>
      </header>

      {/* The live feed itself now renders behind the drawing canvas (see
          DrawingCanvas's showWebcamBackground layer), sharing this same
          videoRef/stream — this panel only surfaces status and errors. */}
      <div className="relative w-full bg-nct-900 p-4">
        {status !== 'ready' ? (
          status === 'error' ? (
            <div className="space-y-2">
              <p className="hyphens-auto break-words text-[0.7rem] text-nct-danger leading-relaxed">
                {error}
              </p>
              <button
                type="button"
                onClick={retry}
                className="nct-focus rounded-lg bg-nct-steel px-3 py-1.5 font-bold text-nct-900 text-xs transition hover:bg-nct-steel-light"
              >
                Retry
              </button>
            </div>
          ) : (
            <p className="text-nct-muted text-xs">{statusText[status]}</p>
          )
        ) : firedMessage ? (
          <p className="font-bold text-[0.7rem] text-nct-success">
            {firedMessage}
          </p>
        ) : heldGesture !== 'none' ? (
          <p className="text-[0.7rem] text-nct-ink/90 leading-snug">
            Holding{' '}
            <span className="font-bold text-nct-amber">
              {GESTURE_EMOJI[heldGesture]} {GESTURE_HINT[heldGesture]}
            </span>
            … keep still.
          </p>
        ) : (
          <p className="text-[0.7rem] text-nct-ink/90 leading-snug">
            <span className="font-bold text-nct-amber">
              {GESTURE_EMOJI.pinch} Pinch
            </span>{' '}
            to draw ·{' '}
            <span className="font-bold text-nct-amber">
              {GESTURE_EMOJI.fist} fist
            </span>{' '}
            held to undo ·{' '}
            <span className="font-bold text-nct-amber">
              {GESTURE_EMOJI.openPalm} open palm
            </span>{' '}
            held to clear ·{' '}
            <span className="font-bold text-nct-amber">
              {GESTURE_EMOJI.peace} peace sign
            </span>{' '}
            held to change colour ·{' '}
            <span className="font-bold text-nct-amber">
              {GESTURE_EMOJI.thumbsUp} thumbs up
            </span>{' '}
            held to change brush size ·{' '}
            <span className="font-bold text-nct-amber">
              {GESTURE_EMOJI.point} pointing finger
            </span>{' '}
            held to guess now. Look at the canvas — that&apos;s your camera.
          </p>
        )}
      </div>
    </section>
  );
}
