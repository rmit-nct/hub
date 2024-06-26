import {useState} from 'react';


const usePagination= (totalItems: number , itemsPerPage: number)=>{
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages= Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;


    const handlePreviousPage = () => {
        setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
      };
    
      const handleNextPage = () => {
        setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages));
      };
    
      const resetPage = () => {
        setCurrentPage(1);
      };


      return{
        currentPage,
        totalPages,
        startIndex,
        endIndex,
        handleNextPage,
        handlePreviousPage,
        resetPage
      }
        
      
};

export default usePagination;