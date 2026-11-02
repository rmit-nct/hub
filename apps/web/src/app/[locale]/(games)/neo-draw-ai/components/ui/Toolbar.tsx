'use client';

import {
  type LucideIcon,
  Mouse,
  Redo2,
  Trash2,
  Undo2,
  Video,
} from '@ncthub/ui/icons';
import type { InputMode } from '../../types';

export const BRUSH_COLORS = [
  { name: 'NCT Navy', value: '#1F2844' },
  { name: 'NCT Steel', value: '#5095AA' },
  { name: 'NCT Amber', value: '#F8B73A' },
  { name: 'Coral', value: '#E5645F' },
  { name: 'Mint', value: '#4EC9A5' },
] as const;

export const BRUSH_SIZES = [
  { label: 'Fine', value: 3 },
  { label: 'Medium', value: 6 },
  { label: 'Bold', value: 12 },
  { label: 'Marker', value: 22 },
] as const;

const INPUT_MODES: Array<{
  mode: InputMode;
  label: string;
  hint: string;
  icon: LucideIcon;
}> = [
  {
    mode: 'mouse',
    label: 'Mouse',
    hint: 'Draw by clicking and dragging',
    icon: Mouse,
  },
  {
    mode: 'webcam',
    label: 'Webcam',
    hint: 'Pinch your thumb and index finger to draw in the air',
    icon: Video,
  },
];

interface ToolbarProps {
  inputMode: InputMode;
  onInputModeChange: (mode: InputMode) => void;
  color: string;
  onColorChange: (color: string) => void;
  lineWidth: number;
  onLineWidthChange: (width: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  canUndo: boolean;
  canRedo: boolean;
  disabled?: boolean;
}

const baseButton =
  'nct-focus flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-35';

export function Toolbar({
  inputMode,
  onInputModeChange,
  color,
  onColorChange,
  lineWidth,
  onLineWidthChange,
  onUndo,
  onRedo,
  onClear,
  canUndo,
  canRedo,
  disabled = false,
}: ToolbarProps) {
  return (
    <aside
      aria-label="Drawing tools"
      className="nct-panel flex w-full flex-col gap-5 p-4 lg:w-80 lg:shrink-0"
    >
      <h2 className="nct-label">Tools</h2>

      {/* Input mode */}
      <div className="flex flex-col gap-1.5">
        <span className="nct-label">Input</span>
        <div
          role="radiogroup"
          aria-label="Input mode"
          className="flex gap-1 rounded-xl bg-nct-900/60 p-1"
        >
          {INPUT_MODES.map(({ mode, label, hint, icon: Icon }) => (
            // biome-ignore lint/a11y/useSemanticElements: segmented control of role="radio" buttons, not form inputs
            <button
              type="button"
              key={mode}
              role="radio"
              aria-checked={inputMode === mode}
              title={hint}
              onClick={() => onInputModeChange(mode)}
              className={`${baseButton} flex-1 ${
                inputMode === mode
                  ? 'bg-nct-amber text-nct-900 shadow-[0_2px_12px_-2px_rgba(248,183,58,0.7)]'
                  : 'text-nct-muted hover:bg-nct-700/70 hover:text-nct-ink'
              }`}
            >
              <Icon size={16} strokeWidth={2.5} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Colour */}
      <div className="flex flex-col gap-1.5">
        <span className="nct-label">Colour</span>
        <div className="flex items-center gap-2">
          {BRUSH_COLORS.map((c) => (
            <button
              type="button"
              key={c.value}
              onClick={() => onColorChange(c.value)}
              aria-label={c.name}
              aria-pressed={color === c.value}
              title={c.name}
              className={`nct-focus h-7 w-7 rounded-full border-2 transition ${
                color === c.value
                  ? 'scale-110 border-nct-ink'
                  : 'border-nct-600 hover:scale-105 hover:border-nct-steel'
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
      </div>

      {/* Brush size */}
      <div className="flex flex-col gap-1.5">
        <span className="nct-label">Brush</span>
        <div className="flex gap-1 rounded-xl bg-nct-900/60 p-1">
          {BRUSH_SIZES.map((s) => (
            <button
              type="button"
              key={s.value}
              onClick={() => onLineWidthChange(s.value)}
              aria-pressed={lineWidth === s.value}
              title={`${s.label} (${s.value}px)`}
              className={`nct-focus grid h-9 flex-1 place-items-center rounded-lg transition ${
                lineWidth === s.value
                  ? 'bg-nct-steel/30 ring-1 ring-nct-steel'
                  : 'hover:bg-nct-700/70'
              }`}
            >
              <span
                className="block rounded-full"
                style={{
                  width: Math.min(s.value, 16),
                  height: Math.min(s.value, 16),
                  backgroundColor: lineWidth === s.value ? color : '#9FB3C8',
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1.5">
        <span className="nct-label">Canvas</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onUndo}
            disabled={disabled || !canUndo}
            className={`${baseButton} flex-1 bg-nct-700 text-nct-ink hover:bg-nct-600`}
          >
            <Undo2 size={16} strokeWidth={2.5} aria-hidden="true" />
            Undo
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={disabled || !canRedo}
            className={`${baseButton} flex-1 bg-nct-700 text-nct-ink hover:bg-nct-600`}
          >
            <Redo2 size={16} strokeWidth={2.5} aria-hidden="true" />
            Redo
          </button>
        </div>
        <button
          type="button"
          onClick={onClear}
          disabled={disabled || !canUndo}
          className={`${baseButton} w-full border border-nct-danger/50 bg-nct-danger/15 text-nct-danger hover:bg-nct-danger/25`}
        >
          <Trash2 size={16} strokeWidth={2.5} aria-hidden="true" />
          Clear
        </button>
      </div>
    </aside>
  );
}
