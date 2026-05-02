import React, { useEffect, useState } from "react";
import { displayMessage } from "../config";
import { UseStateContext } from "../context/ContextProvider";
import {
    HiOutlineCreditCard,
    HiOutlineSparkles,
    HiOutlineShieldCheck,
    HiOutlineLockClosed,
    HiOutlineAcademicCap,
    HiOutlineExclamationTriangle,
    HiOutlineArrowPath,
} from "react-icons/hi2";

interface SubscriptionRedirectProps {
    onSuccess?: () => void;
    onError?: () => void;
}

const SubscriptionRedirect: React.FC<SubscriptionRedirectProps> = ({ onSuccess, onError }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const { role } = UseStateContext();

    const redirectToSubscription = async () => {
        try {
            setIsLoading(true);
            setErrorMsg(null);
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${process.env.REACT_APP_API_BASE_URL || "http://localhost:8082"}/api/v1/payment/create-checkout-session`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({}),
                }
            );
            const data = await response.json();

            if (data.success) {
                window.location.href = data.data.url;
            } else {
                const msg = data.message || "Failed to create checkout session";
                setErrorMsg(msg);
                displayMessage(msg, "error");
                onError?.();
            }
        } catch (error: any) {
            const msg =
                error.response?.data?.message ||
                error.message ||
                "Error accessing subscription portal";
            setErrorMsg(msg);
            displayMessage(msg, "error");
            onError?.();
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (role !== "Student") {
            redirectToSubscription();
        } else {
            setIsLoading(false);
            onSuccess?.();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [role]);

    /* ------- Student: nothing to pay ------- */
    if (role === "Student") {
        return (
            <div className="min-h-screen w-full bg-mainBg flex items-center justify-center px-4 font-ubuntu">
                <div className="w-full max-w-md rounded-3xl bg-white ring-1 ring-inputBorder/50 shadow-xl p-8 text-center">
                    <div className="h-16 w-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center shadow-md shadow-teal-500/30 mb-4">
                        <HiOutlineAcademicCap size={28} />
                    </div>
                    <p className="text-[10px] uppercase tracking-wider text-grey font-bold inline-flex items-center gap-1 justify-center">
                        <HiOutlineSparkles size={10} className="text-secondary" />
                        You're all set
                    </p>
                    <h1 className="font-trykker text-xl md:text-2xl text-black mt-1.5 leading-tight">
                        No subscription needed
                    </h1>
                    <p className="text-sm text-grey mt-2 leading-relaxed max-w-xs mx-auto">
                        Students don't pay — you're linked to your parent or teacher account already.
                    </p>
                </div>
            </div>
        );
    }

    /* ------- Error ------- */
    if (!isLoading && errorMsg) {
        return (
            <div className="min-h-screen w-full bg-mainBg flex items-center justify-center px-4 font-ubuntu">
                <div className="w-full max-w-md rounded-3xl bg-white ring-1 ring-inputBorder/50 shadow-xl p-8 text-center">
                    <div className="h-16 w-16 mx-auto rounded-2xl bg-orangeBrown/10 ring-1 ring-orangeBrown/25 text-orangeBrown flex items-center justify-center mb-4">
                        <HiOutlineExclamationTriangle size={28} />
                    </div>
                    <h1 className="font-trykker text-xl md:text-2xl text-black leading-tight">
                        Couldn't open checkout
                    </h1>
                    <p className="text-sm text-grey mt-2 leading-relaxed max-w-xs mx-auto">
                        {errorMsg}
                    </p>
                    <button
                        type="button"
                        onClick={redirectToSubscription}
                        className="mt-5 inline-flex items-center gap-1.5 h-11 px-5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary to-secondary hover:shadow-md hover:shadow-secondary/25 transition"
                    >
                        <HiOutlineArrowPath size={15} />
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    /* ------- Loading / redirect ------- */
    return (
        <div className="min-h-screen w-full bg-mainBg flex items-center justify-center px-4 font-ubuntu">
            <div className="relative w-full max-w-lg rounded-3xl overflow-hidden bg-white ring-1 ring-inputBorder/50 shadow-2xl">
                {/* Gradient banner */}
                <div className="relative overflow-hidden bg-gradient-to-br from-secondary via-primary to-fadeBlue p-6 md:p-8 text-white">
                    <div
                        aria-hidden
                        className="absolute inset-0 opacity-[0.08]"
                        style={{
                            backgroundImage:
                                "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
                            backgroundSize: "28px 28px",
                        }}
                    />
                    <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/15 blur-2xl" />

                    <div className="relative flex items-center gap-4">
                        <div className="relative h-14 w-14 rounded-2xl bg-white/20 ring-1 ring-white/25 backdrop-blur flex items-center justify-center shadow-lg flex-shrink-0">
                            <HiOutlineCreditCard size={26} />
                            {/* Spinner ring around the icon */}
                            <span className="absolute inset-0 rounded-2xl border-2 border-white/40 border-t-white animate-spin" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wider text-white/80 font-bold inline-flex items-center gap-1">
                                <HiOutlineSparkles size={10} />
                                One moment
                            </p>
                            <h1 className="font-trykker text-2xl md:text-3xl mt-0.5 leading-tight">
                                Opening secure checkout
                            </h1>
                            <p className="mt-2 text-sm text-white/85 leading-relaxed">
                                We're handing you off to Stripe to choose your plan.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 md:p-7 space-y-4">
                    {/* Loading skeleton lines */}
                    <div className="rounded-2xl bg-mainBg/60 ring-1 ring-inputBorder/40 p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/15 text-secondary flex items-center justify-center flex-shrink-0">
                                <HiOutlineLockClosed size={16} />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1.5">
                                <div className="h-3 w-2/3 rounded bg-mainBg animate-pulse" />
                                <div className="h-2 w-1/2 rounded bg-mainBg animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* Trust strip */}
                    <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <li className="flex items-center gap-2 px-3 py-2 rounded-xl bg-mainBg/60 ring-1 ring-inputBorder/40">
                            <HiOutlineShieldCheck className="text-secondary flex-shrink-0" size={14} />
                            <span className="text-xs font-semibold text-greyBlack">Secure by Stripe</span>
                        </li>
                        <li className="flex items-center gap-2 px-3 py-2 rounded-xl bg-mainBg/60 ring-1 ring-inputBorder/40">
                            <HiOutlineLockClosed className="text-secondary flex-shrink-0" size={14} />
                            <span className="text-xs font-semibold text-greyBlack">Encrypted</span>
                        </li>
                        <li className="flex items-center gap-2 px-3 py-2 rounded-xl bg-mainBg/60 ring-1 ring-inputBorder/40">
                            <HiOutlineSparkles className="text-secondary flex-shrink-0" size={14} />
                            <span className="text-xs font-semibold text-greyBlack">Cancel anytime</span>
                        </li>
                    </ul>

                    <p className="text-[11px] text-grey text-center leading-relaxed">
                        If your browser doesn't redirect automatically,{" "}
                        <button
                            type="button"
                            onClick={redirectToSubscription}
                            className="font-semibold text-secondary hover:underline"
                        >
                            click here to try again
                        </button>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionRedirect;
