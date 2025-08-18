"use client";

// import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { RouteName } from "../../../routes/RouteNames";
import { Post } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { useNavigate } from "react-router-dom";
// import { post } from "@/utils/axios"; // Assuming the axios instance is in utils/axios
// import endpoints from "@/utils/endpoints";

interface ModalProps {
  title: string;
  description: string;
  children?: React.ReactNode;
  isOpen: boolean;
  image_url: string;
  onClose: () => void;
  setisOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Modal: React.FC<ModalProps> = ({
  title,
  description,
  children,
  isOpen,
  image_url,
  setisOpen,
  onClose,
}) => {
  const [showSecondModal, setShowSecondModal] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();
  // const router = useRouter();

  // Function to handle Apply Code
  const handleApplyCode = async () => {
    try {
      setError(null); // Clear any existing error
      const user: any = JSON.parse(localStorage.getItem("user") || "{}");
      const payload = {
        userId: user._id,
        couponCode: couponCode,
      };
     const response = await Post(RouteName.USE_COUPON, payload);
     console.log("response", response)
      if (response.message === "Coupon applied successfully.") {
        setisOpen(false); // Close the current modal
        setShowSecondModal(true); // Show success modal
        displayMessage(response.message, "success");
      } 
    } catch (err: any) {
      console.log(err.response.data.message)
      displayMessage(err.response.data.message || "Something went wrong." , "error");
    }
  };

  const handleCloseSecondModal = () => {
    
    navigate(RouteName.AUTH_SCREEN);
    setShowSecondModal(false);
  };

  return (
    <>
      <div
        className={`${
          isOpen ? "flex" : "hidden"
        } overflow-y-auto overflow-x-hidden fixed inset-0 flex items-center justify-center z-50 w-full h-screen bg-gray-700 bg-opacity-50 backdrop-blur-sm`}
      >
        <div className="relative p-4 w-full max-w-lg h-full md:h-auto mx-4 my-auto">
          <div className="relative p-4 bg-white rounded-3xl shadow-md md:p-8 border border-blue-500">
            <div className="mb- text-sm font-light">
              <img src={image_url} alt="" className="h-16" />
              <h3 className="mb-3 text-2xl font-bold text-blue-900">{title}</h3>
              <p className="text-blue-600">{description}</p>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter code"
                className="mt-3 text-blue-900 mb-3 py-3 px-4 block w-full bg-white border-blue-500 rounded-lg placeholder-blue-600 font-semibold border"
              />
              {/* {error && <p className="text-red-500 text-sm mt-2">{error}</p>} */}
              <div className="mt-5 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  className="px-10 w-full py-3 text-blue-900 font-semibold rounded-full border-2 border-blue-500"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  className="px-10 w-full py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-full font-semibold"
                  onClick={handleApplyCode}
                >
                  Apply Code
                </button>
              </div>
            </div>
            {children}
          </div>
        </div>
      </div>

      {/* Second Modal */}
      <div
        className={`${
          showSecondModal ? "flex" : "hidden"
        } overflow-y-auto overflow-x-hidden fixed inset-0 flex items-center justify-center z-50 w-full h-screen bg-gray-700 bg-opacity-50 backdrop-blur-sm`}
      >
        <div className="relative p-4 w-full max-w-lg h-full md:h-auto mx-4 my-auto">
          <div className="relative p-4 bg-white rounded-3xl shadow-md md:p-8 border border-blue-500 text-center">
            <div className="mb-4 text-sm font-light">
              <div className="flex justify-center">
                <img src="/cone.png" alt="" className="h-10 mb-2" />
              </div>

              <h3 className="mb-3 text-2xl font-bold text-blue-900">
                Congratulations
              </h3>

              <p className="text-blue-600">
                Your coupon code is applied successfully. Return to Login page
              </p>
              <div className="mt-5 flex justify-center">
                <button
                  className="px-10 py-3 text-white font-semibold bg-blue-600 hover:bg-blue-700 rounded-full"
                  onClick={handleCloseSecondModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
