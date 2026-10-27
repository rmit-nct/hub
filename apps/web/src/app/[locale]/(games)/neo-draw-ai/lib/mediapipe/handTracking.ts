import {
  FilesetResolver,
  HandLandmarker,
  type HandLandmarkerResult,
} from '@mediapipe/tasks-vision';
import type { HandGesture, HandTrackingResult, Point } from '../../types';

/**
 * MediaPipe Tasks Vision wrapper: loads the HandLandmarker model and turns one
 * video frame into the two things the canvas needs — where the fingertip is,
 * and whether the "pen" is down.
 */

/**
 * Pinned to the version in package.json. The previous `@latest` here meant the
 * WASM runtime could be a different build from the JS API bundled by npm, which
 * fails at runtime with opaque errors as soon as MediaPipe cuts a release.
 * Keep this in sync when bumping @mediapipe/tasks-vision.
 */
const MEDIAPIPE_VERSION = '1.0.1';

const DEFAULT_WASM_PATH = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
const DEFAULT_MODEL_PATH =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

/**
 * Both assets can be self-hosted for offline demos or locked-down networks:
 * copy `node_modules/@mediapipe/tasks-vision/wasm` into `public/mediapipe/wasm`,
 * download the .task file into `public/mediapipe/`, then set
 *   NEXT_PUBLIC_MEDIAPIPE_WASM_PATH=/mediapipe/wasm
 *   NEXT_PUBLIC_HAND_MODEL_PATH=/mediapipe/hand_landmarker.task
 */
const WASM_PATH =
  process.env.NEXT_PUBLIC_MEDIAPIPE_WASM_PATH || DEFAULT_WASM_PATH;
const MODEL_PATH =
  process.env.NEXT_PUBLIC_HAND_MODEL_PATH || DEFAULT_MODEL_PATH;

let handLandmarker: HandLandmarker | null = null;
let loadPromise: Promise<HandLandmarker> | null = null;

export class HandModelLoadError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown
  ) {
    super(message);
    this.name = 'HandModelLoadError';
  }
}

/**
 * Loads the HandLandmarker once per page. Concurrent callers share one
 * in-flight promise instead of each kicking off a ~10MB download.
 */
export async function initHandLandmarker(): Promise<HandLandmarker> {
  if (handLandmarker) return handLandmarker;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    let vision: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>;
    try {
      vision = await FilesetResolver.forVisionTasks(WASM_PATH);
    } catch (err) {
      throw new HandModelLoadError(
        `Could not load the MediaPipe runtime from ${WASM_PATH}. Check your network connection, ad-blocker, or self-host the files (see NEXT_PUBLIC_MEDIAPIPE_WASM_PATH).`,
        err
      );
    }

    // GPU is much faster but is unavailable on some drivers, in some VMs, and
    // under hardware-acceleration-off browser settings — fall back to CPU
    // rather than dropping the user into an error state.
    for (const delegate of ['GPU', 'CPU'] as const) {
      try {
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_PATH, delegate },
          runningMode: 'VIDEO',
          numHands: 1,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
        return handLandmarker;
      } catch (err) {
        if (delegate === 'CPU') {
          throw new HandModelLoadError(
            `Could not load the hand-tracking model from ${MODEL_PATH}. Check your network connection or self-host it (see NEXT_PUBLIC_HAND_MODEL_PATH).`,
            err
          );
        }
      }
    }
    throw new HandModelLoadError('Hand landmarker could not be created.');
  })();

  try {
    return await loadPromise;
  } catch (err) {
    loadPromise = null; // allow a retry
    throw err;
  }
}

// Landmark indices per the MediaPipe hand model
const THUMB_TIP = 4;
const INDEX_FINGER_TIP = 8;
const WRIST = 0;
const MIDDLE_FINGER_MCP = 9;

// PIP (middle knuckle) and TIP per non-thumb finger, used to tell an
// extended finger from a curled one.
const INDEX_PIP = 6;
const MIDDLE_PIP = 10;
const MIDDLE_TIP = 12;
const RING_PIP = 14;
const RING_TIP = 16;
const PINKY_PIP = 18;
const PINKY_TIP = 20;
// Thumb's equivalent middle joint — it only has three segments (CMC/MCP/IP/TIP).
const THUMB_IP = 3;

/**
 * Pinch is measured relative to hand size, not in raw normalized units.
 * A fixed 0.06 threshold only worked at one particular distance from the
 * camera — hands further away could never pinch, close-up hands were always
 * pinching. Scaling by wrist-to-knuckle length makes it distance-invariant.
 */
