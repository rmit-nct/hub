"use client"
import React,{useState} from "react";
import ToDoList from "../toDoList";
import SearchBar from "../searchBar";
import Modal from "../forms/billTrackingForm";
interface BillDetails {
  id: string;
  item_list: string[];
  event_id: string;
  bill_name:string;
  member_in_charge: string;
  image_link_red: string;
  image_link_white: string;
  total_price: number;
  paid_amount: number;
  total_diff: number;
  tnote: string;
  noticre: string;
  completed_at: string;
  created_at: string;
  updated_at: string;
}

const bills: BillDetails[] = [
    {
      id: "1",
      item_list: ["Item 1", "Item 2", "Item 3"],
      event_id: "event1",
      bill_name: "Lotte Mart",
      member_in_charge: "Marcus Martin",
      image_link_red: "",
      image_link_white: "",
      total_price: 1000,
      paid_amount: 800,
      total_diff: 200,
      tnote: "Some note",
      noticre: "Some notice",
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "2",
      item_list: ["Item A", "Item B", "Item C"],
      event_id: "event2",
      bill_name: "Super store",
      member_in_charge: "John Doe",
      image_link_red: "",
      image_link_white: "",
      total_price: 1500,
      paid_amount: 1500,
      total_diff: 0,
      tnote: "Another note",
      noticre: "Another notice",
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
  
const BillDataTable: React.FC = () => {
    const[showModal, setShowModal]= useState(false);
    const [selectedBill, setSelectedBill] = useState<BillDetails | null>(null);

    const handleRowClick= (bill: BillDetails)=>{
        setSelectedBill(bill);
        setShowModal(true);
    }

    const closeModal= ()=>{
        setShowModal(false);
    }
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
              <tr
                key={bill.id}
                className={`${index === bills.length - 1 ? '' : 'border-b border-gray-700'}`}
              >
                <td className="border border-r py-2 px-4">{index + 1}</td>
                <td className="border border-r py-2 px-4">{bill.bill_name}</td>
                <td className="border border-r py-2 px-4">{bill.event_id}</td>
                <td className="border border-r py-2 px-4">{new Date(bill.completed_at).toLocaleDateString()}</td>
                <td className="border border-r py-2 px-4 text-center">
                  {bill.image_link_red ? (
                    <span className="text-green-500">✅</span>
                  ) : (
                    <span className="text-red-500">❌</span>
                  )}
                </td>
                <td className="border border-r py-2 px-4 text-center">
                  {bill.image_link_white ? (
                    <span className="text-green-500">✅</span>
                  ) : (
                    <span className="text-red-500">❌</span>
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
        <ToDoList />
      </div>
      {selectedBill && <Modal show={showModal} billDetail={selectedBill} onClose={closeModal} />}
    </div>
  );
};

export default BillDataTable;
