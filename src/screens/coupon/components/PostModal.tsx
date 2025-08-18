"use client";
import React, { useState } from "react";

const PostModal = ({ isOpen,  children, title, description }: any) => {
  return (
    <div>
      {isOpen && (
        <div className="overflow-y-auto overflow-x-hidden fixed inset-0 flex items-center justify-center z-50 w-full h-screen bg-gray-600 bg-opacity-50 backdrop-blur-sm">
        <div className="relative p-4 w-full max-w-lg h-auto md:h-auto mx-4 my-auto flex justify-center">
          <div className="relative mt-44 md:mt-24  p-4 bg-[#202020] rounded-3xl shadow-md md:p-8 border border-[#7c7c7c] w-full max-w-lg mx-auto">
              <h3 className="mb-2 text-2xl font-bold text-white">{title}</h3>
              <p className="text-xs text-[#BDBDBD]">{description}</p>
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostModal;
