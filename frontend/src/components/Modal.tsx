import React from "react";
import { useAppContext } from "../contexts/Contexts";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const {setShowItems} = useAppContext()
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="p-4">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            onClick={()=>{onClose(); setShowItems("FRIENDS")}}
          >
            ✖
          </button>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
