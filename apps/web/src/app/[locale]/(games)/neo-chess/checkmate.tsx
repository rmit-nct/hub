'use client';

import type React from 'react';

interface CheckmateModalProps {
  team: 'White' | 'Black' | 'Stalemate';
  onRestart: () => void;
}

const CheckmateModal: React.FC<CheckmateModalProps> = ({ team, onRestart }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-96 rounded-lg bg-white p-6 shadow-lg">
        <h3 className="flex justify-center font-semibold text-lg">Game over</h3>
        <p className="my-4 flex justify-center text-base">
          {team === 'Stalemate' ? 'Stalemate!' : `${team} is checkmated!`}
        </p>
        <button
          className="inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-md bg-destructive px-4 py-2 font-semibold text-destructive-foreground text-sm ring-offset-background transition-colors hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          onClick={onRestart}
        >
          Restart
        </button>
      </div>
    </div>
  );
};

export default CheckmateModal;
