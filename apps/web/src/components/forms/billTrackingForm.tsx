import React from "react";
// import Image from "next/image";
// import ImageModal from "../picture_zoom";

interface BillDetails {
    billName: string;
    buyingDate: string;
    billCreatedDate: string;
    itemList: string[];
    memberInCharge: string;
    redBillStatus: string;
    redBillMessage: string;
    whiteBillURL: string;
    totalPrice: string;
    paidAmount: string;
    note: string;
  }

  interface ModalProps{
    show: boolean;
    billDetail: BillDetails;
    onClose: ()=> void;
  }

  const Modal: React.FC<ModalProps> =()=>{
    // const [showModal, setShowModal]= useState(false);
    
    // const closeModal=()=>{
    //     setShowModal(false);
    // }

    // if(!show) return null;

    return(
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center">
            
        </div>
    );
  }

  export default Modal;