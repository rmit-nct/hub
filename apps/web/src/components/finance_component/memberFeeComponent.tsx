import React from 'react';

const UserDataTable = () => {
  const users = [
    { id: 1, name: 'Huynh Tan Phat', type: 'Newbie', status: 'Not approved' },
    { id: 2, name: 'Phat Huynh', type: 'Oldbie', status: 'Not approved' },
    { id: 3, name: 'Phat Huynh', type: 'Oldbie', status: 'Not approved' }
    // Add more user data as needed
  ];

  const handleRowClick = (user) => {
    // Handle row click event
    alert(`Clicked on ${user.name}`);
  };

  return (
    <div className="text-white min-h-screen flex flex-col items-start">
      <div className="p-6 rounded-lg w-full max-w-4xl items-start">
        <div className="mb-4 flex justify-between items-center">
          <div className="relative w-1/3">
            <input
              type="text"
              placeholder="Search for name or sid"
              className="p-2 pl-10 rounded-lg bg-gray-700 text-white w-full"
            />
            <img
              src="/search-icon.png"
              alt="Search Icon"
              className="w-6 h-6 absolute top-2 left-2"
            />
          </div>
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
            <tr className='h-[70px] border-b border-gray-700'>
              <th className='py-2 px-4 text-center' colSpan={5}>Member fee list</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr
                key={user.id}
            
                className={`h-[60px] cursor-pointer hover:bg-gray-700 ${index === users.length - 1 ? '' : 'border-b border-gray-700'}`}
              >
                <td className="py-2 px-4">{user.id}</td>
                <td className="py-2 px-4">{user.name}</td>
                <td className="py-2 px-4">{user.type}</td>
                <td className="py-2 px-4">{user.status}</td>
                <td className="py-2 px-4 text-right">
                  >
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Tasks</h3>
        <ul className="text-left">
          <li className="mb-2">
            <a href="#" className="text-white font-bold w-full text-left block">Member fee tracking</a>
          </li>
          <li className="mb-2">
            <a href="#" className="text-white font-bold w-full text-left block">Bill tracking</a>
          </li>
          <li>
            <a href="#" className="text-white font-bold w-full text-left block">Budget planning</a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UserDataTable;
