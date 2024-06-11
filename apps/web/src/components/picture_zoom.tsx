import React from "react";
import Image from "next/image";

interface ImageModalProps {
    show: boolean;
    imageURL: string;
    onClose:() => void;
}

const ImageModal : React.FC<ImageModalProps>= ({show, imageURL, onClose})=>{
    if(!show) return null;

    return(
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex justify-center items-center">
            <div className="relative">
                <button type="button" onClick={onClose} className="absolute top-0 right-0 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                    X
                </button>
                <Image
                    src={imageURL}
                    alt="Large image"
                    width={500}
                    height={500}
                    className=""
                />
            </div>
        </div>
    )
}

export default ImageModal;