const PINCH_ON_RATIO = 0.42; // pen down
const PINCH_OFF_RATIO = 0.58; // pen up — hysteresis stops flickering mid-stroke

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * A finger is "extended" when its tip sits farther from the wrist than its
 * own PIP joint — radial distance from the wrist, not screen-space y, so
 * this holds regardless of how the hand is rotated in frame. Curling a
 * finger folds the tip back toward the palm, pulling it closer to the wrist
 * than the PIP.
 */
function isExtended(wrist: Point, pip: Point, tip: Point): boolean {
  return distance(wrist, tip) > distance(wrist, pip) * 1.05;
}

/**
 * Classifies the whole hand shape from the four non-thumb fingers (thumb
 * moves too differently from the others to fit the same radial test, so it's
 * only consulted to tell a plain fist from a thumbs-up). Pinch always wins
 * over the shape read, since a pinch mid-gesture can momentarily look like a
 * fist or a peace sign.
 */
function classifyGesture(
  landmarks: { x: number; y: number }[],
  isPinching: boolean
): HandGesture {
  if (isPinching) return 'pinch';

  const wrist = landmarks[WRIST];
  const indexExt = isExtended(
    wrist,
    landmarks[INDEX_PIP],
    landmarks[INDEX_FINGER_TIP]
  );
  const middleExt = isExtended(
    wrist,
    landmarks[MIDDLE_PIP],
    landmarks[MIDDLE_TIP]
  );
  const ringExt = isExtended(wrist, landmarks[RING_PIP], landmarks[RING_TIP]);
  const pinkyExt = isExtended(
    wrist,
    landmarks[PINKY_PIP],
    landmarks[PINKY_TIP]
  );

  if (indexExt && middleExt && ringExt && pinkyExt) return 'openPalm';
  if (!indexExt && !middleExt && !ringExt && !pinkyExt) {
    const thumbExt = isExtended(
      wrist,
      landmarks[THUMB_IP],
      landmarks[THUMB_TIP]
    );
    return thumbExt ? 'thumbsUp' : 'fist';
  }
  if (indexExt && middleExt && !ringExt && !pinkyExt) return 'peace';
  if (indexExt && !middleExt && !ringExt && !pinkyExt) return 'point';
  return 'none';
}

let wasPinching = false;

/**
 * Run detection on a single video frame.
 * `timestampMs` must increase monotonically or MediaPipe throws.
 */
export function detectHand(
  landmarker: HandLandmarker,
  video: HTMLVideoElement,
  timestampMs: number
): HandTrackingResult {
  let result: HandLandmarkerResult;
  try {
    result = landmarker.detectForVideo(video, timestampMs);
  } catch {
    // A dropped/duplicate frame shouldn't kill the render loop.
    return {
      indexFingerTip: null,
      isPinching: false,
      handedness: null,
      pinchStrength: 0,
      gesture: 'none',
    };
  }

  if (!result.landmarks || result.landmarks.length === 0) {
    wasPinching = false;
    return {
      indexFingerTip: null,
      isPinching: false,
      handedness: null,
      pinchStrength: 0,
      gesture: 'none',
    };
  }

  const landmarks = result.landmarks[0];
  const indexTip = landmarks[INDEX_FINGER_TIP];
  const thumbTip = landmarks[THUMB_TIP];
  const wrist = landmarks[WRIST];
  const middleMcp = landmarks[MIDDLE_FINGER_MCP];

  if (!indexTip || !thumbTip || !wrist || !middleMcp) {
    return {
      indexFingerTip: null,
      isPinching: false,
      handedness: null,
      pinchStrength: 0,
      gesture: 'none',
    };
  }

  const handSize = Math.max(distance(wrist, middleMcp), 1e-4);
  const ratio = distance(indexTip, thumbTip) / handSize;

  const isPinching = wasPinching
    ? ratio < PINCH_OFF_RATIO
    : ratio < PINCH_ON_RATIO;
  wasPinching = isPinching;

  const handedness =
    (result.handedness?.[0]?.[0]?.categoryName as
      | 'Left'
      | 'Right'
      | undefined) ?? null;

  return {
    // normalized 0-1; the caller mirrors and scales into canvas space
    indexFingerTip: { x: indexTip.x, y: indexTip.y },
    isPinching,
    handedness,
    pinchStrength: Math.max(0, Math.min(1, 1 - ratio / PINCH_OFF_RATIO)),
    gesture: classifyGesture(landmarks, isPinching),
  };
}

export function resetPinchState() {
  wasPinching = false;
}

export function closeHandLandmarker() {
  handLandmarker?.close();
  handLandmarker = null;
  loadPromise = null;
  wasPinching = false;
}
