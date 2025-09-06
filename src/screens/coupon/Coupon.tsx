"use client";
import React, { useEffect, useState } from "react";
import AddCoupon from "./components/AddCoupon";
import UpdateCoupon from "./components/UpdateCoupon";
import { Navbar, SideDrawer } from "../../components";
import { Get } from "../../config/apiMethods";
import { RouteName } from "../../routes/RouteNames";

function Coupon() {
  const [coupons, setCoupons] = useState<any>();
  const [newCoupon, setNewCoppon] = useState(true);
  const [couponClosed, setCouponClosed] = useState(false);


  useEffect(() => {
    const user: any = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.couponClosed) {
      setCouponClosed(true);
    }

    if (user.plan === "allowToRegisterMultiStudents") {
      setCouponClosed(false);
    }
  }, []);

  const fetchCoupons = async () => {
    const user: any = JSON.parse(localStorage.getItem("user") || "{}");
    try {
      const response = await Get(RouteName.GET_COUPON, user._id, null);
      // console.log("response", response.coupons);

      if (response.message === "Coupons retrieved successfully") {
        setCoupons(response.coupons);
        console.log("Coupons updated!"); // Logging after state update
        if (user.plan === "allowToRegisterMultiStudents") {

          setNewCoppon(false);
        } else {
          setNewCoppon(true);
        }
      } else if (response.message === "No coupons found for this user") {
        setNewCoppon(false);
        setCoupons(response.coupons);
      }
    } catch (error) {
      console.error("Error fetching coupons", error);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  return (
    <div className="flex flex-row w-screen h-screen max-w-[2200px] justify-center items-center mx-auto bg-mainBg flex-wrap">
      {/* for left side  */}
      <div className="lg:w-1/6 h-full bg-transparent">
        <SideDrawer />
      </div>

      {/* for right side */}
      <div className="flex flex-col h-screen w-screen lg:w-10/12 px-2 py-2 md:px-4 md:py-6  md:pr-16 bg-mainBg">
        {/* 1st Navbar*/}
        <div className="w-full h-fit bg-mainBg mb-2 md:mb-6">
          <Navbar title="Coupon" />
        </div>

        {/* center */}
        {/* <div className=" w-full mb-2 md:mb-6 flex flex-col md:flex-row  bg-mainBg h-screen mt-7">
          <div className="" >
            
            <AddCoupon fetchCoupons={fetchCoupons} newCoupon={newCoupon}/>
            {coupons && <UpdateCoupon fetchCoupons={fetchCoupons} coupons={coupons} />}
          </div>
        </div> */}

        <div className="w-full mb-2 md:mb-6 bg-mainBg h-screen mt-7">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Coupon Section */}
            <div className="lg:col-span-1">
              <div
                className={`${couponClosed ? "pointer-events-none opacity-50 blur-sm" : ""
                  }`}
              >
                <AddCoupon fetchCoupons={fetchCoupons} newCoupon={newCoupon} />
              </div>
            </div>

            {/* Coupons List Section */}
            <div className="lg:col-span-2">
              {coupons && (
                <UpdateCoupon fetchCoupons={fetchCoupons} coupons={coupons} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Coupon;
