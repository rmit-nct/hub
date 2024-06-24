"use client";
import React, { useState } from "react";
import ToDoList from "../toDoList";
import SearchBar from "../searchBar";
import Modal from "../forms/billTrackingForm";
import Image from "next/image";
import FilterButton from "../filter";
import RefreshButton from "../refresh";
interface BillItem {
  id: number;
  created_at: string;
  item_name: string;
  item_price: number;
  item_description: string;
}

interface User{
  id:string;
  full_name: string;
  email:string;
}
interface BillDetails {
  id: number;
  bill_name: string;
  event_id: string;
  member_in_charge: string;
  image_red_bill: string;
  image_white_bill: string;
  workspace_users:User;
  total_price: number;
  paid_amount: number;
  total_diff: number;
  tnote: string;
  completed_at: string;
  created_at: string;
  updated_at: string;
  user_name: string | undefined;
  items: BillItem[];
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
  bills: BillDetails[];
  wsId: string;
}

const BillDataTable: React.FC<Props> = ({ tasks, bills, wsId }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<BillDetails | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  console.log(wsId);
  const handleRowClick = (bill: BillDetails) => {
    setSelectedBill(bill);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const filteredBills = bills.filter(
    bill =>
      bill.bill_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bill.event_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="text-white min-h-screen flex flex-col items-start">
      <div className="p-6 rounded-lg w-full max-w-4xl items-start">
        <div className="mb-4 flex justify-between items-center">
          <SearchBar onSearchChange={handleSearchChange} />
          <div className="flex items-center">
            <FilterButton/>
            <RefreshButton/>
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
            {filteredBills.map((bill, index) => (
              <tr
                key={bill.id}
                className={`${index === bills.length - 1 ? '' : 'border-b border-gray-700'}`}
              >
                <td className="border border-r py-2 px-4">{index + 1}</td>
                <td className="border border-r py-2 px-4">{bill.bill_name}</td>
                <td className="border border-r py-2 px-4">{bill.event_id}</td>
                <td className="border border-r py-2 px-4">{new Date(bill.completed_at).toLocaleDateString()}</td>
                <td className="border border-r py-2 px-4">
                  {bill.image_red_bill ? (
                    <Image className="ml-[20px]" alt="Check image" width={30} height={30} src={'/media/finance/checkImage.png'}/>
                  ) : (
                    <Image className="ml-[20px]" alt="Check image" width={30} height={30} src={'/media/finance/alertImage.png'}/>
                  )}
                </td>
                <td className="border border-r py-2 px-4 text-center">
                  {bill.image_white_bill ? (
                     <Image className="ml-[20px]" alt="Check image" width={30} height={30} src={'/media/finance/checkImage.png'}/>
                  ) : (
                    <Image className="ml-[20px]" alt="Check image" width={30} height={30} src={'/media/finance/alertImage.png'}/>
                  )}
                </td>
                <td className="py-2 px-4 text-right">
                  <button onClick={() => handleRowClick(bill)} className="p-2 bg-gray-700 rounded-lg">{'>'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 bg-gray-800 p-6 rounded-lg">
        <ToDoList tasks={tasks}/>
      </div>
      {selectedBill && <Modal wsId={wsId} show={showModal} billDetail={selectedBill} onClose={closeModal} />}
    </div>
  );
};

export default BillDataTable;
