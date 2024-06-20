import React from "react";
import Image from "next/image";

const SearchBar= () =>{
 
  
    return(
 
            <div className="relative w-1/3">
            <input
              type="text"
              placeholder="Search for name or sid"
             
              className="p-2 pl-10 rounded-lg bg-gray-700 text-white w-full"
            />
            <Image
            width={25}
            height={25}
              src="/media/finance/searchImage.png"
              alt="Search Icon"
              className=" absolute top-2 left-2"
            />
          </div>

    )
}
export default SearchBar;