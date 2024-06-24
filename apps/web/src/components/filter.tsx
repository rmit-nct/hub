import React from "react";
import Image from "next/image";

interface FilterProps {
  
}

const FilterButton: React.FC<FilterProps> = ({  }) => {
    // className=""

  return (
    <div>
     <button className="p-2 bg-gray-700 rounded-lg mr-2">
            <Image className="" alt="Filter image" width={20} height={20} src='/media/finance/filter.png'/>  
    </button>
    </div>
  );
};

export default FilterButton;
