'use client';

import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../../lib/canvas/drawing';
import type { StrokeBounds } from '../../types';

interface AIConvincedCardProps {
  snapshot: string;
  confidence: number;
  label: string;
  /**
   * Bounding box (logical canvas coords) of the strokes added just before
   * this guess. Highlighted on the thumbnail as a best-effort answer to
   * "where did the AI look" — neither Gemini nor the mock guesser expose
   * real attention data, so this is what changed in the drawing right
   * before the confident guess, not a literal model explanation.
   */
  bounds?: StrokeBounds | null;
}

// Logical-px breathing room around the highlighted strokes so the box reads
// as "this area", not a tight, illegible outline hugging thin lines.
const HIGHLIGHT_PADDING = 28;

/** Callout for the single snapshot that pushed the AI's confidence highest. */
export function AIConvincedCard({
  snapshot,
  confidence,
  label,
  bounds = null,
}: AIConvincedCardProps) {
  const highlightRect = bounds
    ? (() => {
        const x = Math.max(0, bounds.x - HIGHLIGHT_PADDING);
        const y = Math.max(0, bounds.y - HIGHLIGHT_PADDING);
        const width = Math.min(
          LOGICAL_WIDTH - x,
          bounds.width + HIGHLIGHT_PADDING * 2
        );
        const height = Math.min(
          LOGICAL_HEIGHT - y,
          bounds.height + HIGHLIGHT_PADDING * 2
        );
        return {
          left: `${(x / LOGICAL_WIDTH) * 100}%`,
          top: `${(y / LOGICAL_HEIGHT) * 100}%`,
          width: `${(width / LOGICAL_WIDTH) * 100}%`,
          height: `${(height / LOGICAL_HEIGHT) * 100}%`,
        };
      })()
    : null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-nct-success/40 bg-nct-success/10 p-3 text-left">
      {/* aspect-[4/3] matches LOGICAL_WIDTH/HEIGHT exactly so object-contain
          never letterboxes — otherwise the % overlay below would drift off
          the actual strokes. */}
      <div className="relative w-28 shrink-0 overflow-hidden rounded-lg border border-nct-success/40 bg-white">
        {/* biome-ignore lint/performance/noImgElement: data: URI snapshot, not an optimizable asset */}
        <img
          src={`data:image/png;base64,${snapshot}`}
          alt={`The drawing that convinced the AI it was ${label}`}
          className="aspect-[4/3] w-full object-contain"
        />
        {highlightRect && (
          <span
            className="absolute rounded-sm border-2 border-nct-amber shadow-[0_0_0_9999px_rgba(11,17,32,0.45)]"
            style={highlightRect}
            title="The strokes added right before this guess"
          />
        )}
      </div>
      <div>
        <p className="nct-label text-nct-success">
          The drawing that convinced it
        </p>
        <p className="mt-0.5">
          <span className="font-black text-2xl text-nct-success">
            {Math.round(confidence * 100)}%
          </span>{' '}
          <span className="text-nct-muted text-xs">
            sure it was{' '}
            <span className="font-bold text-nct-ink capitalize">{label}</span>
          </span>
        </p>
        {highlightRect && (
          <p className="mt-1 text-[0.65rem] text-nct-muted">
            Amber box: the strokes it had just added before this guess.
          </p>
        )}
      </div>
    </div>
  );
}
