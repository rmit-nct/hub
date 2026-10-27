import { google } from '@ai-sdk/google';
import { APICallError, generateText, Output, RetryError } from 'ai';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { type AIGuessResult, normalizeGuesses } from '../normalize-guesses';

/**
 * NEO DrawAI guessing endpoint (public game, rate-limited per IP by the proxy).
 *
 *   GET  -> { configured: boolean, model: string }
 *   POST -> { guesses, isMock: false, error? }   Body: { imageBase64, prompt? }
 *
 * Every failure still returns a well-formed body with `guesses: []`, which the
 * client turns into a mock-guess fallback instead of a broken round.
 */

// Flash-Lite: a rough doodle needs speed, not deliberation. 2.5-flash-lite 404s
// for newly created keys, so 3.5 is the floor.
const MODEL_NAME = 'gemini-3.5-flash-lite';
// A round is 30s and scoring waits on this call, so fail fast.
const REQUEST_TIMEOUT_MS = 8_000;
// Just under the proxy guard's 200KB body cap; a 512px line drawing is far smaller.
const MAX_IMAGE_BASE64_LENGTH = 190 * 1024;

const guessSchema = z.object({
  guesses: z.array(
    z.object({
      label: z.string().describe('A single common noun, e.g. "cat".'),
      confidence: z.number().describe('Between 0 and 1.'),
    })
  ),
});

const INSTRUCTION = [
  'You are the guesser in a Pictionary-style game.',
  'The image is a rough black-on-white doodle drawn in a few seconds with a mouse or a finger in the air.',
  'Guess what the player is drawing. Be decisive and use single common nouns.',
  'Do not assume any particular answer; judge only from the drawing.',
  'Give up to 3 guesses, most likely first, confidence between 0 and 1.',
  'If the canvas is essentially empty, return an empty guesses array.',
].join(' ');

interface GuessResponseBody {
  guesses: AIGuessResult[];
  isMock: false;
  error?: string;
}

function fail(error: string, status: number) {
  const body: GuessResponseBody = { guesses: [], isMock: false, error };
  return NextResponse.json(body, { status });
}

export async function GET() {
  return NextResponse.json({
    configured: Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY),
    model: MODEL_NAME,
  });
}

export async function POST(req: Request) {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    // 503: the server is fine, the feature just isn't configured.
    return fail('The AI guesser is not configured on this server.', 503);
  }

  let imageBase64: unknown;
  try {
    ({ imageBase64 } = await req.json());
  } catch {
    return fail('Request body must be valid JSON.', 400);
  }

  if (typeof imageBase64 !== 'string' || imageBase64.length === 0) {
    return fail('imageBase64 is required.', 400);
  }
  if (imageBase64.length > MAX_IMAGE_BASE64_LENGTH) {
    return fail('Drawing image is too large.', 413);
  }

  // Live guessing aborts the previous fetch on every new stroke; stop paying
  // for an answer nobody is waiting for.
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const abortSignal = AbortSignal.any([req.signal, timeout]);

  try {
    const { output } = await generateText({
      model: google(MODEL_NAME),
      output: Output.object({ schema: guessSchema }),
      temperature: 0.2,
      // Retries would blow the deadline and burn quota on 429s.
      maxRetries: 0,
      abortSignal,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: INSTRUCTION },
            { type: 'image', image: imageBase64, mediaType: 'image/png' },
          ],
        },
      ],
    });

    const guesses = normalizeGuesses(output.guesses);
    if (guesses.length === 0) {
      return NextResponse.json({
        guesses: [],
        isMock: false,
        error:
          'The model could not make out the drawing. Add a few more strokes and try again.',
      } satisfies GuessResponseBody);
    }

    return NextResponse.json({
      guesses,
      isMock: false,
    } satisfies GuessResponseBody);
  } catch (err) {
    if (req.signal.aborted) {
      return fail('Guess cancelled by a newer request.', 499);
    }
    if (timeout.aborted) {
      return fail('The AI took too long to respond. Try again.', 504);
    }

    console.error('[neo-draw-ai] Gemini guess error:', err);

    const cause = RetryError.isInstance(err) ? err.lastError : err;
    // Classify on the HTTP status, never on message text: every SDK message
    // embeds ".../models/<name>:generateContent", which contains "rate".
    const status = APICallError.isInstance(cause)
      ? cause.statusCode
      : undefined;

    if (status === 404) {
      return fail(
        `Gemini has no model named "${MODEL_NAME}" available to this API key.`,
        502
      );
    }
    if (
      status === 401 ||
      status === 403 ||
      // Gemini reports an invalid key as a 400.
      (status === 400 && /api[_ ]?key/i.test(String(cause)))
    ) {
      return fail('Gemini rejected the API key.', 502);
    }
    if (status === 429) {
      return fail(
        'Gemini quota or rate limit reached. Try again shortly.',
        429
      );
    }
    if (status !== undefined && status >= 500) {
      return fail(
        'Gemini is temporarily unavailable. Try again in a moment.',
        502
      );
    }

    return fail('The AI could not guess this drawing.', 502);
  }
}
