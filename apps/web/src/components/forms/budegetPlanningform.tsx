import React, { useState, useEffect, FormEvent } from "react";

interface User {
  id: string;
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
  wsId: string;
  onClose: () => void;
}

const Event_Modal: React.FC<ModalProps> = ({ isCreate, show, event, onClose, wsId }) => {
  const [formData, setFormData] = useState<Event>(
    event || {
      id: 0,
      created_at: "",
      name: "",
      week: "",
      amount: 0,
      assigned_to: { id: "", full_name: "" },
    }
  );

  useEffect(() => {
    if (!isCreate && event) {
      setFormData(event);
    }
  }, [isCreate, event]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: id === "amount" ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const response = await fetch(`/api/workspaces/${wsId}/budgetPlanning`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isCreate,
        userID: formData.assigned_to?.id,
        eventID: formData.id,
        event: formData,
      }),
    });

    const result = await response.json();
    if (result.error) {
      console.error(result.error);
    } else {
      window.location.reload();
    }
  };

  if (!show) return null;

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
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
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
                value={formData.week}
                onChange={handleChange}
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
                value={formData.amount}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="assigned_to">
                Assigned To (User ID)
              </label>
              <input
                type="text"
                id="assigned_to"
                value={formData.assigned_to?.full_name || ""}
                onChange={(e) =>
                  setFormData((prevData) => ({
                    ...prevData,
                    assigned_to: { id: e.target.value, full_name: prevData.assigned_to?.full_name || "" },
                  }))
                }
                className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <button
              type="submit"
              className="mt-4 px-4 py-2 bg-blue-900 hover:bg-blue-600 text-white rounded-2xl"
            >
              {isCreate ? "Create" : "Update"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Event_Modal;
