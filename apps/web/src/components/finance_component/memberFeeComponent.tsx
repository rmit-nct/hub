"use client"
import React, { useState } from 'react';
import Modal from '../forms/memberFeeTrackingForm';
import ToDoList from '../toDoList';
import SearchBar from '../searchBar';

interface User {
  id: number;
  name: string;
  dob: Date;
  major: string;
  numOfSem:Number;
  year: string;
  paymentMethod: string;
  imageURL: string;
  type: string;
  status: string;
}

const UserDataTable: React.FC = () => {
    const users: User[] = [
        {
          id: 1,
          name: 'Huynh Tan Phat',
          dob: new Date('1998-05-20'),
          major: 'Computer Science',
          numOfSem: 6,
          year: 'Junior',
          paymentMethod: 'Credit Card',
          imageURL: '/favicon-32x32.png',
          type: 'Newbie',
          status: 'Not approved'
        },
        {
          id: 2,
          name: 'Phat Huynh',
          dob: new Date('1997-04-15'),
          major: 'Mechanical Engineering',
          numOfSem: 8,
          year: 'Senior',
          paymentMethod: 'PayPal',
          imageURL: '/favicon-32x32.png',
          type: 'Oldbie',
          status: 'Not approved'
        },
        {
          id: 3,
          name: 'Nguyen Van A',
          dob: new Date('1999-01-10'),
          major: 'Electrical Engineering',
          numOfSem: 4,
          year: 'Sophomore',
          paymentMethod: 'Bank Transfer',
          imageURL: '/favicon-32x32.png',
          type: 'Oldbie',
          status: 'Not approved'
        },
        {
          id: 4,
          name: 'Tran Thi B',
          dob: new Date('2000-12-30'),
          major: 'Business Administration',
          numOfSem: 5,
          year: 'Junior',
          paymentMethod: 'Credit Card',
          imageURL: '/favicon-32x32.png',
          type: 'Newbie',
          status: 'Approved'
        },
        {
          id: 5,
          name: 'Le Thi C',
          dob: new Date('1996-11-25'),
          major: 'Information Technology',
          numOfSem: 7,
          year: 'Senior',
          paymentMethod: 'PayPal',
          imageURL: '/favicon-32x32.png',
          type: 'Oldbie',
          status: 'Approved'
        }
      ];
      

  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleRowClick = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="text-white min-h-screen flex flex-col items-start">
      <div className="p-6 rounded-lg w-full max-w-4xl items-start">
        <div className="mb-4 flex justify-between items-center">
          <SearchBar></SearchBar>
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
            {users.map((user, index) => (
              <tr
                key={user.id}
                onClick={() => handleRowClick(user)}
                className={`h-[60px] cursor-pointer hover:bg-gray-700 ${index === users.length - 1 ? '' : 'border-b border-gray-700'}`}
              >
                <td className="py-2 px-4">{user.id}</td>
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
            <ToDoList></ToDoList>
      </div>
      {selectedUser && <Modal show={showModal} user={selectedUser} onClose={closeModal} />}
    </div>
  );
};

export default UserDataTable;
