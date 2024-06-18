import React from "react";
import ToDoList from "../toDoList";
import Image from "next/image";
interface Event{
    id: Number;
    created_at: string;
    name: string;
    week: string;
    amount: string;
    assigned_to ?: string;
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
  events: Event[];
  wsId :string;
}
const BudgetPlanning: React.FC<Props> = ({tasks, events,wsId}) => {
  
  
  const estimatedAmount = "3.000.000 vnd";
  console.log(wsId);
  return (
    <div className="text-white min-h-screen flex flex-col items-start p-6">
      <div className="bg-gray-800 p-6 rounded-3xl w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Estimated amount:</h2>
          <span className="text-xl font-bold">{estimatedAmount}</span>
        </div>
        <div>
          {events.map((event, index) => (
            <div key={index} className="flex justify-between items-center mb-4">
              <div className="flex  items-center">
                <span className="font-bold">{event.name}:</span>
              </div>
              <div className="flex items-center">
                <span className="mr-4">{event.amount}</span>
                <button className="px-4 py-2 bg-purple-200 rounded-2xl">
                    <Image width={20} height={20} alt="eye_icon" src={"/media/finance/eye.png"}/>
                </button>
              </div>
            </div>
          ))}
        </div>
 
            <button className="ml-[650px] mt-4 px-4 py-2 bg-blue-900 hover:bg-blue-600 text-white rounded-2xl">
                Add more event
            </button>

        
      </div>
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 p-6 rounded-lg">
        <ToDoList tasks={tasks} />
      </div>
    </div>
  );
};

export default BudgetPlanning;
