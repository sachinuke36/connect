import React from "react";
import { IoClose } from "react-icons/io5";
import { useAppContext } from "../contexts/Contexts";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
    const { setShowItems } = useAppContext();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-gradient-to-b from-[#1f3445] to-[#0d1f2d] rounded-2xl shadow-2xl w-full max-w-md border border-[#2a4a5e] relative">
                <button
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-[#2a4a5e] rounded-lg transition-colors z-10"
                    onClick={() => {
                        onClose();
                        setShowItems("FRIENDS");
                    }}
                >
                    <IoClose className="text-xl" />
                </button>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

export default Modal;
