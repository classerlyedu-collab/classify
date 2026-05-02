"use client";
import React, { useMemo, useState } from "react";
import PostModal from "./PostModal";
import { RouteName } from "../../../routes/RouteNames";
import { Delete } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { FloatingInput } from "../../../components";
import {
  HiOutlineTrash,
  HiOutlineMagnifyingGlass,
  HiOutlineTicket,
  HiOutlineClipboardDocument,
  HiOutlineCheckCircle,
} from "react-icons/hi2";

interface UpdateCouponProps {
  coupons: any[];
  fetchCoupons: () => void;
  isLoading?: boolean;
}

const UpdateCoupon: React.FC<UpdateCouponProps> = ({ coupons, fetchCoupons, isLoading }) => {
  const [deleting, setDeleting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "single" | "multi">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await Delete(RouteName.DELETE_COUPON, id, null);
      await fetchCoupons();
      setDeletingId(null);
      displayMessage?.("Coupon deleted", "success");
    } catch {
      displayMessage?.("Failed to delete coupon", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleCopy = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      displayMessage?.("Could not copy code", "error");
    }
  };

  const filtered = useMemo(() => {
    const list: any[] = Array.isArray(coupons) ? coupons : [];
    return list
      .filter((c) => {
        if (filter === "single") return c.maxUses === 1;
        if (filter === "multi") return c.maxUses !== 1;
        return true;
      })
      .filter((c) =>
        query.trim()
          ? c.code?.toLowerCase().includes(query.trim().toLowerCase())
          : true
      );
  }, [coupons, filter, query]);

  const couponToDelete = (coupons || []).find((c: any) => c._id === deletingId);

  return (
    <div className="rounded-3xl bg-white ring-1 ring-inputBorder/50 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-inputBorder/40 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h3 className="font-trykker text-lg text-black">Your coupons</h3>
          <p className="text-xs text-grey">Manage and track redemptions.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          {/* Search */}
          <div className="w-full sm:w-56">
            <FloatingInput
              label="Search code"
              value={query}
              setValue={setQuery}
              inputMode="search"
            />
          </div>
          {/* Filter */}
          <div className="flex items-center bg-mainBg ring-1 ring-inputBorder/60 rounded-xl p-1 self-start sm:self-auto">
            {(
              [
                { k: "all" as const, label: "All" },
                { k: "single" as const, label: "Single" },
                { k: "multi" as const, label: "Multi" },
              ]
            ).map(({ k, label }) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`h-7 px-3 text-[11px] font-semibold rounded-lg transition ${
                  filter === k ? "bg-white text-secondary shadow-sm" : "text-grey hover:text-greyBlack"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading ? (
        <>
          {/* Desktop skeleton */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="bg-mainBg/60">
                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-grey">Code</th>
                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-grey">Type</th>
                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-grey">Uses</th>
                  <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-grey">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-inputBorder/30">
                {[0, 1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-mainBg animate-pulse" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-28 rounded bg-mainBg animate-pulse" />
                          <div className="h-2.5 w-20 rounded bg-mainBg animate-pulse" />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-5 w-14 rounded-full bg-mainBg animate-pulse" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-8 rounded bg-mainBg animate-pulse" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <div className="h-8 w-8 rounded-lg bg-mainBg animate-pulse" />
                        <div className="h-8 w-8 rounded-lg bg-mainBg animate-pulse" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile skeleton */}
          <ul className="md:hidden divide-y divide-inputBorder/30">
            {[0, 1, 2].map((i) => (
              <li key={i} className="p-4 flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-mainBg animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-28 rounded bg-mainBg animate-pulse" />
                  <div className="h-2.5 w-40 rounded bg-mainBg animate-pulse" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="h-8 w-8 rounded-lg bg-mainBg animate-pulse" />
                  <div className="h-8 w-8 rounded-lg bg-mainBg animate-pulse" />
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : (!coupons || coupons.length === 0) ? (
        <div className="text-center py-14 px-6">
          <span className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 ring-1 ring-secondary/15 items-center justify-center mb-4">
            <HiOutlineTicket className="text-secondary" size={24} />
          </span>
          <h3 className="font-trykker text-lg text-black">No coupons yet</h3>
          <p className="text-sm text-grey mt-1 max-w-xs mx-auto">
            Create your first coupon on the left to start sharing access.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-14 px-6">
          <span className="inline-flex h-12 w-12 rounded-2xl bg-mainBg items-center justify-center mb-3">
            <HiOutlineMagnifyingGlass className="text-grey" size={20} />
          </span>
          <p className="text-sm font-semibold text-black">No matches</p>
          <p className="text-xs text-grey mt-1">Try a different search or filter.</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-mainBg/60">
                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-grey">Code</th>
                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-grey">Type</th>
                  <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-grey">Uses</th>
                  <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-grey">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-inputBorder/30">
                {filtered.map((coupon: any) => {
                  const single = coupon.maxUses === 1;
                  const isCopied = copiedId === coupon._id;
                  return (
                    <tr key={coupon._id} className="hover:bg-mainBg/40 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 text-secondary flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {coupon.code?.charAt(0)}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-black font-mono tracking-wide">{coupon.code}</p>
                            {coupon.description && (
                              <p className="text-[11px] text-grey truncate max-w-[220px]">{coupon.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ring-1 ${
                          single
                            ? "bg-orangeBrown/10 text-orangeBrown ring-orangeBrown/20"
                            : "bg-fadeBlue/15 text-bluecolor ring-bluecolor/20"
                        }`}>
                          {single ? "Single" : "Multi"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-black">{coupon.usedCount || 0}</span>
                        {coupon.maxUses > 1 && (
                          <span className="text-[11px] text-grey"> / {coupon.maxUses}</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleCopy(coupon.code, coupon._id)}
                            className="h-8 w-8 rounded-lg hover:bg-mainBg flex items-center justify-center text-grey hover:text-secondary transition"
                            title="Copy code"
                          >
                            {isCopied ? (
                              <HiOutlineCheckCircle className="text-lightGreen2" size={16} />
                            ) : (
                              <HiOutlineClipboardDocument size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => setDeletingId(coupon._id)}
                            className="h-8 w-8 rounded-lg hover:bg-orangeBrown/10 flex items-center justify-center text-grey hover:text-orangeBrown transition"
                            title="Delete coupon"
                          >
                            <HiOutlineTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="md:hidden divide-y divide-inputBorder/30">
            {filtered.map((coupon: any) => {
              const single = coupon.maxUses === 1;
              const isCopied = copiedId === coupon._id;
              return (
                <li key={coupon._id} className="p-4 flex items-start gap-3">
                  <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 text-secondary flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {coupon.code?.charAt(0)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-black font-mono tracking-wide truncate mb-1">{coupon.code}</p>
                    <div className="flex items-center gap-2 text-[11px] text-grey">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full font-semibold ${
                        single ? "bg-orangeBrown/10 text-orangeBrown" : "bg-fadeBlue/15 text-bluecolor"
                      }`}>
                        {single ? "Single" : "Multi"}
                      </span>
                      <span>·</span>
                      <span><strong className="text-black">{coupon.usedCount || 0}</strong> uses</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleCopy(coupon.code, coupon._id)}
                      className="h-8 w-8 rounded-lg bg-mainBg flex items-center justify-center text-grey"
                    >
                      {isCopied ? (
                        <HiOutlineCheckCircle className="text-lightGreen2" size={15} />
                      ) : (
                        <HiOutlineClipboardDocument size={15} />
                      )}
                    </button>
                    <button
                      onClick={() => setDeletingId(coupon._id)}
                      className="h-8 w-8 rounded-lg bg-orangeBrown/10 flex items-center justify-center text-orangeBrown"
                    >
                      <HiOutlineTrash size={15} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {/* Single shared delete modal */}
      <PostModal
        isOpen={!!deletingId}
        onClose={() => !deleting && setDeletingId(null)}
        title="Delete coupon?"
        description={
          couponToDelete
            ? `Code "${couponToDelete.code}" will be permanently removed. This action cannot be undone.`
            : "This action cannot be undone."
        }
      >
        <div className="mt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            disabled={deleting}
            onClick={() => setDeletingId(null)}
            className="h-10 px-4 text-sm font-semibold text-greyBlack bg-white ring-1 ring-inputBorder/60 rounded-xl hover:ring-grey/40 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={() => deletingId && handleDelete(deletingId)}
            className="h-10 px-5 text-sm font-semibold text-white bg-orangeBrown hover:bg-orangeBrown/90 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {deleting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deleting…
              </>
            ) : (
              <>
                <HiOutlineTrash size={15} />
                Delete
              </>
            )}
          </button>
        </div>
      </PostModal>
    </div>
  );
};

export default UpdateCoupon;
