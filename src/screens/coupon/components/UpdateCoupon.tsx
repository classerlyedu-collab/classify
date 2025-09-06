"use client";
// import { getData, post } from "@/utils/axios";
// import endpoints from "@/utils/endpoints";
import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import PostModal from "./PostModal";
import { RouteName } from "../../../routes/RouteNames";
import { Delete } from "../../../config/apiMethods";
// import toast from "react-hot-toast";

const UpdateCoupon = ({ coupons, fetchCoupons }: any) => {
  const [loading, setLoading] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);





  const handleDelete = async (id: any) => {
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
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Your Coupons</h3>
          <p className="text-sm text-gray-600 mt-1">Manage your created coupons</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coupon Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coupons.map((coupon: any) => (
                <tr key={coupon._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-600">
                            {coupon.code.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {coupon.code}
                        </div>
                        <div className="text-sm text-gray-500">
                          {coupon.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${coupon.maxUses === 1
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-blue-100 text-blue-800'
                      }`}>
                      {coupon.maxUses === 1 ? 'Single Use' : 'Multiple Use'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${coupon.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="font-medium">{coupon.usedCount}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setDeleteMode(true)}
                      className="text-red-600 hover:text-red-900 transition-colors duration-200"
                      title="Delete coupon"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                    <PostModal
                      isOpen={deleteMode}
                      title="Delete Coupon"
                      description="Delete this coupon? This action cannot be undone."
                    >
                      <div className="mt-5 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                        <button
                          className="px-6 py-2 text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                          onClick={() => setDeleteMode(false)}
                        >
                          Cancel
                        </button>
                        <button
                          className="px-6 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg font-semibold transition-colors duration-200"
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

        {coupons.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No coupons created</h3>
            <p className="text-gray-500">Create your first coupon to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateCoupon;
