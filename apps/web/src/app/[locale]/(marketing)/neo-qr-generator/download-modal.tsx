'use client';

import { Button } from '@ncthub/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ncthub/ui/select';
import { useState } from 'react';
import type { QrDownloadFormat } from './qr-utils';

// Download Modal Component
interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  downloadName: string;
  setDownloadName: (name: string) => void;
  downloadFormat: QrDownloadFormat;
  setDownloadFormat: (format: QrDownloadFormat) => void;
  onDownload: () => Promise<void>;
}

export function DownloadModal({
  isOpen,
  onClose,
  downloadName,
  setDownloadName,
  downloadFormat,
  setDownloadFormat,
  onDownload,
}: DownloadModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownload();
      onClose();
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fadeIn items-center justify-center backdrop-blur-md"
      style={{ backgroundColor: 'var(--background)' }}
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-sm rounded-xl border p-6 shadow-lg"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          className="mb-4 font-semibold text-lg"
          style={{ color: 'var(--foreground)' }}
        >
          Download QR Code
        </h2>

        <div className="space-y-4">
          {/* File Name Input */}
          <div className="space-y-2">
            <label
              className="font-medium text-sm"
              style={{ color: 'var(--foreground)' }}
            >
              File Name
            </label>
            <input
              type="text"
              value={downloadName}
              onChange={(e) => setDownloadName(e.target.value || 'qrcode')}
              placeholder="qrcode"
              className="w-full rounded-lg border px-4 py-2 text-sm transition-colors focus:outline-none"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
              }}
            />
          </div>

          {/* Format Selection */}
          <div className="space-y-2">
            <label
              className="font-medium text-sm"
              style={{ color: 'var(--foreground)' }}
            >
              Format
            </label>
            <Select
              value={downloadFormat}
              onValueChange={(v) => setDownloadFormat(v as QrDownloadFormat)}
            >
              <SelectTrigger
                className="rounded-lg"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--card)',
                  color: 'var(--foreground)',
                }}
              >
                <SelectItem value="png">PNG (Screen)</SelectItem>
                <SelectItem value="jpeg">JPG (Screen)</SelectItem>
                <SelectItem value="svg">SVG (Print Quality)</SelectItem>
                <SelectItem value="eps">EPS (SVG Fallback)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 rounded-lg px-4 py-2 font-semibold text-black transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {isDownloading ? 'Downloading...' : 'Download'}
          </Button>
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            className="flex-1 rounded-lg border px-4 py-2 font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)',
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
