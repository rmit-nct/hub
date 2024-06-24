import React from "react";
import Image from "next/image";

interface RefreshProps {
//   onSearchChange: (query: string) => void;
}

const RefreshButton: React.FC<RefreshProps> = ({  }) => {
    // className=""

  return (
    <div>
      <button className="p-2 bg-gray-700 rounded-lg">
        <Image alt="Refresh image" className="" width={20} height={20} src='/media/finance/reload.png'/>
      </button>
    </div>
  );
};

export default RefreshButton;
