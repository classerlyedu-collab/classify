import React, { useEffect, useState } from "react";
import { FiX, FiUserPlus } from "react-icons/fi";
import { Post } from "../../../config/apiMethods";
import { displayMessage } from "../../../config";
import { FloatingInput } from "../../FloatingInput";

interface MyChildernModalProps {
    isVisible: boolean;
    onClose: () => void;
    studentName: any;
    setStudentName: any;
    onAdded?: () => void;
}

const MyChildernsModal: React.FC<MyChildernModalProps> = ({
    isVisible,
    onClose,
    studentName,
    setStudentName,
    onAdded,
}) => {
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!isVisible) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    const isEnabled = (studentName?.length ?? 0) >= 1 && !submitting;

    const handleAddStd = () => {
        if (!isEnabled) return;
        setSubmitting(true);
        Post("/addchild", { stdid: studentName })
            .then((d) => {
                if (d?.success) {
                    displayMessage(d.message, "success");
                    setStudentName("");
                    onAdded?.();
                    onClose();
                } else {
                    displayMessage(d?.message || "Could not add child", "error");
                }
            })
            .catch((err) => displayMessage(err.message, "error"))
            .finally(() => setSubmitting(false));
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label="Add child"
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm font-ubuntu"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && isEnabled) handleAddStd();
                }}
                className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden ring-1 ring-black/5 animate-[modalIn_220ms_ease-out]"
            >
                <style>{`@keyframes modalIn { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>

                {/* Header */}
                <div className="relative px-5 pt-5 pb-4 bg-gradient-to-br from-primary/10 to-secondary/10 border-b border-inputBorder/40">
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="absolute top-3 right-3 h-8 w-8 rounded-full text-greyBlack hover:text-black hover:bg-white flex items-center justify-center"
                    >
                        <FiX size={15} />
                    </button>
                    <div className="flex items-center gap-3">
                        <span className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center shadow-sm">
                            <FiUserPlus size={18} />
                        </span>
                        <div>
                            <h2 className="font-trykker text-lg text-black leading-none">
                                Add a child
                            </h2>
                            <p className="text-xs text-greyBlack mt-1">
                                Link your child's account to your dashboard.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="px-5 py-5">
                    <FloatingInput
                        label="Child code"
                        value={studentName || ""}
                        setValue={setStudentName}
                        autoComplete="off"
                        required
                    />
                    <p className="mt-2 ml-1 text-[11px] text-grey leading-snug">
                        Ask your child for the code shown on their profile (looks like
                        <span className="mx-1 font-mono text-greyBlack">1052-44</span>).
                    </p>
                </div>

                {/* Footer */}
                <div className="px-5 pb-5 pt-1 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 px-4 rounded-xl text-sm font-medium text-greyBlack hover:text-black hover:bg-mainBg focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleAddStd}
                        disabled={!isEnabled}
                        aria-busy={submitting}
                        className={`h-10 px-4 rounded-xl text-sm font-medium text-white inline-flex items-center gap-2 transition focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-1 ${isEnabled
                                ? "bg-gradient-to-r from-primary to-secondary hover:shadow-md hover:shadow-secondary/20"
                                : "bg-gradient-to-r from-primary to-secondary opacity-60 cursor-not-allowed"
                            }`}
                    >
                        {submitting && (
                            <span
                                aria-hidden
                                className="inline-block h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin"
                            />
                        )}
                        {submitting ? "Adding…" : "Add child"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MyChildernsModal;
