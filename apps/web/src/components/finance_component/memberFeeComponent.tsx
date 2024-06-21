'use client'
import React, { useState } from 'react';
import Modal from '../forms/memberFeeTrackingForm';
import ToDoList from '../toDoList';
import SearchBar from '../searchBar';

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

const UserDataTable: React.FC<Props> = ({tasks, memberFee, wsId}) => {
  console.log(wsId);

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleRowClick = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const filteredUsers = memberFee.filter(
    user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="text-white min-h-screen flex flex-col items-start">
      <div className="p-6 rounded-lg w-full max-w-4xl items-start">
        <div className="mb-4 flex justify-between items-center">
          <SearchBar onSearchChange={handleSearchChange} />
          <div className="flex items-center">
            <button className="p-2 bg-gray-700 rounded-lg mr-2">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h2.586a1 1 0 01.707.293l1.414 1.414A1 1 0 009.414 5H20a1 1 0 011 1v13a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 01.293-.707L3 3a1 1 0 011-1z"
                />
              </svg>
            </button>
            <button className="p-2 bg-gray-700 rounded-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v4a1 1 0 001 1h14a1 1 0 001-1V4m0 16v-4a1 1 0 00-1-1H5a1 1 0 00-1 1v4"
                />
              </svg>
            </button>
          </div>
        </div>
        <table className="min-w-full bg-gray-800 rounded-2xl">
          <thead>
            <tr className='border-b border-gray-700'>
              <th className='h-[70px] py-2 px-4 text-center' colSpan={5}>Member fee list</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr
                key={user.id}
                onClick={() => handleRowClick(user)}
                className={`h-[60px] cursor-pointer hover:bg-gray-700 ${index === memberFee.length - 1 ? '' : 'border-b border-gray-700'}`}
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
      </div>
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 p-6 rounded-lg">
            <ToDoList tasks={tasks}></ToDoList>
      </div>
      {selectedUser && <Modal wsId={wsId} show={showModal} user={selectedUser} onClose={closeModal} />}
    </div>
  );
};

export default UserDataTable;
