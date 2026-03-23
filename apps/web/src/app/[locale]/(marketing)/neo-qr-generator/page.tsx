// npm install qrcode.react
'use client';
import { Button } from '@ncthub/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import NeoGeneratorHero from './hero';
export default function ScanTicket() {
  const [qrData, setQrData] = useState('');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [fgColor, setFgColor] = useState('#000000');

  const downloadQR = (format: string) => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) {
      return;
    }
    const svgData = new XMLSerializer().serializeToString(svg);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    if (format === 'svg') {
      triggerDownload(url, 'qrcode.svg');
      return;
    }

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      if (format === 'jpg') {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx?.drawImage(img, 0, 0);

      const imageType: Record<string, string> = {
        png: 'image/png',
        jpg: 'image/jpeg',
        webp: 'image/webp',
      };
      const pngUrl = canvas.toDataURL(imageType[format] || 'image/png');
      triggerDownload(pngUrl, `qrcode.${format}`);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const triggerDownload = (url: string, fileName: string) => {
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };
  return (
    <div className="container mx-auto w-full px-4 py-4">
      <NeoGeneratorHero />

      {/* Tailwind used for the layout, background, and drop shadow */}
      <div className="mx-auto mt-10 flex w-full max-w-4xl flex-col items-center justify-center gap-8 rounded-2xl border-2 p-8 shadow-xl md:flex-row">
        {/* A white wrapper ensures the QR code is always scannable, even in dark mode */}
        <div className="w-full rounded-xl p-2">
          {qrData ? (
            <div className="ml-2 flex w-full flex-col items-center justify-between gap-5 sm:flex-row">
              {/* Added an ID to the QRCode so our download function can find it */}
              <div
                className="rounded-2xl p-8 shadow-sm"
                style={{ backgroundColor: bgColor }}
              >
                <QRCodeSVG
                  id="qr-code-svg"
                  value={qrData}
                  size={160}
                  level="H"
                  bgColor={bgColor}
                  fgColor={fgColor}
                  className="shrink-0"
                />
              </div>

              {/* Download Button */}
            </div>
          ) : (
            <div className="flex min-h-[160px] w-full items-center justify-center rounded-lg p-4 text-center text-foreground text-sm">
              Type something above to generate a QR code
            </div>
          )}
        </div>
        <div className="mb-8 w-full pt-3">
          <div className="pb-2">
            <label
              htmlFor="qr-input"
              className="mb-2 block font-medium text-foreground text-sm"
            >
              Enter URL or Text
            </label>
            <textarea
              id="qr-input"
              rows={3}
              className="h-1/3 w-full resize-none rounded-xl border-2 bg-slate-50 p-3 pt-1 text-black focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="https://..."
              value={qrData}
              onChange={(e) => setQrData(e.target.value)}
            />
          </div>

          <div className="mb-4 flex w-full flex-row gap-4">
            <div className="w-1/2">
              <label className="mb-2 block font-medium text-foreground text-sm">
                Background Color
              </label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="h-10 w-full cursor-pointer rounded border-0 bg-transparent p-0"
              />
            </div>
            <div className="w-1/2">
              <label className="mb-2 block font-medium text-foreground text-sm">
                QR/Text Color
              </label>
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="h-10 w-full cursor-pointer rounded border-0 bg-transparent p-0"
              />
            </div>
          </div>

          <div className="flex w-full flex-row gap-3 sm:w-auto">
            <Button
              onClick={() => downloadQR('png')}
              className="w-full rounded-lg bg-blue-600 px-6 py-2 font-semibold text-sm text-white transition-colors hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 sm:w-auto"
            >
              Download PNG
            </Button>

            <Button
              onClick={() => downloadQR('webp')}
              className="w-full rounded-lg bg-blue-600 px-6 py-2 font-semibold text-sm text-white transition-colors hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 sm:w-auto"
            >
              Download Webp
            </Button>

            <Button
              onClick={() => downloadQR('jpg')}
              className="w-full rounded-lg bg-blue-600 px-6 py-2 font-semibold text-sm text-white transition-colors hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 sm:w-auto"
            >
              Download JPEG
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
