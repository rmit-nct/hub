// npm install qrcode.react
'use client';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
export default function ScanTicket() {
  const [qrData, setQrData] = useState('https://default');

  return (
    // Tailwind used for the layout, background, and drop shadow
    <div className="mx-auto mt-10 flex max-w-sm flex-col items-center justify-center rounded-2xl bg-slate-50 p-8 shadow-xl">
      <h2 className="mb-6 font-bold text-2xl text-slate-800">Your QR</h2>

      {/* A white wrapper ensures the QR code is always scannable, even in dark mode */}
      <div className="gap-3 rounded-xl border-2 border-slate-200 bg-white p-4">
        <QRCodeSVG
          value={qrData}
          size={256}
          level="H" // High error correction (good if you want to add a logo in the middle)
          includeMargin={false}
          className="pb-3"
        />
        <textarea
          className="w-full resize-none rounded-xl border-2 border-slate-200 p-3 text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          id="qr-input"
          placeholder="https://"
          value={qrData}
          onChange={(e) => setQrData(e.target.value)}
        ></textarea>

        <button className="">Download</button>
      </div>
    </div>
  );
}
