import React from "react";
import Image from "next/image";

interface RefreshProps {
  onReset: () => void;
}

const RefreshButton: React.FC<RefreshProps> = ({ onReset }) => {
    // className=""

  return (
    <div>
      <button onClick={onReset} className="p-2 bg-gray-700 hover:bg-gray-500 rounded-lg">
        <Image alt="Refresh image" className="" width={20} height={20} src='/media/finance/reload.png'/>
      </button>
    </div>
  );
};

export default RefreshButton;
