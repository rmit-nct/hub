import React, { useState } from "react";
import Image from "next/image";
import ImageModal from "../picture_zoom";

interface BillDetails {
  id: string;
  item_list: string[];
  event_id: string;
  bill_name: string;
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

interface ModalProps {
  show: boolean;
  billDetail: BillDetails;
  onClose: () => void;
}

const Bill_Modal: React.FC<ModalProps> = ({ show, billDetail, onClose }) => {
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(false);

  const handleClick = () => {
    setShowModal(true);
    setSelected(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelected(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center">
      <div className="bg-gray-800 p-6 rounded-lg w-1/2 max-h-[80vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-2xl">Bill Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-800 hover:text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            X
          </button>
        </div>
        <div className="overflow-y-auto max-h-[70vh] text-white">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-bold">Bill name:</p>
              <p>{billDetail.bill_name}</p>
              <p className="font-bold mt-4">Item list:</p>
              {billDetail.item_list.map((item, index) => (
                <p key={index}>- {item}</p>
              ))}
              <p className="font-bold mt-4">Member in charge:</p>
              <p>{billDetail.member_in_charge}</p>
              <p className="font-bold mt-4">Red bill:</p>
              <p>{billDetail.image_link_red ? (
                <button onClick={handleClick}>
                  <Image width={100} height={100} src={billDetail.image_link_red} alt="Red bill image" />
                </button>
              ) : (
                "Red bill has not been provided. Click here to send email to member in charge."
              )}</p>
            </div>
            <div>
              <p className="font-bold">Buying date:</p>
              <p>{new Date(billDetail.completed_at).toLocaleDateString()}</p>
              <p className="font-bold mt-4">Bill created date:</p>
              <p>{new Date(billDetail.created_at).toLocaleDateString()}</p>
              <p className="font-bold mt-[80px]">White bill:</p>
              {billDetail.image_link_white ? (
                <button onClick={handleClick}>
                  <Image width={100} height={100} src={billDetail.image_link_white} alt="White bill image" />
                </button>
              ) : (
                "White bill has not been provided. Click here to send email to member in charge"
              )}
            </div>
          </div>
          <div className="mt-4">
            <p className="font-bold">Total price:</p>
            <p>{billDetail.total_price}</p>
            <p className="font-bold mt-4">Paid amount:</p>
            <p>{billDetail.paid_amount}</p>
          </div>
          <div className="mt-4">
            <p className="font-bold">Note:</p>
            <textarea
              className="w-full p-2 mt-2 bg-gray-700 rounded"
              defaultValue={billDetail.tnote}
              disabled
            ></textarea>
          </div>
        </div>
      </div>
      {selected && <ImageModal show={showModal} imageURL={billDetail.image_link_red || billDetail.image_link_white} onClose={closeModal} />}
    </div>
  );
};

export default Bill_Modal;
