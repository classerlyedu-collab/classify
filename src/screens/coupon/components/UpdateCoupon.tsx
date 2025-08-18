"use client";
// import { getData, post } from "@/utils/axios";
// import endpoints from "@/utils/endpoints";
import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import PostModal from "./PostModal";
import { RouteName } from "../../../routes/RouteNames";
import { Delete } from "../../../config/apiMethods";
// import toast from "react-hot-toast";

const UpdateCoupon = ({ coupons, fetchCoupons }:any) => {
  const [loading, setLoading] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [deleteLoading , setDeleteLoading] = useState(false);



 

  const handleDelete = async (id:any) => {
    console.log(id + " is deleted");
    // setCoupons((prev) => prev.filter((coupon) => coupon.id !== id));
    setLoading(true)
    try {
      const formData = new FormData();

      const response = await Delete(RouteName.DELETE_COUPON, id, null);

      // formData.append("id", id);
      // const response = post(endpoints.DELETE_COUPON, formData);
      console.log(response);
      fetchCoupons();
      setLoading(false)
      setDeleteMode(false);
      // toast.success("Coupon Deleted Successfully");
    } catch {
      console.log("error to delete the data");
    }
  };

  // if (loading) {
  //   return <div>Loading coupons...</div>;
  // }

  return (
    <div className="p-4">
  <table className="max-w-2xl border-collapse border border-gray-300">
    <thead>
      <tr className="bg-gray-100">
        <th className="border border-gray-300 p-2 text-left text-gray-800">
          Coupon Name
        </th>
        <th className="border border-gray-300 p-2 text-left text-gray-800">
          Type
        </th>
        <th className="border border-gray-300 p-2 text-left text-gray-800">
          Status
        </th>
        <th className="border border-gray-300 p-2 text-left text-gray-800">
          Actions
        </th>
      </tr>
    </thead>
    <tbody>
      {coupons.map((coupon: any) => (
        <tr key={coupon.id} className="bg-white">
          <td className="border border-gray-300 p-2 text-gray-700">
            {coupon.code}
          </td>
          <td className="border border-gray-300 p-2">
            {/* <p>{coupon.oneTimeUse ? "One Time Used " : "Multiple use"}</p> */}
            <p>{coupon.oneTimeUse ? "Single-use coupon" : "Multi-use coupon"}</p>
          </td>
          <td className="border border-gray-300 p-2">
            <p>{coupon.used ? "Used " : "Un Used"}</p>
          </td>
          <td className="border border-gray-300 p-2">
            <button
              onClick={() => setDeleteMode(true)}
              className="text-red-600 hover:text-red-800"
            >
              <FaTrash className="w-5 h-5" />
            </button>
            <PostModal
              isOpen={deleteMode}
              title="Delete Coupon"
              description="Are you sure you want to delete this coupon?"
            >
              <div className="mt-5 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  className="px-10 w-full py-1 text-gray-700 font-semibold rounded-full border-2 border-gray-400"
                  onClick={() => setDeleteMode(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-10 w-full py-3 text-white bg-red-500 hover:bg-red-700 rounded-full font-semibold"
                  onClick={() => handleDelete(coupon._id)}
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </PostModal>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

  );
};

export default UpdateCoupon;
