import React from 'react';

const ToDoTasks = () => {

  return (
    <div className="relative inline-block w-[800px] rounded-3xl bg-gray-800 p-6 text-center">
      <h2 className="justify-left mb-4 flex items-center text-3xl font-bold">
        To-do tasks: <span className="ml-2 ">🎯</span>
      </h2>
      <ul className="ml-[50px] text-left">
        <li className="mb-2 mt-[70px]">
          <a  className="w-full text-left text-2xl font-bold text-white line-through">
            Member fee tracking.
          </a>
        </li>
        <li className="mb-2 mt-[70px]">
          <a
            
            className="w-full text-left text-2xl font-bold text-white"
          >
            Bill tracking.
          </a>
        </li>
        <li className="mt-[70px]">
          <a  className="w-full text-left text-2xl font-bold text-white">
            Budget planning.
          </a>
        </li>
      </ul>
    </div>
  );
};

export default ToDoTasks;
