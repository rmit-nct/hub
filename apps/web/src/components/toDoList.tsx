'use client'
import React from 'react';
import { useTheme } from 'next-themes';
interface Task {
  id: number;
  created_at: string;
  member_fee_column: boolean;
  bill_tracking_column: boolean;
  budget_planning_column: boolean;
}

interface Props {
  tasks: Task[];
}
const ToDoList: React.FC<Props> = ({ tasks }) => {
 
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div className={`fixed right-4 top-1/2 transform -translate-y-1/2  p-6 rounded-lg ${isDark? "bg-gray-800" :"bg-blue-100"}`}>
      <h3 className={`mb-4 text-xl font-bold ${isDark? "text-white" :"text-black"}`}>Tasks</h3>
      <ul className={`text-left ${isDark? "text-white" :"text-black"}`}>
        <li className="mb-2">
          <a href="#" className={`block w-full text-left font-bold  ${tasks[0].member_fee_column ? 'line-through' : ''}`}>
            Member fee tracking
          </a>
        </li>
        <li className="mb-2">
          <a href="#" className={`block w-full text-left font-bold  ${tasks[0].bill_tracking_column ? 'line-through' : ''}`}>
            Bill tracking
          </a>
        </li>
        <li>
          <a href="#" className={`block w-full text-left font-bold  ${tasks[0].budget_planning_column ? 'line-through' : ''}`}>
            Budget planning
          </a>
        </li>
      </ul>
    </div>
  );
};

export default ToDoList;
