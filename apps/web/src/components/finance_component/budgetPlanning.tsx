import React from "react";
import ToDoList from "../toDoList";
import Image from "next/image";
interface Event {
    name: string;
    week: string;
    amount: string;
  }
  
const budgetPlanning =()=>{
    const events: Event[] = [
        { name: "Induction day", week: "Week2", amount: "1.000.000 vnd" },
        { name: "Internal bonding", week: "Week3", amount: "1.000.000 vnd" },
        { name: "Internal bonding", week: "Week4", amount: "1.000.000 vnd" },
      ];

console.log(events);

    return(
        <div className="text-white min-h-screen flex flex-col items-start p-6">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-4xl border">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Estimated amount:</h2>
                    <span className="text-xl font-bold">3.000.000VNd</span>
                    <Image width={19} height={12} src={"/media/finance/expense_finance.png"} alt="image"/>
                </div>
            </div>
            <div className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 p-6 rounded-lg">
                <ToDoList></ToDoList>
            </div>
        </div>
    );
}

export default budgetPlanning;