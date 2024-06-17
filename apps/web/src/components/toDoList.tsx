import React from 'react';

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
  console.log(JSON.stringify(tasks) + 'tasks in teh SADto ldolist');
  return (
    <div>
      <h3 className="mb-4 text-xl font-bold">Tasks</h3>
      <ul className="text-left">
        <li className="mb-2">
          <a href="#" className={`block w-full text-left font-bold text-white ${tasks[0].member_fee_column ? 'line-through' : ''}`}>
            Member fee tracking
          </a>
        </li>
        <li className="mb-2">
          <a href="#" className={`block w-full text-left font-bold text-white ${tasks[0].bill_tracking_column ? 'line-through' : ''}`}>
            Bill tracking
          </a>
        </li>
        <li>
          <a href="#" className={`block w-full text-left font-bold text-white ${tasks[0].budget_planning_column ? 'line-through' : ''}`}>
            Budget planning
          </a>
        </li>
      </ul>
    </div>
  );
};

export default ToDoList;
