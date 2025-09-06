"use client";
import React, { useState } from "react";

const PostModal = ({ isOpen, children, title, description }: any) => {
  return (
    <div>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md">
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6">
              <h3 className="mb-3 text-xl font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed break-words">{description}</p>
              {children}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostModal;
