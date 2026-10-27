'use client';

import type { HandLandmarker } from '@mediapipe/tasks-vision';
import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  detectHand,
  initHandLandmarker,
  resetPinchState,
} from '../lib/mediapipe/handTracking';
import type { HandTrackingResult, WebcamStatus } from '../types';

interface UseHandTrackingOptions {
  enabled: boolean;
  onResult?: (result: HandTrackingResult) => void;
  /**
   * Video element to stream into. Pass one in when something else (e.g. the
   * canvas's webcam-background layer) also needs to render this exact
   * stream — sharing the element avoids a second getUserMedia() call.
   * Falls back to an internally-owned element when omitted.
   */
  videoRef?: RefObject<HTMLVideoElement | null>;
}

/**
 * Starts the webcam and runs MediaPipe hand-landmark detection each animation
 * frame while `enabled` is true.
 *
 * Fixes over the first version:
 *  - Camera errors and model-download errors are reported separately. Before,
 *    a failed CDN fetch surfaced as "Failed to start webcam", which sent you
 *    hunting for a camera-permission problem that didn't exist.
 *  - The camera stream is stopped on *every* exit path, including failures.
 *    Previously a mid-init error left the camera light on.
 *  - `onResult` lives in a ref, so an inline callback from the caller no longer
 *    tears down and restarts the whole webcam pipeline on every render.
 *  - Frames are only fed to the model when the video timestamp actually moved.
 */
export function useHandTracking({
  enabled,
  onResult,
  videoRef: externalVideoRef,
}: UseHandTrackingOptions) {
  const internalVideoRef = useRef<HTMLVideoElement | null>(null);
  const videoRef = externalVideoRef ?? internalVideoRef;
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafId = useRef<number | null>(null);
  const lastVideoTime = useRef(-1);
  const lastTimestamp = useRef(0);

  const [rawStatus, setStatus] = useState<WebcamStatus>('idle');
  const [rawError, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  /** True when the camera itself is fine and only the model download failed. */
  const [cameraLive, setCameraLive] = useState(false);

  // Derived rather than assigned in an effect: when the hook is disabled it is
  // simply "idle", no state write (and no extra render pass) required.
  const status: WebcamStatus = enabled ? rawStatus : 'idle';
  const error = enabled ? rawError : null;

  /** Re-run camera + model setup; useful when a CDN fetch failed transiently. */
  const retry = useCallback(() => setAttempt((a) => a + 1), []);

  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: deps intentionally narrowed, see comment in the hook body
  const stopCamera = useCallback(() => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    for (const track of streamRef.current?.getTracks() ?? []) track.stop();
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    lastVideoTime.current = -1;
    resetPinchState();
    // videoRef is either the caller's own useRef() (stable identity) or our
    // internal one — either way it never changes across renders.
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: deps intentionally narrowed, see comment in the hook body
  useEffect(() => {
    if (!enabled) {
      stopCamera();
      return;
    }

    let cancelled = false;

    const loop = () => {
      const video = videoRef.current;
      const landmarker = landmarkerRef.current;
      if (cancelled || !video || !landmarker) return;

      // HAVE_CURRENT_DATA and a frame we haven't already processed. Feeding the
      // same frame twice wastes a full inference pass per animation frame.
      if (
        video.readyState >= 2 &&
        video.currentTime !== lastVideoTime.current
      ) {
        lastVideoTime.current = video.currentTime;
        // detectForVideo requires strictly increasing timestamps.
        const ts = Math.max(performance.now(), lastTimestamp.current + 1);
        lastTimestamp.current = ts;
        onResultRef.current?.(detectHand(landmarker, video, ts));
      }
      rafId.current = requestAnimationFrame(loop);
    };

    (async () => {
      try {
        setError(null);
        setStatus('requesting-camera');

        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error(
            'This browser has no camera API. Camera access also requires https:// (or localhost).'
          );
        }

        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: 'user',
            },
            audio: false,
          });
        } catch (err) {
          const name = err instanceof DOMException ? err.name : '';
          const message =
            name === 'NotAllowedError'
              ? 'Camera permission was denied. Allow camera access in your browser, then switch back to Webcam mode.'
              : name === 'NotFoundError'
                ? 'No camera was found on this device. Use Mouse or Touch mode instead.'
                : name === 'NotReadableError'
                  ? 'The camera is already in use by another app. Close it and try again.'
                  : `Could not start the camera: ${err instanceof Error ? err.message : String(err)}`;
          throw new Error(message);
        }

        if (cancelled) {
          for (const t of stream.getTracks()) t.stop();
          return;
        }
        streamRef.current = stream;

        const video = videoRef.current;
        if (!video) throw new Error('Video element is not mounted yet.');
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;
        await video.play();

        if (cancelled) return;
        setCameraLive(true);
        setStatus('loading-model');
        landmarkerRef.current = await initHandLandmarker();
        if (cancelled) return;

        setStatus('ready');
        rafId.current = requestAnimationFrame(loop);
      } catch (err) {
        if (cancelled) return;
        // If the camera came up and only the model download failed, keep the
        // preview alive: the user can see themselves, and Retry usually fixes
        // a transient CDN failure without re-prompting for permission.
        if (streamRef.current) {
          if (rafId.current !== null) {
            cancelAnimationFrame(rafId.current);
            rafId.current = null;
          }
        } else {
          stopCamera();
          setCameraLive(false);
        }
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Webcam setup failed.');
      }
    })();

    return () => {
      cancelled = true;
      stopCamera();
      setCameraLive(false);
    };
    // videoRef is stable across renders (see stopCamera above).
  }, [enabled, attempt, stopCamera]);

  return { videoRef, status, error, retry, cameraLive };
}
