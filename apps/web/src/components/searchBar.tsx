import React from "react";
import Image from "next/image";

interface SearchBarProps {
  onSearchChange: (query: string) => void;
  isDark: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearchChange, isDark }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <div className="relative w-1/3">
      <input
        type="text"
        placeholder="Search for name or sid"
        onChange={handleInputChange}
        className={`p-2 pl-10 rounded-lg w-full ${isDark ? 'bg-gray-700 text-white' : 'bg-blue-100 text-black'}`}
      />
      <Image
        width={25}
        height={25}
        src="/media/finance/searchImage.png"
        alt="Search Icon"
        className="absolute top-2 left-2"
      />
    </div>
  );
};

export default SearchBar;
