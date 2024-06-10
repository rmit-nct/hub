import React from 'react';

const ToDoTasks = () => {
  return (
      <div className="text-center w-[800px] bg-gray-800 p-6 rounded-3xl inline-block relative">
        <h2 className="text-3xl font-bold mb-4 flex items-center justify-left">
          To-do tasks: <span className="ml-2 ">🎯</span>
        </h2>
        <ul className="ml-[50px] text-left">
          <li className="mt-[70px] mb-2">
            <button className="text-white font-bold line-through w-full text-left text-2xl">
              Member fee tracking.
            </button>
          </li>
          <li className="mt-[70px] mb-2">
            <button className="text-white font-bold w-full text-left text-2xl">
              Bill tracking.
            </button>
          </li>
          <li className='mt-[70px]'>
            <button className="text-white font-bold w-full text-left text-2xl">
              Budget planning.
            </button>
          </li>
        </ul>
       
      </div>
  );
};

export default ToDoTasks;
