import React, { FormEvent, useState } from 'react';
import Image from 'next/image';
import ImageModal from '../picture_zoom';

interface User {
  id: string;
  name: string;
  created_at: string;
  date_of_birth: string;
  major: string;
  numOfSem: number;
  yearOfEnrol: string;
  paymentMethod: string;
  image: string;
  type: string;
  status: string;
}

interface ModalProps {
  show: boolean;
  user: User;
  wsId: string;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ show, wsId, user, onClose }) => {
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(false);
  const [imageURL, setImageURL] = useState('');
  const [formData, setFormData] = useState<User>(user);

  const handleClick = (imageURL: string) => {
    setShowModal(true);
    setSelected(true);
    setImageURL(imageURL);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelected(false);
  };

  const handleApprove = () => {
    setFormData((prevData) => ({
      ...prevData,
      status: "Approved",
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    handleApprove();

    try {
      const updatedFormData = {
        ...formData,
        status: "Approved",
      };

      const response = await fetch(`/api/workspaces/${wsId}/memberFeeTracking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memberFee: updatedFormData }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error);
      }

      window.location.reload();
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error('An unknown error occurred');
      }
    }
  };

  if (!show) return null;

  const dob = new Date(user.date_of_birth);

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
          <form onSubmit={handleSubmit}>
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
              <label className="block text-white text-sm font-bold mb-2" htmlFor="dob">
                Date of Birth
              </label>
              <input
                type="text"
                id="dob"
                defaultValue={dob.toISOString().substring(0, 10)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
                disabled
              />
            </div>
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="major">
                Major
              </label>
              <input
                type="text"
                id="major"
                defaultValue={user.major}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
                disabled
              />
            </div>
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="numOfSem">
                Number of Semesters
              </label>
              <input
                type="text"
                id="numOfSem"
                defaultValue={user.numOfSem.toString()}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
                disabled
              />
            </div>
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="yearOfEnrol">
                Year of Enrollment
              </label>
              <input
                type="text"
                id="yearOfEnrol"
                defaultValue={user.yearOfEnrol}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
                disabled
              />
            </div>
            <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="paymentMethod">
                Payment Method
              </label>
              <input
                type="text"
                id="paymentMethod"
                defaultValue={user.paymentMethod}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
                disabled
              />
              <div className="mb-4">
              <label className="block text-white text-sm font-bold mb-2" htmlFor="image">
                Image (Optional)
              </label>
              <button onClick={(e) => {
                e.preventDefault();
                handleClick(user.image)}}>
                <Image width={200} height={200} src={user.image} alt='payment image' className='hover:w-[250px] hover:h-[250px]'/>
              </button>
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
            <button type='submit'
            className='mt-4 px-4 py-2 bg-blue-900 hover:bg-blue-600 text-white rounded-2xl'>Approve</button>
          </form>
        </div>
      </div>
      {selected && <ImageModal show={showModal} imageURL={imageURL} onClose={closeModal} />}
    </div>
  );
};

export default Modal;
