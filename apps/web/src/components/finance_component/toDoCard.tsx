"use client"
import React, { useState } from 'react';

interface Task {
  id: number;
  created_at: string;
  member_fee_column: boolean;
  bill_tracking_column: boolean;
  budget_planning_column: boolean;
}

interface Props {
  tasks: Task[];
  wsId: string; 
}

const ToDoTasks: React.FC<Props> = ({ tasks, wsId }) => {
  const [task, setTask] = useState<Task>(tasks[0]);
  const [selections, setSelections] = useState({
    member_fee_column: task.member_fee_column,
    bill_tracking_column: task.bill_tracking_column,
    budget_planning_column: task.budget_planning_column,
  });
  if (!tasks || tasks.length === 0) {
    return <div>No tasks found</div>;
  }




  const toggleSelection = (key: keyof typeof selections) => {
    setSelections((prevSelections) => ({
      ...prevSelections,
      [key]: !prevSelections[key],
    }));
  };

  // Handler to update the main task state and send data to the server
  const updateTask = async () => {
    const updatedTask = {
      ...task,
      ...selections,
    };

    setTask(updatedTask);

    try {
      const response = await fetch(`/api/workspaces/${wsId}/updateToDo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: task.id,
          updates: selections,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update task');
      }

      const result = await response.json();
      console.log('Update successful:', result.data);
    } catch (error) {
      console.error('Error updating task:', error);
    }

    console.log(JSON.stringify(updatedTask) + " after change");
  };

  return (
    <div className="relative inline-block w-[800px] rounded-3xl bg-gray-800 p-6 text-center">
      <h2 className="justify-left mb-4 flex items-center text-3xl font-bold">
        To-do tasks: <span className="ml-2 ">🎯</span>
      </h2>
      <ul className="ml-[50px] text-left">
        <li className="mb-2 mt-[70px] flex items-center cursor-pointer" onClick={() => toggleSelection('member_fee_column')}>
          <a className={`w-full text-left text-2xl font-bold text-white ${selections.member_fee_column ? 'line-through bg-gray-600' : ''}`}>
            Member fee tracking.
          </a>
        </li>
        <li className="mb-2 mt-[70px] flex items-center cursor-pointer" onClick={() => toggleSelection('bill_tracking_column')}>
          <a className={`w-full text-left text-2xl font-bold text-white ${selections.bill_tracking_column ? 'line-through bg-gray-600' : ''}`}>
            Bill tracking.
          </a>
        </li>
        <li className="mt-[70px] flex items-center cursor-pointer" onClick={() => toggleSelection('budget_planning_column')}>
          <a className={`w-full text-left text-2xl font-bold text-white ${selections.budget_planning_column ? 'line-through bg-gray-600' : ''}`}>
            Budget planning.
          </a>
        </li>
      </ul>
      <button
        onClick={updateTask}
        className="mt-6 p-2 rounded-2xl bg-blue-900 text-white hover:bg-blue-600"
      >
        Update
      </button>
    </div>
  );
};

export default ToDoTasks;
