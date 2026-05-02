"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import AddCoupon from "./components/AddCoupon";
import UpdateCoupon from "./components/UpdateCoupon";
import { Navbar, SideDrawer } from "../../components";
import { Get } from "../../config/apiMethods";
import { RouteName } from "../../routes/RouteNames";
import { UseStateContext } from "../../context/ContextProvider";
import {
  HiOutlineTicket,
  HiOutlineUsers,
  HiOutlineLockClosed,
  HiOutlineSparkles,
  HiOutlineRectangleStack,
} from "react-icons/hi2";

function Coupon() {
  const { role } = UseStateContext();
  const [coupons, setCoupons] = useState<any[] | null>(null);
  const [newCoupon, setNewCoppon] = useState(true);
  const [couponClosed, setCouponClosed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const effectiveRole = useMemo(() => {
    if (role) return role;
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      return u?.userType || u?.role || null;
    } catch {
      return null;
    }
  }, [role]);

  const isStudent = effectiveRole === "Student";

  useEffect(() => {
    const user: any = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.couponClosed) setCouponClosed(true);
    if (user.plan === "allowToRegisterMultiStudents") setCouponClosed(false);
  }, []);

  const fetchCoupons = async (showSpinner = true) => {
    if (showSpinner) setIsLoading(true);
    const user: any = JSON.parse(localStorage.getItem("user") || "{}");
    try {
      const response = await Get(RouteName.GET_COUPON, user._id, null);
      if (response.message === "Coupons retrieved successfully") {
        setCoupons(response.coupons || []);
        setNewCoppon(user.plan !== "allowToRegisterMultiStudents");
      } else if (response.message === "No coupons found for this user") {
        setNewCoppon(false);
        setCoupons(response.coupons || []);
      } else {
        setCoupons([]);
      }
    } catch (error) {
      console.error("Error fetching coupons", error);
      setCoupons([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isStudent) return;
    fetchCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStudent]);

  const stats = useMemo(() => {
    const list = coupons || [];
    const totalUses = list.reduce((sum: number, c: any) => sum + (c.usedCount || 0), 0);
    const singleUse = list.filter((c: any) => c.maxUses === 1).length;
    const multiUse = list.length - singleUse;
    return { total: list.length, totalUses, singleUse, multiUse };
  }, [coupons]);

  if (isStudent) {
    return <Navigate to={RouteName.DASHBOARD_SCREEN_STUDENT} replace />;
  }

  const statCards = [
    {
      label: "Total Coupons",
      value: String(stats.total),
      Icon: HiOutlineTicket,
      tone: "from-primary/15 to-secondary/15 text-secondary",
    },
    {
      label: "Total Redemptions",
      value: String(stats.totalUses),
      Icon: HiOutlineUsers,
      tone: "from-fadeBlue/15 to-bluecolor/10 text-bluecolor",
    },
    {
      label: "Single-Use",
      value: String(stats.singleUse),
      Icon: HiOutlineSparkles,
      tone: "from-orangeBrown/15 to-orangeBrown/5 text-orangeBrown",
    },
    {
      label: "Multi-Use",
      value: String(stats.multiUse),
      Icon: HiOutlineRectangleStack,
      tone: "from-lightGreen2/15 to-lightGreen2/5 text-lightGreen2",
    },
  ];

  return (
    <div className="flex w-screen h-screen bg-mainBg overflow-hidden font-ubuntu">
      <SideDrawer />

      <div className="flex flex-col flex-1 lg:ml-[16.6667%] h-screen overflow-y-auto [scrollbar-width:thin]">
        {/* Sticky navbar */}
        <div className="sticky top-0 z-30 bg-mainBg/80 backdrop-blur-md border-b border-inputBorder/40">
          <div className="px-4 md:px-8 py-3">
            <Navbar title="Coupons" />
          </div>
        </div>

        <div className="px-4 md:px-8 py-6 max-w-[1400px] w-full mx-auto">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-3xl mb-6 bg-gradient-to-br from-secondary via-primary to-fadeBlue text-white p-6 md:p-8 shadow-[0_20px_60px_-20px_rgba(113,2,255,0.35)]">
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />
            <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-5">
              <div className="max-w-xl">
                <p className="text-xs uppercase tracking-wider text-white/70">Promotions</p>
                <h1 className="font-trykker text-3xl md:text-4xl mt-1 leading-tight">
                  Coupons.
                </h1>
                <p className="mt-2 text-sm md:text-base text-white/85 leading-relaxed">
                  {isLoading
                    ? "Loading your coupons…"
                    : stats.total === 0
                      ? "Create a coupon to share free access with students or parents."
                      : `${stats.total} coupon${stats.total > 1 ? "s" : ""} created · ${stats.totalUses} total redemption${stats.totalUses === 1 ? "" : "s"}.`}
                </p>
              </div>

              <div className="relative inline-flex items-center gap-3 rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur px-4 py-3">
                <span className="h-10 w-10 rounded-xl bg-white text-secondary flex items-center justify-center">
                  <HiOutlineTicket size={18} />
                </span>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-white/70">Redemptions</p>
                  <p className="text-sm font-semibold leading-tight">
                    {isLoading ? "—" : `${stats.totalUses} total`}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
            {statCards.map((s) => {
              const Icon = s.Icon as any;
              return (
                <div
                  key={s.label}
                  className="text-left group relative overflow-hidden rounded-2xl bg-white ring-1 ring-inputBorder/50 p-4 hover:ring-primary/40 hover:shadow-md transition"
                >
                  <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${s.tone} opacity-30 blur-xl pointer-events-none`} />
                  <span className={`h-9 w-9 rounded-xl bg-gradient-to-br ${s.tone} flex items-center justify-center`}>
                    <Icon size={16} />
                  </span>
                  <p className="mt-3 text-[11px] uppercase tracking-wider text-grey font-medium">{s.label}</p>
                  {isLoading ? (
                    <div className="mt-1.5 h-7 w-12 rounded-md bg-mainBg animate-pulse" />
                  ) : (
                    <p className="mt-0.5 font-trykker text-2xl text-black">{s.value}</p>
                  )}
                </div>
              );
            })}
          </section>

          {/* Main grid */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            <div className="lg:col-span-1 relative">
              <div className={couponClosed ? "pointer-events-none opacity-50 blur-sm" : ""}>
                <AddCoupon fetchCoupons={fetchCoupons} newCoupon={newCoupon} />
              </div>
              {couponClosed && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-white/90 backdrop-blur ring-1 ring-inputBorder/60 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-md pointer-events-auto">
                    <HiOutlineLockClosed className="text-grey" size={18} />
                    <span className="text-xs font-semibold text-greyBlack">Upgrade to create coupons</span>
                  </div>
                </div>
              )}
            </div>
            <div className="lg:col-span-2">
              <UpdateCoupon
                fetchCoupons={fetchCoupons}
                coupons={coupons || []}
                isLoading={isLoading}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Coupon;
