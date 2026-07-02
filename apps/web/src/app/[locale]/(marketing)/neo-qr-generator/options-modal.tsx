'use client';

import { Button } from '@ncthub/ui/button';
import { Dropzone, DropzoneEmptyState } from '@ncthub/ui/dropzone';
import { Label } from '@ncthub/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ncthub/ui/select';
import { useEffect, useRef } from 'react';
import type { FrameStyle, QrDotShape, QrDownloadFormat } from './qr-utils';

// Options Modal Component
interface OptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dotShape: QrDotShape;
  setDotShape: (shape: QrDotShape) => void;
  downloadName: string;
  setDownloadName: (name: string) => void;
  downloadFormat: QrDownloadFormat;
  setDownloadFormat: (format: QrDownloadFormat) => void;
  logoDataUrl: string;
  setLogoDataUrl: (url: string) => void;
  logoSize: number;
  setLogoSize: (size: number) => void;
  onDropLogo: (files: File[]) => void;
  frameStyle: FrameStyle;
  setFrameStyle: (style: FrameStyle) => void;
  frameText: string;
  setFrameText: (text: string) => void;
}

export function OptionsModal({
  isOpen,
  onClose,
  dotShape,
  setDotShape,
  downloadName,
  setDownloadName,
  downloadFormat,
  setDownloadFormat,
  logoDataUrl,
  setLogoDataUrl,
  logoSize,
  setLogoSize,
  onDropLogo,
  frameStyle,
  setFrameStyle,
  frameText,
  setFrameText,
}: OptionsModalProps) {
  const initialStateRef = useRef<{
    dotShape: QrDotShape;
    downloadName: string;
    downloadFormat: QrDownloadFormat;
    logoDataUrl: string;
    logoSize: number;
    frameStyle: FrameStyle;
    frameText: string;
  } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      initialStateRef.current = null;
      return;
    }

    if (initialStateRef.current === null) {
      initialStateRef.current = {
        dotShape,
        downloadName,
        downloadFormat,
        logoDataUrl,
        logoSize,
        frameStyle,
        frameText,
      };
    }
  }, [
    dotShape,
    downloadFormat,
    downloadName,
    isOpen,
    logoDataUrl,
    logoSize,
    frameStyle,
    frameText,
  ]);

  if (!isOpen) return null;

  const handleCancel = () => {
    const initial = initialStateRef.current;
    if (initial) {
      setDotShape(initial.dotShape);
      setDownloadName(initial.downloadName);
      setDownloadFormat(initial.downloadFormat);
      setLogoDataUrl(initial.logoDataUrl);
      setLogoSize(initial.logoSize);
      setFrameStyle(initial.frameStyle);
      setFrameText(initial.frameText);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fadeIn items-center justify-center bg-black/50 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md animate-slideUp overflow-y-auto rounded-xl border border-slate-300 bg-white p-6 shadow-2xl transition-all duration-300 dark:border-slate-700 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-lg text-slate-900 dark:text-white">
            More Options
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 transition-all duration-200 hover:scale-110 hover:text-slate-900 active:scale-95 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Frame Section */}
          <div className="space-y-4 border-slate-200 border-t pt-4 dark:border-slate-700">
            <div className="space-y-2">
              <Label className="font-medium text-slate-700 dark:text-slate-300">
                Frame Style
              </Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {[
                  { value: 'none', label: 'None' },
                  { value: 'minimal', label: 'Minimal' },
                  { value: 'rounded', label: 'Rounded' },
                  { value: 'banner', label: 'Banner' },
                  { value: 'polaroid', label: 'Polaroid' },
                ].map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setFrameStyle(f.value as FrameStyle)}
                    className={`flex flex-col items-center justify-center rounded-xl border-2 p-3 transition-all ${
                      frameStyle === f.value
                        ? 'border-blue-500 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-900/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800'
                    }`}
                  >
                    <span className="font-medium text-slate-700 text-xs dark:text-slate-300">
                      {f.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            {(frameStyle === 'banner' || frameStyle === 'polaroid') && (
              <div className="space-y-2">
                <Label className="font-medium text-slate-700 dark:text-slate-300">
                  Frame Text
                </Label>
                <input
                  value={frameText}
                  onChange={(e) => setFrameText(e.target.value)}
                  maxLength={20}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 text-sm transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="font-medium text-slate-700 dark:text-slate-300">
              Dot shape
            </Label>
            <Select
              value={dotShape}
              onValueChange={(v) => setDotShape(v as QrDotShape)}
            >
              <SelectTrigger className="rounded-lg border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white">
                <SelectItem value="square">Square</SelectItem>
                <SelectItem value="rounded">Rounded</SelectItem>
                <SelectItem value="dots">Dots</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Logo upload section */}
          <div className="space-y-3 border-slate-200 border-t pt-4 dark:border-slate-700">
            <div>
              <p className="font-medium text-slate-900 text-sm dark:text-white">
                Logo
              </p>
            </div>

            {!logoDataUrl ? (
              <Dropzone
                onDrop={onDropLogo}
                accept={{
                  'image/png': ['.png'],
                  'image/jpeg': ['.jpg', '.jpeg'],
                  'image/webp': ['.webp'],
                  'image/svg+xml': ['.svg'],
                }}
                maxFiles={1}
                className="border-slate-300 bg-slate-50 text-slate-900 transition-all duration-200 hover:bg-slate-100 hover:shadow-md dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
              >
                <DropzoneEmptyState />
              </Dropzone>
            ) : null}

            {logoDataUrl ? (
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700 text-xs dark:text-slate-300">
                  Logo uploaded
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setLogoDataUrl('')}
                  className="border-slate-300 bg-white text-slate-900 transition-all duration-200 hover:scale-105 hover:bg-slate-50 active:scale-95 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                >
                  Remove
                </Button>
              </div>
            ) : null}
          </div>

          {/* Download options */}
          <div className="space-y-3 border-slate-200 border-t pt-4 dark:border-slate-700">
            <div className="space-y-2">
              <Label className="font-medium text-slate-700 dark:text-slate-300">
                File name
              </Label>
              <input
                value={downloadName}
                onChange={(e) => setDownloadName(e.target.value || 'qrcode')}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-slate-900 text-sm placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="font-medium text-slate-700 dark:text-slate-300">
                Download format
              </Label>
              <Select
                value={downloadFormat}
                onValueChange={(v) => setDownloadFormat(v as QrDownloadFormat)}
              >
                <SelectTrigger className="rounded-lg border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-white">
                  <SelectItem value="png">PNG (screen)</SelectItem>
                  <SelectItem value="jpeg">JPG (screen)</SelectItem>
                  <SelectItem value="svg">SVG (print quality)</SelectItem>
                  <SelectItem value="eps">EPS (SVG fallback)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-blue-700 active:scale-95"
          >
            Done
          </Button>
          <Button
            type="button"
            onClick={handleCancel}
            variant="outline"
            className="flex-1 rounded-lg border border-slate-300 bg-white text-slate-900 transition-all duration-200 hover:scale-105 hover:bg-slate-50 active:scale-95 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
