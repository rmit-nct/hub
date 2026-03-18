// npm install qrcode.react
import { QRCodeSVG } from 'qrcode.react';

export default function ScanTicket() {
  const ticketUrl = 'https://rmitnct.club';

  return (
    // Tailwind used for the layout, background, and drop shadow
    <div className="mx-auto mt-10 flex max-w-sm flex-col items-center justify-center rounded-2xl bg-slate-50 p-8 shadow-xl">
      <h2 className="mb-6 font-bold text-2xl text-slate-800">
        Your Entry Ticket
      </h2>

      {/* A white wrapper ensures the QR code is always scannable, even in dark mode */}
      <div className="rounded-xl border-2 border-slate-200 bg-white p-4">
        <QRCodeSVG
          value={ticketUrl}
          size={200}
          level="H" // High error correction (good if you want to add a logo in the middle)
          includeMargin={false}
        />
      </div>

      <p className="mt-6 text-center text-slate-500 text-sm">
        Show this code at the front gate.
      </p>
    </div>
  );
}
