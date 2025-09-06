"use client";
import React, { useEffect, useState } from "react";
import { Post } from "../../../config/apiMethods";
import { RouteName } from "../../../routes/RouteNames";
import { set } from "react-datepicker/dist/date_utils";
// import { post } from "@/utils/axios"; // Import the post function
// import toast from "react-hot-toast";
// import endpoints from "@/utils/endpoints";

const AddCoupon = ({ fetchCoupons, newCoupon }: any) => {
  const [couponCode, setCouponCode] = useState("");
  const [oneTime, setOneTime] = useState(true);
  const [loading, setLoading] = useState(false);
  const [teacherPremium, setTeacherPremium] = useState(false);

  // Generate a random coupon code
  const generateCouponCode = () => {
    const randomCode = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
    setCouponCode(randomCode);
  };

  useEffect(() => {
    const user: any = JSON.parse(localStorage.getItem("user") || "{}");
    console.log(user.plan);
    if (user.plan === "allowToRegisterMultiStudents") {
      setTeacherPremium(true);
    }
  }, []);

  // Handle Create Coupon
  const handleCreateCoupon = async () => {
    if (!couponCode) {
      // toast.error("Please enter or generate a coupon code.");
      return;
    }

    setLoading(true);
    const user: any = JSON.parse(localStorage.getItem("user") || "{}");

    try {
      const payload = {
        userId: user._id,
        code: couponCode,
        oneTimeUse: oneTime,
      };

      const response = await Post(RouteName.CREATE_COUPON, payload);

      setCouponCode(""); // Reset input field
      if (response.message === "Coupon created successfully") {
        // toast.success(response.data.message || "Coupon created successfully!");
        fetchCoupons();
      } else {
        // toast.error(response.data.error || "Failed to create the coupon.");
      }
    } catch (error: any) {
      console.error("Error creating coupon:", error);
      // toast.error("An error occurred while creating the coupon.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border max-w-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Create New Coupon</h2>
        <p className="text-sm text-gray-600 mt-1">
          Generate a coupon code to share with others
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Coupon Code Input */}
        <div>
          <label htmlFor="couponCode" className="block text-sm font-medium text-gray-700 mb-2">
            Coupon Code
          </label>
          <div className="flex space-x-3">
            <div className="flex-1">
              <input
                type="text"
                id="couponCode"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter or generate a code"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                disabled={newCoupon}
              />
            </div>
            <button
              onClick={generateCouponCode}
              className="px-4 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={newCoupon}
            >
              Generate
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Code will be automatically converted to uppercase
          </p>
        </div>

        {/* One-Time Use Checkbox */}
        {teacherPremium && (
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="oneTime"
              checked={oneTime}
              onChange={(e) => setOneTime(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="oneTime" className="text-sm text-gray-700">
              Single-use coupon (can only be used once)
            </label>
          </div>
        )}

        {/* Create Coupon Button */}
        <button
          onClick={handleCreateCoupon}
          disabled={loading || newCoupon || !couponCode.trim()}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${loading || newCoupon || !couponCode.trim()
            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
            : "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </div>
          ) : (
            "Create Coupon"
          )}
        </button>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">How it works</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>• Share your coupon code with students or parents</p>
                <p>• They can use it to get free access to the platform</p>
                <p>• Track usage and manage your coupons below</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCoupon;
