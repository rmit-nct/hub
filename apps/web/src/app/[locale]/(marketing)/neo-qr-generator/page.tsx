// npm install qrcode.react
'use client';
import { Button } from '@ncthub/ui/button';
import { igloo } from '@ncthub/ui/icons';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';

export default function ScanTicket() {
  const [qrData, setQrData] = useState('');

  const downloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) {
      return;
    }
    const svgData = new XMLSerializer().serializeToString(svg);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx?.drawImage(img, 0, 0);

      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'custom-qrcode.png';
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src =
      'data:image/svg+xml;base64,' +
      btoa(unescape(encodeURIComponent(svgData)));
  };
  return (
    // Tailwind used for the layout, background, and drop shadow
    <div className="mx-auto mt-10 flex max-w-sm flex-col items-center justify-center rounded-2xl bg-slate-50 p-8 shadow-xl">
      <h2 className="mb-6 font-bold text-2xl text-slate-800">Your QR</h2>

      {/* A white wrapper ensures the QR code is always scannable, even in dark mode */}
      <div className="gap-3 rounded-xl border-2 border-slate-200 bg-white p-4">
        {qrData ? (
          <div className="flex flex-col items-center">
            {/* Added an ID to the QRCode so our download function can find it */}
            <QRCodeSVG id="qr-code-svg" value={qrData} size={200} level="H" />

            {/* Download Button */}
            <Button
              onClick={downloadQR}
              className="mt-6 w-full rounded-lg bg-blue-600 px-6 py-2 font-semibold text-sm text-white transition-colors hover:bg-blue-700 focus:ring-4 focus:ring-blue-200"
            >
              Download PNG
            </Button>
          </div>
        ) : (
          <div className="flex h-[200px] w-[200px] items-center justify-center bg-slate-100 p-4 text-center text-slate-400 text-sm">
            Type something above to generate a QR code
          </div>
        )}
      </div>
      <div className="mb-8 w-full pt-3">
        <label
          htmlFor="qr-input"
          className="mb-2 block font-medium text-slate-700 text-sm"
        >
          Enter URL or Text
        </label>
        <textarea
          id="qr-input"
          rows={3}
          className="w-full resize-none rounded-xl border-2 border-slate-200 p-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="https://..."
          value={qrData}
          onChange={(e) => setQrData(e.target.value)}
        />
      </div>
    </div>
  );
}
