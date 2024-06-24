import React, { useState } from "react";
import Image from "next/image";
import ImageModal from "../picture_zoom";
import Email_Modal from "../customSendingEmail";
interface BillDetails {
  id: number;
  bill_name: string;
  event_id: string;
  member_in_charge: string;
  image_red_bill: string;
  image_white_bill: string;
  total_price: number;
  workspace_users:User;
  paid_amount: number;
  total_diff: number;
  tnote: string;
  completed_at: string;
  created_at: string;
  updated_at: string;
  user_name: string | undefined;
  items: BillItem[];
}

interface User{
  id:string;
  full_name: string;
  email:string;
}

interface BillItem {
  id: number;
  created_at: string;
  item_name: string;
  item_price: number;
  item_description: string;
}

interface ModalProps {
  show: boolean;
  billDetail: BillDetails;
  wsId: string;
  onClose: () => void;
}

const Bill_Modal: React.FC<ModalProps> = ({ show, wsId,billDetail, onClose }) => {
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(false);
  const [sendEmailClicked, setSendEmailClicked] = useState(false);
  const [showEmailModal, setShowEmailModal]= useState(false);
  const handleClick = () => {
    setShowModal(true);
    setSelected(true);
  };

  const handleSendEmailClick= () =>{
    setSendEmailClicked(true);
    setShowEmailModal(true);
  }
  console.log(JSON.stringify(billDetail.items) + " Hello items");
  
  const closeEmailModal= ()=>{
    setShowEmailModal(false);
    setSendEmailClicked(false);
  }
  const closeModal = () => {
    setShowModal(false);
    setSelected(false);
  };

  const newUser: User = {
    id: billDetail.workspace_users.id,
    full_name: billDetail.workspace_users.full_name,
    email: billDetail.workspace_users.email,
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
              {billDetail.items.map((item, index) => (
                <p key={index}>- {item.item_name}</p>
              ))}
              <p className="font-bold mt-4">Member in charge:</p>
              <p>{billDetail.user_name}</p>
              <p className="font-bold mt-4">Red bill:</p>
              {billDetail.image_red_bill ? (
                <button onClick={handleClick}>
                  <Image width={100} height={100} src={billDetail.image_red_bill} alt="Red bill image" />
                </button>
              ) : (
                <p>Red bill has not been provided. Click here to send email to member in charge.</p>
              )}
            </div>
            <div>
              <p className="font-bold">Buying date:</p>
              <p>{new Date(billDetail.completed_at).toLocaleDateString()}</p>
              <p className="font-bold mt-4">Bill created date:</p>
              <p>{new Date(billDetail.created_at).toLocaleDateString()}</p>
              <p className="font-bold mt-[80px]">White bill:</p>
              {billDetail.image_white_bill ? (
                <button onClick={handleClick}>
                  <Image width={100} height={100} src={billDetail.image_white_bill} alt="White bill image" />
                </button>
              ) : (
                <p>White bill has not been provided. Click here to send email to member in charge.</p>
              )}
            </div>
          </div>
          <div>
            <button onClick={handleSendEmailClick} className="font-bold bg-blue-800">Send email</button>
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
      {selected && <ImageModal show={showModal} imageURL={billDetail.image_red_bill || billDetail.image_white_bill} onClose={closeModal} />}
      {sendEmailClicked && <Email_Modal wsId={wsId}  user={newUser} show={showEmailModal}  onClose={(closeEmailModal)} />}
    </div>
  );
};

export default Bill_Modal;
