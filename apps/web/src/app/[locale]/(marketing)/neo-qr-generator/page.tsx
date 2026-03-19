// npm install qrcode.react
'use client';
import { Button } from '@ncthub/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import NeoGeneratorHero from './hero';
export default function ScanTicket() {
  const [qrData, setQrData] = useState('');

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
        ctx.fillStyle = '#ffffff';
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
    <div className="container mx-auto px-4 py-14">
      <NeoGeneratorHero />

      {/* Tailwind used for the layout, background, and drop shadow */}
      <div className="mx-auto mt-10 flex max-w-lg flex-col items-center justify-center rounded-2xl p-8 shadow-xl">
        <h2 className="mb-6 font-bold text-2xl text-white">Neo QR Generator</h2>

        {/* A white wrapper ensures the QR code is always scannable, even in dark mode */}
        <div className="w-full rounded-xl border-2 p-6">
          {qrData ? (
            <div className="flex w-full flex-row items-center justify-between gap-6 sm:flex-row">
              {/* Added an ID to the QRCode so our download function can find it */}
              <div className="rounded-2xl bg-[#ffffff] bg-white p-6 shadow-sm">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={qrData}
                  size={160}
                  level="H"
                  className="shrink-0"
                />
              </div>

              {/* Download Button */}
              <div className="flex w-full flex-col gap-3 sm:w-auto">
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
          ) : (
            <div className="flex min-h-[160px] w-full items-center justify-center rounded-lg p-4 text-center text-sm text-white">
              Type something above to generate a QR code
            </div>
          )}
        </div>
        <div className="mb-8 w-full pt-3">
          <label
            htmlFor="qr-input"
            className="mb-2 block font-medium text-sm text-white"
          >
            Enter URL or Text
          </label>
          <textarea
            id="qr-input"
            rows={3}
            className="w-full resize-none rounded-xl border-2 p-3 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="https://..."
            value={qrData}
            onChange={(e) => setQrData(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
