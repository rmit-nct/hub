import React from 'react';
import Image from 'next/image';
interface User {
    id: number;
    name: string;
    dob: Date;
    major: string;
    numOfSem:Number;
    year: string;
    paymentMethod: string;
    imageURL: string;
    type: string;
    status: string;
}

interface ModalProps {
  show: boolean;
  user: User;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ show, user, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center">
      <div className="bg-gray-800 p-6 rounded-lg w-1/2 max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-2xl">Fee Information</h2>
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
                defaultValue={user.name}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
                disabled
              />
            </div>
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="type">
                Type
              </label>
              <input
                type="text"
                id="type"
                defaultValue={user.type}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
                disabled
              />
            </div>
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="type">
                Date of birth
              </label>
              <input
                type="text"
                id="type"
                defaultValue={user.dob.toISOString().substring(0, 10)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
                disabled
              />
            </div>
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="type">
                Major
              </label>
              <input
                type="text"
                id="type"
                defaultValue={user.major}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
                disabled
              />
            </div>
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="type">
                Number of Semester
              </label>
              <input
                type="text"
                id="type"
                defaultValue={user.numOfSem.toString()}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
                disabled
              />
            </div>
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="type">
                Year of Enrollment
              </label>
              <input
                type="text"
                id="type"
                defaultValue={user.year}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
                disabled
              />
            </div>
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="type">
                Payment Method
              </label>
              <input
                type="text"
                id="type"
                defaultValue={user.paymentMethod}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
                disabled
              />
              <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="type">
                Image (Optional)
              </label>
              <Image width={200} height={200} src={user.imageURL} alt='payment image' className=''/>
            </div>
            </div>
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="status">
                Status
              </label>
              <input
                type="text"
                id="status"
                defaultValue={user.status}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
                disabled
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Modal;
