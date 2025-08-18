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

      // const response = await Post(endpoints.SET_COUPON_CODE, payload);
      const response = await Post(RouteName.CREATE_COUPON, payload);

      setCouponCode(""); // Reset input field
      if (response.message === "Coupon created successfully") {
        // toast.success(response.data.message || "Coupon created successfully!");
        fetchCoupons();
      } else {
        // toast.error(response.data.error || "Failed to create the coupon.");
      }
    } catch (error) {
      console.error("Error creating coupon:", error);
      // toast.error("An error occurred while creating the coupon.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-[#E0F2FE] to-[#BFDBFE] p-[1px] rounded-2xl text-blue-900 shadow-md max-w-md">
      <div className="bg-white p-5 rounded-2xl">
        <h2 className="text-lg font-bold text-blue-900">Create Coupon</h2>
        <p className="text-sm text-gray-500 mt-1">
          Fill out the details below to create a new coupon.
        </p>

        {/* Coupon Code Input */}
        <div className="mt-4">
          <label htmlFor="couponCode" className="text-sm text-gray-500">
            Coupon Code:
          </label>
          <div className="flex items-center mt-1 space-x-2">
            <input
              type="text"
              id="couponCode"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter or generate a code"
              className="w-full p-2 bg-gray-100 text-blue-900 rounded-lg border border-gray-300"
            />
            <button
              onClick={generateCouponCode}
              className="py-2 px-4 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white font-semibold rounded-lg hover:opacity-90 transition-all"
              disabled={newCoupon}
            >
              Generate
            </button>
          </div>
        </div>

        {/* One-Time Use Checkbox */}
        {teacherPremium && (
          <div className="mt-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={oneTime}
                onChange={(e) => setOneTime(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-0"
              />
              <span className="text-sm text-gray-500">One-Time Use</span>
            </label>
          </div>
        )}

        {/* Create Coupon Button */}
        <button
          onClick={handleCreateCoupon}
          disabled={loading || newCoupon}
          className={`mt-6 w-full py-2 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-[#3B82F6] to-[#2563EB] hover:to-[#1D4ED8]"
          } text-white font-semibold rounded-lg transition-all`}
        >
          {loading ? "Creating..." : "Create Coupon"}
        </button>
      </div>
    </div>
  );
};

export default AddCoupon;
