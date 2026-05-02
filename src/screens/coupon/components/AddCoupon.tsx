"use client";
import React, { useEffect, useState } from "react";
import { Post } from "../../../config/apiMethods";
import { RouteName } from "../../../routes/RouteNames";
import {
  HiOutlinePlus,
  HiOutlineArrowPath,
  HiOutlineInformationCircle,
  HiOutlineTicket,
} from "react-icons/hi2";
import { displayMessage } from "../../../config";
import { FloatingInput } from "../../../components";

const AddCoupon = ({ fetchCoupons, newCoupon }: any) => {
  const [couponCode, setCouponCode] = useState("");
  const [oneTime, setOneTime] = useState(true);
  const [loading, setLoading] = useState(false);
  const [teacherPremium, setTeacherPremium] = useState(false);

  const generateCouponCode = () => {
    const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    setCouponCode(randomCode);
  };

  useEffect(() => {
    const user: any = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.plan === "allowToRegisterMultiStudents") {
      setTeacherPremium(true);
    }
  }, []);

  const handleCreateCoupon = async () => {
    if (!couponCode) return;
    setLoading(true);
    const user: any = JSON.parse(localStorage.getItem("user") || "{}");
    try {
      const payload = {
        userId: user._id,
        code: couponCode,
        oneTimeUse: oneTime,
      };
      const response = await Post(RouteName.CREATE_COUPON, payload);
      setCouponCode("");
      if (response.message === "Coupon created successfully") {
        displayMessage?.("Coupon created successfully!", "success");
        fetchCoupons();
      } else {
        displayMessage?.(response.error || response.message || "Failed to create coupon", "error");
      }
    } catch (error: any) {
      console.error("Error creating coupon:", error);
      displayMessage?.("An error occurred while creating the coupon.", "error");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || newCoupon || !couponCode.trim();

  return (
    <div className="rounded-3xl bg-white ring-1 ring-inputBorder/50 overflow-hidden">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-secondary via-primary to-fadeBlue p-5 text-white">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <HiOutlineTicket size={20} />
          </div>
          <div>
            <h2 className="font-trykker text-lg leading-tight">Create coupon</h2>
            <p className="text-xs text-white/80 mt-0.5">Generate a code to share access</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Coupon Code Input */}
        <div>
          <div className="flex gap-2 items-start">
            <div className="flex-1 min-w-0">
              <FloatingInput
                label="Coupon code"
                value={couponCode}
                setValue={(v) => setCouponCode(v.toUpperCase())}
                required
              />
            </div>
            <button
              type="button"
              onClick={generateCouponCode}
              disabled={newCoupon}
              className="shrink-0 h-12 px-3.5 rounded-xl bg-mainBg ring-1 ring-inputBorder hover:ring-primary/40 transition flex items-center gap-1.5 text-xs font-semibold text-greyBlack disabled:opacity-50"
              title="Generate random code"
            >
              <HiOutlineArrowPath size={14} />
              <span className="hidden sm:inline">Generate</span>
            </button>
          </div>
          <p className="text-[11px] text-grey mt-1.5 ml-1">
            Codes are auto-converted to uppercase
          </p>
        </div>

        {/* One-Time Use Toggle */}
        {teacherPremium && (
          <div
            role="button"
            tabIndex={0}
            onClick={() => setOneTime(!oneTime)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setOneTime(!oneTime);
              }
            }}
            className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl bg-mainBg ring-1 ring-inputBorder/60 hover:ring-primary/30 cursor-pointer transition"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-black">Single-use only</p>
              <p className="text-[11px] text-grey mt-0.5">Code expires after one redemption.</p>
            </div>
            <span
              role="switch"
              aria-checked={oneTime}
              className={`relative shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                oneTime ? "bg-gradient-to-r from-primary to-secondary" : "bg-inputBorder"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  oneTime ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </span>
          </div>
        )}

        {/* Create Coupon Button */}
        <button
          onClick={handleCreateCoupon}
          disabled={isDisabled}
          className="w-full h-11 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-secondary hover:shadow-md hover:shadow-secondary/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating…
            </>
          ) : (
            <>
              <HiOutlinePlus size={16} />
              Create coupon
            </>
          )}
        </button>

        {/* Info Box */}
        <div className="rounded-2xl bg-gradient-to-br from-fadeBlue/10 to-bluecolor/5 ring-1 ring-bluecolor/20 p-4">
          <div className="flex gap-3">
            <span className="h-8 w-8 rounded-lg bg-white ring-1 ring-bluecolor/15 text-bluecolor flex items-center justify-center flex-shrink-0">
              <HiOutlineInformationCircle size={16} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-black">How coupons work</p>
              <ul className="mt-1.5 space-y-1 text-[11px] text-greyBlack/80 leading-relaxed">
                <li>· Share codes with students or parents</li>
                <li>· They get free access to the platform</li>
                <li>· Track redemptions in real time</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCoupon;
