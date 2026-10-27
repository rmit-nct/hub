import type { AIGuessResponse, AIMode, Stroke } from '../../types';
import { exportDrawing } from '../canvas/drawing';
import { getMockGuess } from './mockGuesser';

/**
 * One entry point for "guess this drawing", so the page never has to know
 * whether the answer came from Gemini or from the mock system.
 *
 * The old code chose between them with a hard-coded `USE_MOCK_AI = true`
 * constant, which meant the real path could only be exercised by editing
 * source. Now the client asks the server once whether a key is configured, and
 * a failed Gemini call degrades to the mock instead of breaking the round.
 */

/** Ask the server whether GEMINI_API_KEY is configured. */
export async function fetchAICapability(): Promise<{
  configured: boolean;
  model: string;
}> {
  try {
    const res = await fetch('/api/neo-draw-ai/guess', { method: 'GET' });
    if (!res.ok) return { configured: false, model: 'unavailable' };
    const data = (await res.json()) as { configured?: boolean; model?: string };
    return {
      configured: Boolean(data.configured),
      model: data.model ?? 'unknown',
    };
  } catch {
    return { configured: false, model: 'unavailable' };
  }
}

interface RequestGuessOptions {
  mode: AIMode;
  strokes: Stroke[];
  prompt: string | null;
  signal?: AbortSignal;
}

export async function requestGuess({
  mode,
  strokes,
  prompt,
  signal,
}: RequestGuessOptions): Promise<AIGuessResponse> {
  if (strokes.length === 0) {
    return {
      guesses: [],
      isMock: mode === 'mock',
      error: 'Draw something first.',
    };
  }

  if (mode === 'mock') {
    return getMockGuess({ prompt, strokeCount: strokes.length });
  }

  // Downscaled: 512px is plenty for a line drawing and keeps the upload small.
  const imageBase64 = exportDrawing(strokes, 512);
  if (!imageBase64) {
    return {
      guesses: [],
      isMock: false,
      error: 'Could not export the drawing.',
    };
  }

  try {
    const res = await fetch('/api/neo-draw-ai/guess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, prompt }),
      signal,
    });

    // Parse defensively: a proxy or a crash can return HTML instead of JSON.
    let data: Partial<AIGuessResponse> | null = null;
    try {
      data = (await res.json()) as Partial<AIGuessResponse>;
    } catch {
      data = null;
    }

    if (!res.ok || !data) {
      const message = data?.error ?? `AI request failed (HTTP ${res.status}).`;
      // Falling back keeps the round playable; the panel still says it's a mock.
      const fallback = await getMockGuess({
        prompt,
        strokeCount: strokes.length,
      });
      return {
        ...fallback,
        error: `${message} Showing mock predictions instead.`,
      };
    }

    return {
      guesses: Array.isArray(data.guesses) ? data.guesses : [],
      isMock: Boolean(data.isMock),
      error: data.error,
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    const fallback = await getMockGuess({
      prompt,
      strokeCount: strokes.length,
    });
    return {
      ...fallback,
      error: `Could not reach the AI endpoint (${
        err instanceof Error ? err.message : String(err)
      }). Showing mock predictions instead.`,
    };
  }
}
