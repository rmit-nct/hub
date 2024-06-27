'use client';
import React, { useState } from 'react';
import Modal from '../forms/memberFeeTrackingForm';
import ToDoList from '../toDoList';
import SearchBar from '../searchBar';
import RefreshButton from '../refresh';
import FilterButton from '../filter';
import usePagination from '@/hooks/usePagination';
import { useTheme } from 'next-themes';

interface User {
  id: string;
  name: string;
  created_at: string;
  date_of_birth: string; 
  major: string;
  numOfSem: number;
  yearOfEnrol: string;
  paymentMethod: string;
  image: string;
  type: string;
  status: string;
}

interface Task {
  id: number;
  created_at: string;
  member_fee_column: boolean;
  bill_tracking_column: boolean;
  budget_planning_column: boolean;
}

interface Props {
  tasks: Task[];
  memberFee: User[];
  wsId: string; 
}

const UserDataTable: React.FC<Props> = ({ tasks, memberFee, wsId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const itemsPerPage = 5;
  const filteredUsers = memberFee.filter(
    user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    handlePreviousPage,
    handleNextPage,
    resetPage
  } = usePagination(filteredUsers.length, itemsPerPage);

  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const handleRowClick = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    resetPage(); 
  };

  return (
    <div className="text-white min-h-screen flex flex-col items-start">
      <div className="p-6 rounded-lg w-full max-w-4xl items-start">
        <div className="mb-4 flex justify-between items-center">
          <SearchBar isDark={isDark} onSearchChange={handleSearchChange} />
          <div className="flex items-center">
            <FilterButton />
            <RefreshButton onReset={resetPage} />
          </div>
        </div>
        <table className={`min-w-full rounded-2xl font-bold ${isDark ? 'bg-gray-800' : 'text-black bg-blue-100'}`}>
          <thead>
            <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-black'}`}>
              <th className='h-[70px] py-2 px-4 text-center' colSpan={5}>Member fee list</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user, index) => (
              <tr
                key={user.id}
                onClick={() => handleRowClick(user)}
                className={`h-[60px] cursor-pointer hover:${isDark ? 'bg-gray-700' : 'bg-black'} ${index === paginatedUsers.length - 1 ? '' : `border-b ${isDark ? 'border-gray-700' : 'border-black'}`}`}
              >
                <td className="py-2 px-4">{user.major}</td>
                <td className="py-2 px-4">{user.name}</td>
                <td className="py-2 px-4">{user.type}</td>
                <td className="py-2 px-4">{user.status}</td>
                <td className="py-2 px-4 text-right">
                  {'>'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between mt-4">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className={`px-4 py-2 font-bold ${isDark ? 'text-white' : 'text-black'}`}  >
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-700 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

        <ToDoList tasks={tasks} />

      {selectedUser && <Modal wsId={wsId} show={showModal} user={selectedUser} onClose={closeModal} />}
    </div>
  );
};

export default UserDataTable;
