import React from "react";

interface User {
  full_name: string;
}

interface Event {
  id: number;
  created_at: string;
  name: string;
  week: string;
  amount: number;
  assigned_to?: User;
}

interface ModalProps {
  isCreate: boolean;
  show: boolean;
  event: Event | null;
  onClose: () => void;
}

const Event_Modal: React.FC<ModalProps> = ({ isCreate, show, event, onClose }) => {
  if (!show) return null;

  const initialEvent = event || {
    id: 0,
    created_at: "",
    name: "",
    week: "",
    amount: 0,
    assigned_to: { full_name: "" },
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center">
      <div className="bg-gray-800 p-6 rounded-lg w-1/2 max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-2xl">{isCreate ? "Create Event" : "Event Details"}</h2>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-800 hover:text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            X
          </button>
        </div>
        <div className="overflow-y-auto max-h-[70vh]">
          <form>
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                id="name"
                defaultValue={initialEvent.name}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="week">
                Week
              </label>
              <input
                type="text"
                id="week"
                defaultValue={initialEvent.week}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="amount">
                Amount
              </label>
              <input
                type="number"
                id="amount"
                defaultValue={initialEvent.amount}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            {initialEvent.assigned_to && (
              <div className="mb-4">
                <label className="block text-white text-sm font-bold mb-2" htmlFor="assigned_to">
                  Assigned To
                </label>
                <input
                  type="text"
                  id="assigned_to"
                  defaultValue={initialEvent.assigned_to.full_name}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            )}
          </form>
          <button  className=" mt-4 px-4 py-2 bg-blue-900 hover:bg-blue-600 text-white rounded-2xl">
          {isCreate?'Create' :"Update"}
        </button>
        </div>
      </div>
    </div>
  );
};

export default Event_Modal;
