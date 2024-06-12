"use client"
import React from "react";
import ToDoList from "../toDoList";
import SearchBar from "../searchBar";

interface BillData {
  no: number;
  bill: string;
  event: string;
  date: string;
  redBill: boolean;
  whiteBill: boolean;
}

const bills: BillData[] = [
  { no: 1, bill: "Lotte Mart", event: "Bonding", date: "17/06/2024", redBill: true, whiteBill: false },
  { no: 2, bill: "Super store", event: "Guest speaker", date: "17/06/2024", redBill: false, whiteBill: true },
];

const BillDataTable: React.FC = () => {
  return (
    <div className="text-white min-h-screen flex flex-col items-start">
      <div className="p-6 rounded-lg w-full max-w-4xl items-start">
        <div className="mb-4 flex justify-between items-center">
          <SearchBar />
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
            <tr className="border-b border-gray-700">
              <th className="border border-r py-5 px-4">No</th>
              <th className="border border-r py-5 px-4">Bill</th>
              <th className="border border-r py-5 px-4">Event</th>
              <th className="border border-r py-5 px-4">Date</th>
              <th className="border border-r py-5 px-4">Red bill</th>
              <th className="border border-r py-5 px-4">White bill</th>
              <th className="py-5 px-4">View detail</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill, index) => (
              <tr key={bill.no} 
              className={` ${index === bills.length - 1 ? '' : 'border-b border-gray-700'}`}>
                <td className="border border-r py-2 px-4">{bill.no}</td>
                <td className="border border-r py-2 px-4">{bill.bill}</td>
                <td className="border border-r py-2 px-4">{bill.event}</td>
                <td className="border border-r py-2 px-4">{bill.date}</td>
                <td className="border border-r py-2 px-4 text-center">
                  {bill.redBill ? (
                    <span className="text-green-500">✅</span>
                  ) : (
                    <span className="text-red-500">❌</span>
                  )}
                </td>
                <td className="border border-r py-2 px-4 text-center">
                  {bill.whiteBill ? (
                    <span className="text-green-500">✅</span>
                  ) : (
                    <span className="text-red-500">❌</span>
                  )}
                </td>
                <td className="py-2 px-4 text-right">
                  <button className="p-2 bg-gray-700 rounded-lg">{'>'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 p-6 rounded-lg">
        <ToDoList />
      </div>
    </div>
  );
};

export default BillDataTable;
