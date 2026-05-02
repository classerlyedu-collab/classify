"use client";
import React from "react";
import { HiOutlineExclamationTriangle, HiOutlineXMark } from "react-icons/hi2";

interface PostModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  children?: React.ReactNode;
  onClose?: () => void;
}

const PostModal: React.FC<PostModalProps> = ({ isOpen, children, title, description, onClose }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-ubuntu"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-lg hover:bg-mainBg flex items-center justify-center text-grey hover:text-greyBlack transition"
            aria-label="Close"
          >
            <HiOutlineXMark size={18} />
          </button>
        )}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-orangeBrown/10 ring-1 ring-orangeBrown/20 flex items-center justify-center flex-shrink-0">
              <HiOutlineExclamationTriangle className="text-orangeBrown" size={22} />
            </div>
            <div className="min-w-0 pr-6">
              <h3 className="font-trykker text-lg text-black leading-tight">{title}</h3>
              {description && (
                <p className="text-sm text-grey mt-1.5 leading-relaxed break-words">{description}</p>
              )}
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default PostModal;
